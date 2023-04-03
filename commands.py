from context import app
from extensions import db
import click
from flask.cli import with_appcontext

@click.command(name="initdb")
@with_appcontext
def initdb_command():
    """Initialize the database."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
    click.echo("Initialized the database.")

app.cli.add_command(initdb_command)

if __name__ == '__main__':
    app.cli()