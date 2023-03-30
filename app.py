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

# Configure logging
logging.basicConfig(level=logging.DEBUG)

load_dotenv()

app = Flask(__name__)

# Configure session
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# Configure session options
app.config['SESSION_TYPE'] = 'redis'  # Use Redis for storing session data

url = urlparse(os.environ.get("REDIS_URL"))
app.config['SESSION_REDIS'] = redis.Redis(host=url.hostname, port=url.port, password=url.password, ssl=True, ssl_cert_reqs=None) # connect to redis - via Heroku docs

app.config['SESSION_PERMANENT'] = False  # Session data is not permanent
app.config['SESSION_USE_SIGNER'] = True  # Sign the session cookie

# Initialize the Flask-Session extension
Session(app)

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
    Handle file upload and communicate with external API.

    Returns:
        Response: JSON response containing success status and either output_key or error message.
    """
    if request.method == 'POST':
        file = request.files['file']
        file_obj = BytesIO(file.read())  # create an in-memory file-like object from the file data

        if file:
            api_url = os.getenv('TUNE_URL')
            headers = {"Authorization": os.getenv('AUTH_HEADER')}  # Add the authentication token as a header

            response = requests.post(api_url, headers=headers, files={"input_file": file_obj})

            if response.status_code == 200:
                response_json = response.json()
                output_key = response_json["output_key"]
                user_ip = get_client_ip()
                session_id = str(uuid.uuid4())  # Generate a unique session ID
                redis_key = f"{user_ip}-{session_id}"  # Combine the IP address and session ID
                current_app.config['SESSION_REDIS'].set(redis_key, output_key)  # Store the output_key in Redis using the combined key
                logging.debug(f"Stored output_key in Redis: {output_key}")
                session['session_id'] = session_id  # Store the session ID in the user's session

                return jsonify({'success': True, 'output_key': output_key})
            else:
                return jsonify({'success': False, 'error': f'Response error: {response.status_code}'})

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

if __name__ == '__main__':
    app.run(debug=True)