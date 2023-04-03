from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()

# init flask_mail so we can use it in our app
mail = Mail()