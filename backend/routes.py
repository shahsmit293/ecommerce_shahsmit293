from flask import Flask, request, jsonify, Blueprint, redirect , url_for
from flask_cors import CORS, cross_origin
from models import db, User, Phones, Transaction # Adjust as per your project structure
import boto3
from functools import wraps
import os
from uuid import uuid4
from werkzeug.utils import secure_filename
import json
from uuid import uuid4
from dotenv import load_dotenv
from stream_chat import StreamChat
import paypalrestsdk
api = Blueprint('api', __name__)
load_dotenv()
stream_chat_api_key = os.getenv("stream_chat_api_key")
stream_chat_api_secret =os.getenv("stream_chat_api_secret")

frontend_url=os.getenv("REACT_FRONTEND_URL")

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
            image_url=uploaded_files,
            paypal_email=phoneDetails['paypal_email'],
            first_name=phoneDetails['first_name'],
            last_name=phoneDetails['last_name'],
            seller_contact_number=phoneDetails['seller_contact_number']
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


@api.route('/get_stream_token', methods=['POST'])
def get_stream_token():
    data = request.get_json()
    activeuserid = data.get('activeuserid')

    if not activeuserid:
        return jsonify({'error': 'activeuserid is required'}), 400

    chat_client = StreamChat(api_key=stream_chat_api_key, api_secret=stream_chat_api_secret)
    token = chat_client.create_token(activeuserid)

    return jsonify({'token': token})

@api.route('/check_and_create_channel', methods=['POST'])
def check_and_create_channel():
    data = request.get_json()
    activeuserid = data.get('activeuserid')
    targetuserid = data.get('targetuserid')

    if not activeuserid or not targetuserid:
        return jsonify({'error': 'activeuserid and targetuserid are required'}), 400

    chat_client = StreamChat(api_key=stream_chat_api_key, api_secret=stream_chat_api_secret)

    # Standardize channel ID to ensure the smaller user ID comes first
    user_ids = sorted([str(activeuserid), str(targetuserid)])
    channel_id = f"{user_ids[0]}-{user_ids[1]}"
    channel = chat_client.channel('messaging', channel_id)

    try:
        # Query the channel state to see if it exists
        channel_state = channel.query()
        return jsonify({'channel': channel_state['channel']})
    except Exception:
        # Channel doesn't exist, create a new one
        pass

    # Create new channel
    try:
        members = [str(activeuserid), str(targetuserid)]
        message = {"text": "You both are connected now.Enjoy our service."}
        response = channel.create(user_id=str(activeuserid), data={"members": members, "created_by_id": str(activeuserid)})
        channel.send_message(message, user_id=str(activeuserid))
        return jsonify({'channel': response['channel']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@api.route('/get_user_id', methods=['POST'])
def get_user_id():
    data = request.json
    useremail = data.get('useremail')
    if not useremail:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=useremail).first()
    if user:
        return jsonify({"user_id": user.id})
    else:
        return jsonify({"error": "User not found"}), 404


@api.route('/get_channels', methods=['POST'])
def get_channels():
    data = request.get_json()
    activeuserid = data.get('activeuserid')

    if not activeuserid:
        return jsonify({'error': 'activeuserid is required'}), 400

    chat_client = StreamChat(api_key=stream_chat_api_key, api_secret=stream_chat_api_secret)

    try:
        # Query channels with specific type and filter by members
        response = chat_client.query_channels({
            'type': 'messaging',
            'members': { '$in': [str(activeuserid)] }
        })
        
        # Extract channel objects from the response
        channels = response.get('channels', [])
        print(channels)
        filtered_channels = []
        member_details = []

        # Filter channels where activeuserid is a member and extract member details
        for channel_info in channels:
            channel = channel_info.get('channel', {})
            members = channel_info.get('members', [])

            if any(member['user_id'] == str(activeuserid) for member in members):
                filtered_channels.append(channel.get('id', ''))
                member_details.extend(members)

        return jsonify({'channels': filtered_channels, 'members': member_details})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Configure PayPal SDK using environment variables
paypalrestsdk.configure({
    "mode": os.getenv("PAYPAL_MODE"),  # 'sandbox' or 'live'
    "client_id": os.getenv("PAYPAL_CLIENT_ID"),
    "client_secret": os.getenv("PAYPAL_CLIENT_SECRET")
})

@api.route('/create-payment', methods=['POST'])
def create_payment():
    data = request.get_json()  # Parse the JSON payload
    price = data.get('price')  # Get price from the request body
    sellerpaypalemail =data.get('sellerpaypalemail')
    buyer_id=data.get('buyer_id')
    phone_sell_id=data.get('phone_sell_id')
    currency = "USD"  # Fixed currency

    if not price:
        return jsonify({'error': 'Price is required'}), 400
    
    custom_data = {
        "sellerpaypalemail": sellerpaypalemail,
        "buyer_id": buyer_id,
        "phone_sell_id": phone_sell_id,
    }
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": [{
            "amount": {
                "total": price,  # Use the dynamic price
                "currency": currency
            },
            "description": "Payment for product",
            "custom": json.dumps(custom_data)
        }],
        "redirect_urls": {
            "return_url": f"{frontend_url}paymentsuccess",
            "cancel_url": f"{frontend_url}paymentcancel"
        }
    })

    if payment.create():
        for link in payment['links']:
            if link['rel'] == 'approval_url':
                approval_url = str(link['href'])
                response = jsonify({'approval_url': approval_url})
                response.headers['Content-Type'] = 'application/json'
                return response
    else:
        response = jsonify({'error': payment.error})
        response.headers['Content-Type'] = 'application/json'
        return response, 500

def create_payout(sellerpaypalemail, amount):
    payout = paypalrestsdk.Payout({
        "sender_batch_header": {
            "email_subject": "You have a payment",
            "email_message": "You have received a payment"
        },
        "items": [{
            "recipient_type": "EMAIL",
            "amount": {
                "value": amount,
                "currency": "USD"
            },
            "receiver": sellerpaypalemail,
            "note": "Thank you for your business.",
            "sender_item_id": "item_1"
        }]
    })

    if payout.create():
        print(payout)
        payout_batch_id = payout['batch_header']['payout_batch_id']
        print(payout_batch_id)
        return {'status': 'Payout created successfully','payout_batch_id': payout_batch_id}
    else:
        return {'error': payout.error}


@api.route('/payment-success', methods=['POST'])
def payment_success():
    data = request.get_json()
    payment_id = data.get('paymentId')
    payer_id = data.get('payerId')
    address=data.get('address')
    if not payment_id or not payer_id:
        return jsonify({'error': 'Missing paymentId or PayerID'}), 400

    payment = paypalrestsdk.Payment.find(payment_id)

    try:
        if payment.execute({"payer_id": payer_id}):
            payment_transaction_id = payment.transactions[0].related_resources[0].sale.id

            payment_amount = float(payment.transactions[0].amount.total)
            payout_amount = payment_amount - 10

            custom_data = json.loads(payment.transactions[0].custom)

            sellerpaypalemail = custom_data.get('sellerpaypalemail')
            buyer_id = custom_data.get('buyer_id')
            phone_sell_id = custom_data.get('phone_sell_id')
            

            payout_result = create_payout(sellerpaypalemail, payout_amount)
            payout_transaction_id=payout_result.get('payout_batch_id')
            new_transaction = Transaction(
                buyer_id=buyer_id,
                phone_sell_id=phone_sell_id,
                payment_amount=payment_amount,
                payout_amount=payout_amount,
                shipping_address=address,
                payment_transaction_id=payment_transaction_id,
                payout_transaction_id=payout_transaction_id
            )
            db.session.add(new_transaction)
            db.session.commit()

            return jsonify({'status': 'Payment successful', 'payout_result': payout_result})
        else:
            return jsonify({'status': 'Payment failed', 'error': payment.error}), 500
    except Exception as e:
        return jsonify({'status': 'Payment error', 'error': str(e)}), 500

@api.route('/get-payment-details', methods=['GET'])
def get_payment_details():
    payment_id = request.args.get('paymentId')
    
    if not payment_id:
        return jsonify({'error': 'Missing paymentId'}), 400

    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        price = payment.transactions[0].amount.total  # Adjust based on your data structure
        return jsonify({'price': price})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@api.route('/error')
def error_page():
    return "Payment error."