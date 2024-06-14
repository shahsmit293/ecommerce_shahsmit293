from flask import Flask, request, jsonify, Blueprint
from models import db, User
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API Blueprint
CORS(api, resources={r"/api/*": {"origins": "*"}})

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
    if not body or 'name' not in body:
        return jsonify({"error": "Name is required"}), 400

    details = User(name=body["name"])
    db.session.add(details)
    db.session.commit()
    return jsonify(details.serialize()), 201

@api.route('/', methods=['GET'])
def welcome_message():
    return jsonify({"message": "Welcome to our API!"}), 200
