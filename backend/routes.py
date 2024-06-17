from flask import Flask, request, jsonify, Blueprint
from models import db, User,address
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
    details = User(email=body["email"],amount=body["amount"])
    db.session.add(details)
    db.session.commit()
    return jsonify(details.serialize()), 201

@api.route('/', methods=['GET'])
def welcome_message():
    return jsonify({"message": "Welcome to our API!"}), 200

@api.route('/address', methods=['POST', 'OPTIONS'])
def new_address():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        return ('', 204, headers)

    body = request.json
    if not body or 'address' not in body:
        return jsonify({"error": "address is required"}), 400

    details = address(address=body["address"])
    db.session.add(details)
    db.session.commit()
    return jsonify(details.serialize()), 201