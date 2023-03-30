from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory, session
from flask_session import Session
from io import BytesIO
from dotenv import load_dotenv
from tempfile import mkdtemp
import os, requests

load_dotenv()

app = Flask(__name__)

# Configure session
app.secret_key = os.getenv('FLASK_SECRET_KEY')

app.config['SESSION_TYPE'] = 'filesystem'  # Use the filesystem for storing session data
app.config['SESSION_FILE_DIR'] = mkdtemp()  # Temporary directory for session files
app.config['SESSION_PERMANENT'] = False     # Session data is not permanent
app.config['SESSION_USE_SIGNER'] = True     # Sign the session cookie
app.config['SESSION_FILE_THRESHOLD'] = 500  # Maximum number of session files before cleanup

# Initialize the Flask-Session extension
Session(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']

        # create an in-memory file-like object from the file data
        file_obj = BytesIO(file.read())

        if file:
            api_url = os.getenv('TUNE_URL')
            # Add the authentication token as a header
            headers = {
                "Authorization": os.getenv('AUTH_HEADER')
            }

            response = requests.post(api_url, headers=headers, files={"input_file": file_obj})

            if response.status_code == 200:
                response_json = response.json()
                output_key = response_json["output_key"]
                session['output_key'] = output_key
                return jsonify({'success': True, 'output_key': output_key})
            else:
                return jsonify({'success': False, 'error': f'Response error: {response.status_code}'})

    return jsonify({'success': False, 'error': 'Invalid request method'})

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

def update_query_interface():
    with open('query.html', 'r') as f:
        query_html = f.read()
    return query_html

@app.route('/query')
def query_interface():
    return update_query_interface()

@app.route('/query_llm', methods=['POST'])
def interact_llm():
    llm_api_url = os.getenv('QUERY_URL')

    # get the output key from the session
    output_key = session.get('output_key')

    # get the user input from the form data
    user_input = request.form['prompt']

    # create the payload to send to the API
    payload = {
        "output_key": output_key,
        "user_input": user_input
    }

    # make the request to the LLM API
    response = requests.post(llm_api_url, json=payload)

    if response.status_code == 200:
        response_json = response.json()
        llm_result = response_json['body']

        return jsonify({'success': True, 'result': llm_result})
    else:
        return jsonify({'success': False, 'error': f'Response error: {response.status_code}'})
    
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response


if __name__ == '__main__':
    app.run(debug=True)