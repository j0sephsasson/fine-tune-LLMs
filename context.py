from flask import Flask
import os, redis 
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure session
    app.secret_key = os.getenv('FLASK_SECRET_KEY')

    # Configure session options
    app.config['SESSION_TYPE'] = 'redis'  # Use Redis for storing session data

    url = urlparse(os.environ.get("REDIS_URL"))
    app.config['SESSION_REDIS'] = redis.Redis(host=url.hostname, port=url.port, password=url.password, ssl=True, ssl_cert_reqs=None) # connect to redis - via Heroku docs

    app.config['SESSION_PERMANENT'] = False  # Session data is not permanent
    app.config['SESSION_USE_SIGNER'] = True  # Sign the session cookie
    
    return app

app = create_app()