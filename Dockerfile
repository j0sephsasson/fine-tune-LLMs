FROM amazon/aws-lambda-python:3.8

COPY llm/tune.py .
COPY llm/lambda_function.py .
COPY requirements.txt .

RUN pip install -r requirements.txt

CMD ["lambda_function.lambda_handler"]