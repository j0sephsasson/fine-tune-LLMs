# db_models.py
from flask_sqlalchemy import SQLAlchemy
from extensions import db

class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __init__(self, email):
        self.email = email

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    feedback = db.Column(db.Text, nullable=False)

    def __init__(self, email, feedback):
        self.email = email
        self.feedback = feedback