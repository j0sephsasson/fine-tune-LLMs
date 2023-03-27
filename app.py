from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from llm.tune import tune_llm
from llm.query import query_llm
import os

if not os.path.exists('sourcedata'):
    os.makedirs('sourcedata')

if not os.path.exists('indexdata'):
    os.makedirs('indexdata')

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join('sourcedata', filename))
            tune_llm()
            return jsonify({'success': True})
    return jsonify({'success': False})

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
    prompt = request.form['prompt']
    result = query_llm(prompt)
    return {'result': result}

if __name__ == '__main__':
    app.run(debug=True)