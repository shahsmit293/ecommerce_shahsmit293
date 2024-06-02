from flask import Flask, request, jsonify, Blueprint
from models import db, User
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/addname', methods=['POST'])
def handle_name():
    body = request.json
    if not body or 'name' not in body:
        return jsonify({"error": "Name is required"}), 400

    details = User(name=body["name"])
    db.session.add(details)
    db.session.commit()
    return jsonify(details.serialize())
