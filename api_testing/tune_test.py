import json
import requests
import os
from dotenv import load_dotenv

load_dotenv('<path-to-env>.env')

api_url = os.getenv('TUNE_URL')

# Replace 'file.txt' with the path to your text file
file_path = "<path-to-txt>.txt"

# Add the authentication token as a header
headers = {
    "Authorization": os.getenv('AUTH_HEADER')
}

# Use the 'files' parameter to send the file with the request
with open(file_path, "rb") as file:
    response = requests.post(api_url, headers=headers, files={"input_file": file})

if response.status_code == 200:
    response_json = response.json()
    output_key = response_json["output_key"]
    print("JSON output key:", output_key)
else:
    print("Error:", response.status_code, response.text)