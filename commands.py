from context import app
from db_models import db
import click
from flask.cli import with_appcontext

@click.command("initdb")
@with_appcontext
def initdb_command():
    """Initialize the database."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
    click.echo("Initialized the database.")