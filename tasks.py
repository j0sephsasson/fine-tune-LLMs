import requests
import os
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()

def process_file(file_obj, redis_key, redis_instance):
    api_url = os.getenv('TUNE_URL')
    headers = {"Authorization": os.getenv('AUTH_HEADER')}

    file_obj = BytesIO(file_obj)

    response = requests.post(api_url, headers=headers, files={"input_file": file_obj})

    if response.status_code == 200:
        response_json = response.json()
        output_key = response_json["output_key"]

        redis_instance.set(redis_key, output_key)  # Store the output_key in Redis using the combined key

        return output_key
    else:
        return None