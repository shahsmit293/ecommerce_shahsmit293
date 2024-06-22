from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS, cross_origin
from models import db, User, Phones  # Adjust as per your project structure
import boto3
from awsConfig import aws_config
from functools import wraps

api = Blueprint('api', __name__)

# Allow CORS requests to this API Blueprint
CORS(api, supports_credentials=True, origins='*')  # Adjust origins as needed

cognito_client = boto3.client('cognito-idp', region_name=aws_config["region"])

# Wrapper function to check for access token
def require_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        access_token = request.cookies.get('accessToken')
        if not access_token:
            return jsonify({"error": "Access token not found"}), 401
        # Optionally, verify the token or decode it to extract more information if needed
        return func(*args, **kwargs)
    return wrapper

@api.route('/', methods=['GET'])
def welcome_message():
    return jsonify({"message": "Welcome to our API!"}), 200

@api.route('/confirm_signup', methods=['POST'])
@cross_origin()  # Allow CORS for this route
def confirm_signup():
    try:
        body = request.json
        email = body.get('email')

        # Validate inputs
        if not email:
            return jsonify({"error": "Email is missing"}), 400

        # If successful, continue to insert email into database
        user = User(email=email)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Signup confirmed and email added to database"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/add_phone', methods=['POST', 'OPTIONS'])
@cross_origin()  # Allow CORS for this route
def add_phone():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        }
        return ('', 200, headers)  # Return HTTP OK status for OPTIONS request
    
    try:
        body = request.json
        price = body.get('price')
        phonetype = body.get('phonetype')
        color = body.get('color')
        storage = body.get('storage')
        carrier = body.get('carrier')
        model = body.get('model')
        condition = body.get('condition')
        seller = body.get('seller')
        location = body.get('location')
        IMEI = body.get('IMEI')
        user_email = body.get('user_email')

        # Validate required inputs
        if not (price and phonetype and color and model and condition and seller and location and user_email):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new Phones object
        new_phone = Phones(price=price, phonetype=phonetype, color=color, storage=storage, carrier=carrier,
                           model=model, condition=condition, seller=seller, location=location,
                           IMEI=IMEI, user_email=user_email)

        # Add to session and commit
        db.session.add(new_phone)
        db.session.commit()

        return jsonify(new_phone.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/phones', methods=['GET'])
@cross_origin()  # Allow CORS for this route
def get_phones():
    try:
        # Query all phones from the database
        phones = Phones.query.all()

        # Serialize the list of phones to JSON
        phones_list = [phone.serialize() for phone in phones]

        return jsonify(phones_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/phones/<int:sell_id>', methods=['GET'])
@cross_origin()  # Allow CORS for this route
def get_each_phone(sell_id):
    try:
        phones = Phones.query.filter_by(id=sell_id).all()
        
        # Serialize the list of phones to JSON
        phones_list = [phone.serialize() for phone in phones]

        return jsonify(phones_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500