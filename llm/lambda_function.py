import boto3
import json
import os
from tune import tune_llm

os.environ['TRANSFORMERS_CACHE'] = '/tmp/transformers_cache'

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    input_bucket = 'fine-tune-landing-page'
    output_bucket = 'fine-tune-landing-output'
    input_directory = 'sourcedata'
    output_directory = 'indexdata'
    input_key = 'ashling.txt'
    output_key = 'output.json'

    # Download the input file from S3 and save it in a temporary directory
    os.makedirs(f'/tmp/{input_directory}', exist_ok=True)
    s3.download_file(input_bucket, input_key, f'/tmp/{input_directory}/{input_key}')

    # Call the tune_llm function
    tune_llm(f'/tmp/{input_directory}', f'/tmp/{output_directory}/{output_key}')

    # Upload the output file to S3
    s3.upload_file(f'/tmp/{output_directory}/{output_key}', output_bucket, output_key)

    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete. Output saved to S3.')
    }
