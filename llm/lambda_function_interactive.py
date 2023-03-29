import boto3
import json
import os
from query import query_llm

os.environ['TRANSFORMERS_CACHE'] = '/tmp/transformers_cache'

def interact_with_llm(event, context):
    output_key = event['output_key']
    
    s3 = boto3.client('s3')
    output_bucket = 'fine-tune-landing-output'
    
    # Download the JSON file from S3
    index_file = f'/tmp/{output_key}'
    s3.download_file(output_bucket, output_key, index_file)
    
    # Query the LLM with the user's input
    user_input = event['user_input']
    result = query_llm(user_input, index_file)

    return {
        'statusCode': 200,
        'body': str(result)
    }
