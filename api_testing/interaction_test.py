import json
import requests
import os
from dotenv import load_dotenv

load_dotenv('<path-to-env>.env')

llm_api_url = os.getenv('QUERY_URL')

# Use the output_key from the previous step
output_key = "<key>.json"

# Set the user_input for the LLM
user_input = "What is Ashling Partners?"

payload = {
    "output_key": output_key,
    "user_input": user_input
}

response = requests.post(llm_api_url, json=payload)

if response.status_code == 200:
    response_json = response.json()
    print("LLM result:", response_json['body'])
else:
    print("Error:", response.status_code, response.text)
