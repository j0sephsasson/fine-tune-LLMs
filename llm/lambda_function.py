import boto3
import json
import os
import base64
from datetime import datetime
from tune import tune_llm

os.environ['TRANSFORMERS_CACHE'] = '/tmp/transformers_cache'

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    input_bucket = 'fine-tune-landing-page'
    output_bucket = 'fine-tune-landing-output'
    input_key = f'{datetime.now().strftime("%Y%m%d%H%M%S%f")}.txt'
    output_key = f'{os.path.splitext(input_key)[0]}.json'
    
    input_directory = f'sourcedata/{input_key}'
    output_directory = f'indexdata/{output_key}'

    # Decode and save the input file from the request body
    input_content = base64.b64decode(event['body']).decode('utf-8')
    os.makedirs(f'/tmp/{input_directory}', exist_ok=True)
    with open(f'/tmp/{input_directory}', 'w') as f:
        f.write(input_content)

    # Call the tune_llm function
    tune_llm(f'/tmp/{input_directory}', f'/tmp/{output_directory}')

    # Upload the output file to S3
    s3.upload_file(f'/tmp/{output_directory}', output_bucket, output_key)

    # Return the path to the output file and the output_key in the response body
    response_body = {
        'output_path': f's3://{output_bucket}/{output_key}',
        'output_key': output_key
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response_body)
    }