import boto3
import json
import os
from io import BytesIO
import base64
from datetime import datetime
from tune import tune_llm

os.environ['TRANSFORMERS_CACHE'] = '/tmp/transformers_cache'

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    input_bucket = 'fine-tune-landing-page'
    output_bucket = 'fine-tune-landing-output'

    # Use the file extension in the input_key
    file_ext = event["queryStringParameters"]["file_ext"]
    input_key = f'{datetime.now().strftime("%Y%m%d%H%M%S%f")}{file_ext}'
    output_key = f'{os.path.splitext(input_key)[0]}.json'

    input_directory = f'sourcedata/{input_key}'
    output_directory = f'indexdata/{output_key}'

    # Use BytesIO to handle both text and binary file types
    input_content = BytesIO(base64.b64decode(event['body']))
    os.makedirs(f'/tmp/{input_directory}', exist_ok=True)
    with open(f'/tmp/{input_directory}/{input_key}', 'wb') as f:
        f.write(input_content.read())

    tune_llm(f'/tmp/{input_directory}', f'/tmp/{output_directory}/{output_key}')

    s3.upload_file(f'/tmp/{output_directory}/{output_key}', output_bucket, output_key)

    response_body = {
        'output_path': f's3://{output_bucket}/{output_key}',
        'output_key': output_key
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response_body)
    }
