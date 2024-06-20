from flask import Flask, request, jsonify, Blueprint
from models import db, User
from flask_cors import CORS
import boto3
from awsConfig import aws_config
api = Blueprint('api', __name__)

# Allow CORS requests to this API Blueprint
CORS(api, resources={r"/api/*": {"origins": "*"}})

cognito_client = boto3.client('cognito-idp', region_name=aws_config["region"])

@api.route('/addname', methods=['POST', 'OPTIONS'])
def handle_name():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        return ('', 204, headers)
    body = request.json
    details = User(email=body["email"])
    db.session.add(details)
    db.session.commit()
    return jsonify(details.serialize()), 201

@api.route('/', methods=['GET'])
def welcome_message():
    return jsonify({"message": "Welcome to our API!"}), 200

@api.route('/confirm_signup', methods=['POST'])
def confirm_signup():
    try:
        body = request.json
        email = body.get('email')

        # Validate inputs
        if not email:
            return jsonify({"error": "Email  missing"}), 400

        # If successful, continue to insert email into database
        user = User(email=email)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Signup confirmed and email added to database"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500