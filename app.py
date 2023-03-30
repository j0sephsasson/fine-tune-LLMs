from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory, session
from io import BytesIO
from dotenv import load_dotenv
import os, requests

app = Flask(__name__)

load_dotenv()

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

    # get the output key from the frontend
    output_key = request.form.get('output_key')

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


if __name__ == '__main__':
    app.run(debug=True)