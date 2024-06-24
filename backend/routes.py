from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS, cross_origin
from models import db, User, Phones  # Adjust as per your project structure
import boto3
from functools import wraps
import os
from uuid import uuid4
from werkzeug.utils import secure_filename
import json
from uuid import uuid4
from dotenv import load_dotenv

api = Blueprint('api', __name__)

s3_bucket_name=os.getenv("s3_bucket_name")
aws_access_key=os.getenv("aws_access_key")
aws_secret_key=os.getenv("aws_secret_key")
region=os.getenv("region")
session = boto3.Session(
                aws_access_key_id=os.getenv("aws_access_key"),
                aws_secret_access_key=os.getenv("aws_secret_key"),
                region_name=os.getenv("region")
            )
s3 = session.client('s3')
# Allow CORS requests to this API Blueprint
CORS(api, supports_credentials=True, origins='*')  # Adjust origins as needed

cognito_client = boto3.client('cognito-idp', region_name=os.getenv("region"))

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
@cross_origin()
def add_phone():
    try:
        body = request.form.get('phoneDetails')
        phoneDetails = json.loads(body)
        
        # Ensure user exists
        user_email = phoneDetails.get('user_email')
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get the last ID from Phones table
        last_phone = Phones.query.order_by(Phones.id.desc()).first()
        next_id = last_phone.id + 1 if last_phone else 1

        # Handle file uploads to S3 and store URLs in database
        folder_name = f"{user.id}_{secure_filename(user_email)}_sellerID_{next_id}"
        uploaded_files = []
        for file in request.files.getlist('images'):
            filename = secure_filename(file.filename)
            file_key = os.path.join(folder_name, filename)

            # Upload file to S3
            s3.upload_fileobj(file, os.getenv("s3_bucket_name"), file_key, ExtraArgs={'ContentType': file.content_type})

            # Form the URL for the uploaded file
            file_url = f"https://{s3_bucket_name}.s3.{region}.amazonaws.com/{file_key}"
            uploaded_files.append(file_url)
        
        # Create new Phone instance and commit to database
        new_phone = Phones(
            price=phoneDetails['price'],
            phonetype=phoneDetails['phonetype'],
            color=phoneDetails['color'],
            storage=phoneDetails['storage'],
            carrier=phoneDetails['carrier'],
            model=phoneDetails['model'],
            condition=phoneDetails['condition'],
            seller=phoneDetails['seller'],
            location=phoneDetails['location'],
            IMEI=phoneDetails['IMEI'],
            user_email=user_email,
            image_url=uploaded_files  # List of URLs for uploaded images
        )

        db.session.add(new_phone)
        db.session.commit()

        return jsonify({"message": "Phone added successfully", "phone": new_phone.serialize()}), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to add phone"}), 500

    
@api.route('/phones', methods=['GET'])
@cross_origin() 
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
@cross_origin() 
def get_each_phone(sell_id):
    try:
        phones = Phones.query.filter_by(id=sell_id)
        
        # Serialize the list of phones to JSON
        phones_list = [phone.serialize() for phone in phones]

        return jsonify(phones_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


