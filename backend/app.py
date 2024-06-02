"""
This module takes care of starting the API Server, Loading the DB, and Adding the endpoints
"""
import os
from flask import Flask
from flask_migrate import Migrate
from models import db
from routes import api
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database configuration
db_url = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

Migrate(app, db, compare_type=True)

db.init_app(app)

# Add all endpoints from the API with a "api" prefix
app.register_blueprint(api,url_prefix='/api')

# This only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=PORT, debug=True)
