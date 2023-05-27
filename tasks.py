import os
import requests
import logging
from io import BytesIO
from context import app
from redis import Redis
from dotenv import load_dotenv
from base64 import b64encode
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)

load_dotenv()

def process_file(file_contents, file_ext, redis_key):
    api_url = os.getenv('TUNE_URL')
    headers = {"Authorization": os.getenv('AUTH_HEADER')}
    
    file_obj = BytesIO(file_contents)
    
    # Add file_ext as a parameter in the API URL
    api_url = f"{api_url}?file_ext={file_ext}"
    
    response = requests.post(api_url, headers=headers, files={"input_file": file_obj})

    output_key = None

    if response.status_code == 200:
        response_json = response.json()
        output_key = response_json["output_key"]

        logging.debug(f"Retrieved output key from AWS lambda: {output_key}")

    return {'redis_key': redis_key, 'output_key': output_key}
