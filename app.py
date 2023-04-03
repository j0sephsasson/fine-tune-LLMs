from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory, session, current_app
from flask_session import Session
from flask_limiter.util import get_remote_address
from io import BytesIO
from dotenv import load_dotenv
from tempfile import mkdtemp
from urllib.parse import urlparse
import os, requests
import redis
import logging, uuid
from rq import Queue
from rq.job import NoSuchJobError
from worker import r
from rq.job import Job
from tasks import process_file
from context import app
from flask_mail import Message
from db_models import Email, Feedback
from extensions import db, mail
from commands import initdb_command

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize env vars
load_dotenv()

# Initialize the Flask-Session extension
Session(app)

# Initialize RQ
q = Queue(connection=r)

# Initialize mail / DB
mail.init_app(app)
db.init_app(app)

def get_client_ip():
    """
    Get client's IP address from request headers or remote address.

    Returns:
        str: Client's IP address.
    """
    if 'X-Forwarded-For' in request.headers:
        return request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
    else:
        return request.remote_addr

@app.route('/')
def index():
    """
    Render the main index page.

    Returns:
        str: Rendered index.html template.
    """
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    """
    Handle file upload and initiate processing.

    Accepts a file as a form-data input, enqueues a process_file task for the uploaded file, and associates
    the file with a session. Returns the job ID for the enqueued task and a success status.

    Returns:
        Response: JSON response containing success status and either the job ID or an error message.
    """
    if request.method == 'POST':
        file = request.files['file']
        file_contents = file.read()

        if file:
            user_ip = get_client_ip()
            session_id = str(uuid.uuid4())

            redis_key = f"{user_ip}-{session_id}"  # Combine the IP address and session ID

            # Enqueue the process_file task
            job = q.enqueue(process_file, file_contents, redis_key)
            session['session_id'] = session_id
            return jsonify({'success': True, 'job_id': job.id})
        else:
            return jsonify({'success': False, 'error': 'No file provided'})

    return jsonify({'success': False, 'error': 'Invalid request method'})

@app.route('/js/<path:path>')
def send_js(path):
    """
    Serve JavaScript files.

    Args:
        path (str): Path to the JavaScript file.

    Returns:
        Response: Served JavaScript file.
    """
    return send_from_directory('js', path)

def update_query_interface():
    """
    Read and return the contents of the 'query.html' file.

    Returns:
        str: Contents of 'query.html' file.
    """
    with open('query.html', 'r') as f:
        query_html = f.read()
    return query_html

@app.route('/query')
def query_interface():
    """
    Render the query interface page.

    Returns:
        str: Rendered query.html content.
    """
    return update_query_interface()

@app.route('/query_llm', methods=['POST'])
def interact_llm():
    """
    Handle interaction with the language model API.

    Returns:
        Response: JSON response containing success status and either the result or error message.
    """
    llm_api_url = os.getenv('QUERY_URL')

    user_ip = get_client_ip()  # Get the user's IP address
    session_id = session.get('session_id')  # Get the session ID from the user's session
    if session_id is None:
        return "No session found. Please upload a file first.", 400

    redis_key = f"{user_ip}-{session_id}"  # Combine the IP address and session ID
    output_key = current_app.config['SESSION_REDIS'].get(redis_key)  # Retrieve the output_key from Redis using the combined key

    if output_key is None:
        return "No output key found. Please upload a file first.", 400

    output_key = output_key.decode('utf-8')

    logging.debug(f"Retrieved output_key from Redis: {output_key}")

    user_input = request.form['prompt']  # get the user input from the form data

    payload = {
        "output_key": output_key,
        "user_input": user_input
    }  # create the payload to send to the API

    response = requests.post(llm_api_url, json=payload)  # make the request to the LLM API

    if response.status_code == 200:
        response_json = response.json()
        llm_result = response_json['body']

        return jsonify({'success': True, 'result': llm_result})
    else:
        return jsonify({'success': False, 'error': f'Response error: {response.status_code}'})

@app.after_request
def add_header(response):
    """
    Add headers to disable caching.

    Args:
        response (Response): The response object.

    Returns:
        Response: The response object with additional headers.
    """
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/job_status/<job_id>', methods=['GET'])
def job_status(job_id):
    try:
        job = q.fetch_job(job_id)
    except NoSuchJobError:
        return jsonify({"status": "not_found"})

    if job.is_failed:
        return jsonify({"status": "failed"})
    elif job.is_finished:
        return jsonify({"status": "finished"})
    else:
        return jsonify({"status": "pending"})
    
@app.route('/subscribe', methods=['POST'])
def subscribe():
    if request.method == 'POST':
        email = request.form['email']

        if email:
            new_email = Email(email=email)
            db.session.add(new_email)
            db.session.commit()
            return jsonify({'success': True, 'message': 'You have successfully subscribed'})
        else:
            return jsonify({'success': False, 'error': 'Please enter your email'})

    return jsonify({'success': False, 'error': 'Invalid request method'})

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    if request.method == 'POST':
        email = request.form['email']
        feedback = request.form['feedback']

        if email and feedback:
            new_feedback = Feedback(email=email, feedback=feedback)
            db.session.add(new_feedback)
            db.session.commit()

            msg = Message("New Feedback",
                          recipients=[os.getenv('MAIL_USERNAME')])
            msg.body = f"From: {email}\n\nFeedback: {feedback}"
            mail.send(msg)

            msg = Message("Thank You!",
                          recipients=[str(email)])
            msg.body = "Thank you for providing your valuable feedback!"
            mail.send(msg)

            return jsonify({'success': True, 'message': 'Thank you for your feedback'})
        else:
            return jsonify({'success': False, 'error': 'Please fill out all fields'})

    return jsonify({'success': False, 'error': 'Invalid request method'})

if __name__ == '__main__':
    app.run(debug=True)