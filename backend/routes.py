from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS, cross_origin
from models import db, User, Phones, Transaction, Cart, Favorite
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
import redis
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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

redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT")
redis_password = os.getenv("REDIS_PASSWORD")

# AWS SNS configuration
sns_client = boto3.client('sns', region_name=os.getenv('region'))
buyer_sns_topic_arn = os.getenv('SNS_TOPIC_BUYER_ARN')
seller_sns_topic_arn = os.getenv('SNS_TOPIC_SELLER_ARN')

# AWS SQS configuration
sqs_client = boto3.client('sqs', region_name=os.getenv('region'))
buyer_sqs_queue_url = os.getenv('SQS_BUYER_URL')
seller_sqs_queue_url = os.getenv('SQS_SELLER_URL')

# Initialize Redis client
redis_client = redis.StrictRedis(
    host=redis_host,
    port=redis_port,
    password=redis_password,
    ssl=True,
    decode_responses=True
)

# redis_client = redis.StrictRedis(
#     host=redis_host,
#     port=redis_port,
#     password=redis_password if redis_password != "None" else None,
#     decode_responses=True
# )

def cache_key(*args, **kwargs):
    """ Generate a unique cache key based on request arguments. """
    return json.dumps({'args': args, 'kwargs': kwargs})

def cache_get(key):
    """ Retrieve data from cache. """
    return redis_client.get(key)

def cache_set(key, value, timeout=300):
    """ Store data in cache with expiration. """
    redis_client.setex(key, timeout, value)

def cache_delete(key):
    """ Delete a key from cache. """
    redis_client.delete(key)


# Allow CORS requests to this API Blueprint
CORS(api, supports_credentials=True, origins='*')  # Adjust origins as needed

cognito_client = boto3.client('cognito-idp', region_name=os.getenv("region"))

# Wrapper function to check for access token
def require_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Print the HTTP method of the request
        print(f"HTTP Method: {request.method}")

        if request.method == 'OPTIONS':
            # Allow preflight requests
            print("Preflight request detected. Allowing without token check.")
            return func(*args, **kwargs)

        # Get the access token from cookies
        access_token = request.headers.get('Authorization')
        print(f"Access Token: {access_token}")

        if not access_token:
            print("Access token not found.")
            return jsonify({"error": "Access token not found"}), 401
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

# @api.route('/add_phone', methods=['POST', 'OPTIONS'])
# @cross_origin()
# def add_phone():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         body = request.form.get('phoneDetails')
#         phoneDetails = json.loads(body)

#         # Ensure user exists
#         user_email = phoneDetails.get('user_email')
#         user = User.query.filter_by(email=user_email).first()
#         if not user:
#             return jsonify({"error": "User not found"}), 404

#         # Get the last ID from Phones table
#         last_phone = Phones.query.order_by(Phones.id.desc()).first()
#         next_id = last_phone.id + 1 if last_phone else 1

#         # Handle file uploads to S3 and store URLs in database
#         folder_name = f"{user.id}_{secure_filename(user_email)}_sellerID_{next_id}"
#         uploaded_files = []
#         for file in request.files.getlist('images'):
#             filename = secure_filename(file.filename)
#             file_key = os.path.join(folder_name, filename)

#             # Upload file to S3
#             s3.upload_fileobj(file, os.getenv("s3_bucket_name"), file_key, ExtraArgs={'ContentType': file.content_type})

#             # Form the URL for the uploaded file
#             file_url = f"https://{s3_bucket_name}.s3.{region}.amazonaws.com/{file_key}"
#             uploaded_files.append(file_url)

#         # Create new Phone instance and commit to database
#         new_phone = Phones(
#             price=phoneDetails['price'],
#             phonetype=phoneDetails['phonetype'],
#             color=phoneDetails['color'],
#             storage=phoneDetails['storage'],
#             carrier=phoneDetails['carrier'],
#             model=phoneDetails['model'],
#             condition=phoneDetails['condition'],
#             seller=phoneDetails['seller'],
#             location=phoneDetails['location'],
#             IMEI=phoneDetails['IMEI'],
#             user_email=user_email,
#             image_url=uploaded_files,
#             paypal_email=phoneDetails['paypal_email'],
#             first_name=phoneDetails['first_name'],
#             last_name=phoneDetails['last_name'],
#             seller_contact_number=phoneDetails['seller_contact_number']
#         )

#         db.session.add(new_phone)
#         db.session.commit()

#         return jsonify({"message": "Phone added successfully", "phone": new_phone.serialize()}), 201

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to add phone"}), 500

# @api.route('/edit_price', methods=['PATCH', 'OPTIONS'])
# @cross_origin()
# def edit_price():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         # Extract phone details from request body
#         body = request.get_json()
#         phone_id = body.get('phone_id')
#         new_price = body.get('new_price')

#         if phone_id is None or new_price is None:
#             return jsonify({"error": "Phone ID and new price must be provided"}), 400

#         # Find the phone in the database
#         phone = Phones.query.get(phone_id)
#         if not phone:
#             return jsonify({"error": "Phone not found"}), 404

#         phone.price = new_price

#         db.session.commit()
#         return jsonify({"message": "Price updated successfully", "phone": phone.serialize()}), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to update price"}), 500

# @api.route('/edit_paypalemail', methods=['PATCH', 'OPTIONS'])
# @cross_origin()
# def edit_paypalemail():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         # Extract phone details from request body
#         body = request.get_json()
#         phone_id = body.get('phone_id')
#         new_paypal_email = body.get('new_paypal_email')

#         if phone_id is None or new_paypal_email is None:
#             return jsonify({"error": "Phone ID and  new paypalemail must be provided"}), 400

#         # Find the phone in the database
#         phone = Phones.query.get(phone_id)
#         if not phone:
#             return jsonify({"error": "Phone not found"}), 404

#         phone.paypal_email = new_paypal_email

#         db.session.commit()
#         return jsonify({"message": "Price updated successfully", "phone": phone.serialize()}), 200

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to update price"}), 500

# @api.route('/phones', methods=['GET'])
# @cross_origin()
# def get_phones():
#     try:
#         # Query all phones from the database
#         phones = Phones.query.all()

#         # Serialize the list of phones to JSON
#         phones_list = [phone.serialize() for phone in phones]

#         return jsonify(phones_list), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/phones/<int:sell_id>', methods=['GET'])
# @cross_origin()
# def get_each_phone(sell_id):
#     try:
#         phones = Phones.query.filter_by(id=sell_id)

#         # Serialize the list of phones to JSON
#         phones_list = [phone.serialize() for phone in phones]

#         return jsonify(phones_list), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/deletephone', methods=['DELETE'])
# @cross_origin()
# def delete_phone():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.json
#         phone_id = data.get('phone_id')

#         if not phone_id:
#             return jsonify({'error': 'phone_id not provided'}), 400

#         phone_to_delete = Phones.query.filter_by(id=phone_id).first()

#         if not phone_to_delete:
#             return jsonify({'error': 'Phone not found'}), 404

#         db.session.delete(phone_to_delete)
#         db.session.commit()

#         return jsonify({'message': f'Phone with id {phone_id} deleted successfully.'}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@api.route('/add_phone', methods=['POST', 'OPTIONS'])
@cross_origin()
def add_phone():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
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

        # Invalidate cache for phones list
        cache_delete('phones_list')
        filter_keys = redis_client.keys(f'phone_filter:*')
        if filter_keys:
            redis_client.delete(*filter_keys)
        return jsonify({"message": "Phone added successfully", "phone": new_phone.serialize()}), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to add phone"}), 500

@api.route('/edit_price', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def edit_price():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        body = request.get_json()
        phone_id = body.get('phone_id')
        new_price = body.get('new_price')

        if phone_id is None or new_price is None:
            return jsonify({"error": "Phone ID and new price must be provided"}), 400

        phone = Phones.query.get(phone_id)
        if not phone:
            return jsonify({"error": "Phone not found"}), 404

        phone.price = new_price
        db.session.commit()

        # Invalidate cache for the specific phone
        cache_delete(f'phone_{phone_id}')
        # Invalidate the phones list cache
        cache_delete('phones_list')

        return jsonify({"message": "Price updated successfully", "phone": phone.serialize()}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to update price"}), 500

@api.route('/edit_paypalemail', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def edit_paypalemail():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        body = request.get_json()
        phone_id = body.get('phone_id')
        new_paypal_email = body.get('new_paypal_email')

        if phone_id is None or new_paypal_email is None:
            return jsonify({"error": "Phone ID and new paypalemail must be provided"}), 400

        phone = Phones.query.get(phone_id)
        if not phone:
            return jsonify({"error": "Phone not found"}), 404

        phone.paypal_email = new_paypal_email
        db.session.commit()

        # Invalidate cache for the specific phone
        cache_delete(f'phone_{phone_id}')
        # Invalidate the phones list cache
        cache_delete('phones_list')

        return jsonify({"message": "Paypal email updated successfully", "phone": phone.serialize()}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to update paypal email"}), 500

@api.route('/phones', methods=['GET'])
@cross_origin()
def get_phones():
    try:
        cache_key = 'phones_list'
        cached_data = cache_get(cache_key)
        if cached_data:
            return jsonify(json.loads(cached_data)), 200

        phones = Phones.query.all()
        phones_list = [phone.serialize() for phone in phones]

        cache_set(cache_key, json.dumps(phones_list))

        return jsonify(phones_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/phones/<int:sell_id>', methods=['GET'])
@cross_origin()
def get_each_phone(sell_id):
    try:
        cache_key = f'phone_{sell_id}'
        cached_data = cache_get(cache_key)
        if cached_data:
            return jsonify(json.loads(cached_data)), 200

        phone = Phones.query.get(sell_id)
        if not phone:
            return jsonify({"error": "Phone not found"}), 404

        phone_data = phone.serialize()
        cache_set(cache_key, json.dumps(phone_data))

        return jsonify(phone_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/deletephone', methods=['DELETE'])
@cross_origin()
def delete_phone():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.json
        phone_id = data.get('phone_id')

        if not phone_id:
            return jsonify({'error': 'phone_id not provided'}), 400

        phone_to_delete = Phones.query.filter_by(id=phone_id).first()

        if not phone_to_delete:
            return jsonify({'error': 'Phone not found'}), 404

        # Remove phone from all users' favorites in the database
        Favorite.query.filter_by(phone_sell_id=phone_id).delete()
        Cart.query.filter_by(phone_sell_id=phone_id).delete()
        # Commit changes to the database
        db.session.delete(phone_to_delete)
        db.session.commit()

        redis_client.delete("phones_list")
        # Remove all related entries from Redis cache
        favorite_keys = redis_client.keys(f'favorite:*:{phone_id}')
        if favorite_keys:
            redis_client.delete(*favorite_keys)

        # Remove all related entries from Redis cache
        cart_keys = redis_client.keys(f'cart:*:{phone_id}')
        if cart_keys:
            redis_client.delete(*cart_keys)


        return jsonify({'message': f'Phone with id {phone_id} deleted successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    seller_id=data.get('seller_id')
    currency = "USD"  # Fixed currency
    seller_email=data.get('seller_email')
    buyer_email=data.get('buyer_email')

    if not price:
        return jsonify({'error': 'Price is required'}), 400

    custom_data = {
        "sellerpaypalemail": sellerpaypalemail,
        "buyer_id": buyer_id,
        "phone_sell_id": phone_sell_id,
        "seller_id": seller_id,
        "seller_email":seller_email,
        "buyer_email":buyer_email
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


# @api.route('/payment-success', methods=['POST'])
# def payment_success():
#     data = request.get_json()
#     payment_id = data.get('paymentId')
#     payer_id = data.get('payerId')
#     address = data.get('address')

#     if not payment_id or not payer_id:
#         return jsonify({'error': 'Missing paymentId or PayerID'}), 400

#     payment = paypalrestsdk.Payment.find(payment_id)

#     try:
#         if payment.execute({"payer_id": payer_id}):
#             payment_transaction_id = payment.transactions[0].related_resources[0].sale.id

#             payment_amount = float(payment.transactions[0].amount.total)
#             payout_amount = payment_amount - 10

#             custom_data = json.loads(payment.transactions[0].custom)

#             sellerpaypalemail = custom_data.get('sellerpaypalemail')
#             buyer_id = custom_data.get('buyer_id')
#             phone_sell_id = custom_data.get('phone_sell_id')
#             seller_id = custom_data.get('seller_id')

#             # Create the payout
#             payout_result = create_payout(sellerpaypalemail, payout_amount)
#             payout_transaction_id = payout_result.get('payout_batch_id')

#             # Record the transaction in the database
#             new_transaction = Transaction(
#                 buyer_id=buyer_id,
#                 seller_id=seller_id,
#                 phone_sell_id=phone_sell_id,
#                 payment_amount=payment_amount,
#                 payout_amount=payout_amount,
#                 shipping_address=address,
#                 payment_transaction_id=payment_transaction_id,
#                 payout_transaction_id=payout_transaction_id
#             )
#             db.session.add(new_transaction)
#             db.session.commit()

#             # Now delete the items from the cart
#             items_to_delete = Cart.query.filter_by(phone_sell_id=phone_sell_id).all()

#             redis_client.delete('all_sold_items')
#             # Remove all related entries from Redis cache
#             cart_keys = redis_client.keys(f'cart:*:{phone_sell_id}')
#             if cart_keys:
#                 redis_client.delete(*cart_keys)

#             if items_to_delete:
#                 for item in items_to_delete:
#                     db.session.delete(item)
#                 db.session.commit()
#             else:
#                 return jsonify({'error': 'Item not found in cart'}), 404

#             return jsonify({'status': 'Payment successful', 'payout_result': payout_result})
#         else:
#             return jsonify({'status': 'Payment failed', 'error': payment.error}), 500

#     except Exception as e:
#         return jsonify({'status': 'Payment error', 'error': str(e)}), 500
def send_email(subject, recipient, body):
    # SMTP server configuration
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Email content
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = recipient
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient, msg.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_sns_notification(topic_arn, message):
    try:
        # Send message to SNS topic
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=message
        )
        return response
    except Exception as e:
        print(f"Error sending SNS notification: {e}")
        return None

# def process_sqs_queue(queue_url):
    try:
        # Poll messages from the SQS queue
        print("Polling SQS queue...")
        response = sqs_client.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=5
        )

        # Process each message in the queue
        if 'Messages' in response:
            for message in response['Messages']:
                print(f"Received message: {message['Body']}")

                # Extract the SNS message content
                sns_message = json.loads(message['Body'])  # Parse the outer layer
                notification_data = json.loads(sns_message['Message'])  # Parse the inner 'Message' field

                email = notification_data.get('email')
                subject = notification_data.get('subject')
                body = notification_data.get('body')

                print(f"Processing email to: {email}, subject: {subject}, body: {body}")

                # Send email
                if email:
                    email_sent = send_email(subject, email, body)
                    print(f"Email sent: {email_sent}")

                # Delete the message from the queue after processing
                sqs_client.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=message['ReceiptHandle']
                )
                print("Message deleted from queue.")
        else:
            print("No messages in the queue.")
    except Exception as e:
        print(f"Error processing SQS messages: {e}")

@api.route('/payment-success', methods=['POST'])
def payment_success():
    data = request.get_json()
    payment_id = data.get('paymentId')
    payer_id = data.get('payerId')
    address = data.get('address')

    if not payment_id or not payer_id:
        return jsonify({'error': 'Missing paymentId or PayerID'}), 400

    payment = paypalrestsdk.Payment.find(payment_id)

    try:
        if payment.execute({"payer_id": payer_id}):
            payment_transaction_id = payment.transactions[0].related_resources[0].sale.id
            payment_amount = float(payment.transactions[0].amount.total)
            payout_amount = payment_amount - 10  # Example commission of 10 USD

            custom_data = json.loads(payment.transactions[0].custom)
            sellerpaypalemail = custom_data.get('sellerpaypalemail')
            buyer_id = custom_data.get('buyer_id')
            phone_sell_id = custom_data.get('phone_sell_id')
            seller_id = custom_data.get('seller_id')

            # Create payout
            payout_result = create_payout(sellerpaypalemail, payout_amount)
            payout_transaction_id = payout_result.get('payout_batch_id')

            # Record the transaction in the database
            new_transaction = Transaction(
                buyer_id=buyer_id,
                seller_id=seller_id,
                phone_sell_id=phone_sell_id,
                payment_amount=payment_amount,
                payout_amount=payout_amount,
                shipping_address=address,
                payment_transaction_id=payment_transaction_id,
                payout_transaction_id=payout_transaction_id
            )
            db.session.add(new_transaction)
            db.session.commit()

            # Clear cart and Redis cache
            items_to_delete = Cart.query.filter_by(phone_sell_id=phone_sell_id).all()
            cart_keys = redis_client.keys(f'cart:*:{phone_sell_id}')
            if cart_keys:
                redis_client.delete(*cart_keys)

            for item in items_to_delete:
                db.session.delete(item)
            db.session.commit()

            # Prepare email and SNS content
            buyer_message = json.dumps({
                'email': custom_data.get('buyer_email'),
                'subject': "Payment Confirmation",
                'body': f"Dear Buyer, your payment of {payment_amount} USD for phone ID {phone_sell_id} has been successful."
            })

            seller_message = json.dumps({
                'email': custom_data.get('seller_email'),
                'subject': "Payment Confirmation",
                'body': f"Dear Seller, you have received a payment of {payout_amount} USD for phone ID {phone_sell_id}. The payout has been initiated."
            })

            # Send SNS notifications
            send_sns_notification(buyer_sns_topic_arn, buyer_message)
            send_sns_notification(seller_sns_topic_arn, seller_message)

            # # Optionally process the SQS queue immediately after sending SNS
            # process_sqs_queue(buyer_sqs_queue_url)
            # process_sqs_queue(seller_sqs_queue_url)

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

# @api.route('/addcart', methods=['POST'])
# @cross_origin()
# def add_to_cart():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.json
#         if 'buyer_id' not in data or 'phone_sell_id' not in data:
#             return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

#         buyer_id = data['buyer_id']
#         phone_sell_id = data['phone_sell_id']

#         new_cart_item = Cart(buyer_id=buyer_id, phone_sell_id=phone_sell_id)

#         db.session.add(new_cart_item)
#         db.session.commit()

#         return jsonify({'message': 'Cart item added successfully', 'cart': new_cart_item.serialize()}), 201

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @api.route('/getcart', methods=['POST'])
# @cross_origin()
# def get_cart():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.get_json()
#         buyer_id = data.get('buyer_id')

#         if not buyer_id:
#             return jsonify({"success": False, "error": "buyer_id is required"}), 400

#         cart_entries = Cart.query.filter_by(buyer_id=buyer_id).all()

#         cart_data = [cart.serialize() for cart in cart_entries if cart.phone]

#         return jsonify({"success": True, "phones": cart_data}), 200
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

# @api.route('/deletecart', methods=['DELETE'])
# @cross_origin()
# def delete_from_cart():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.json
#         buyer_id = data.get('buyer_id')
#         phone_sell_id = data.get('phone_sell_id')

#         item_to_delete = Cart.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

#         if not item_to_delete:
#             return jsonify({'error': 'Item not found in cart'}), 404

#         db.session.delete(item_to_delete)
#         db.session.commit()
#         return jsonify({'message': 'Item deleted successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
@api.route('/addcart', methods=['POST'])
@cross_origin()
def add_to_cart():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.json
        if 'buyer_id' not in data or 'phone_sell_id' not in data:
            return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

        buyer_id = data['buyer_id']
        phone_sell_id = data['phone_sell_id']

        # Redis key for cart
        cart_key = f'cart:{buyer_id}:{phone_sell_id}'

        # Check if the cart item already exists in Redis
        if redis_client.exists(cart_key):
            return jsonify({'message': 'Cart item already exists', 'cart': json.loads(redis_client.get(cart_key))}), 200

        # Add new cart item to the database
        new_cart_item = Cart(buyer_id=buyer_id, phone_sell_id=phone_sell_id)
        db.session.add(new_cart_item)
        db.session.commit()

        # Cache the new cart item in Redis
        serialized_data = new_cart_item.serialize()
        redis_client.set(cart_key, json.dumps(serialized_data))

        return jsonify({'message': 'Cart item added successfully', 'cart': serialized_data}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/getcart', methods=['POST'])
@cross_origin()
def get_cart():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        # Fetch all cart items for the buyer from Redis
        cart_keys = redis_client.keys(f'cart:{buyer_id}:*')
        cart_data = [json.loads(redis_client.get(key)) for key in cart_keys if redis_client.get(key)]
        print(cart_data)

        if not cart_data:  # If no data in Redis, fetch from DB
            cart_entries = Cart.query.filter_by(buyer_id=buyer_id).all()
            cart_data = [cart.serialize() for cart in cart_entries if cart.phone]

            # Cache each cart item in Redis
            for item in cart_data:
                cart_key = f'cart:{buyer_id}:{item["phone_sell_id"]}'
                redis_client.set(cart_key, json.dumps(item))

        return jsonify({"success": True, "phones": cart_data}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api.route('/deletecart', methods=['DELETE'])
@cross_origin()
def delete_from_cart():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.json
        buyer_id = data.get('buyer_id')
        phone_sell_id = data.get('phone_sell_id')

        item_to_delete = Cart.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

        if not item_to_delete:
            return jsonify({'error': 'Item not found in cart'}), 404

        # Delete the item from the database
        db.session.delete(item_to_delete)
        db.session.commit()

        # Invalidate the cache in Redis
        cart_key = f'cart:{buyer_id}:{phone_sell_id}'
        redis_client.delete(cart_key)

        return jsonify({'message': 'Item deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @api.route('/addfavorite', methods=['POST'])
# @cross_origin()
# def add_to_favorite():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.json
#         if 'buyer_id' not in data or 'phone_sell_id' not in data:
#             return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

#         buyer_id = data['buyer_id']
#         phone_sell_id = data['phone_sell_id']

#         new_favorite_item = Favorite(buyer_id=buyer_id, phone_sell_id=phone_sell_id)

#         db.session.add(new_favorite_item)
#         db.session.commit()

#         return jsonify({'message': 'Favorite item added successfully', 'favorite': new_favorite_item.serialize()}), 201

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @api.route('/getfavorite', methods=['POST'])
# @cross_origin()
# def get_favorite():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.get_json()
#         buyer_id = data.get('buyer_id')

#         if not buyer_id:
#             return jsonify({"success": False, "error": "buyer_id is required"}), 400

#         favorite_entries = Favorite.query.filter_by(buyer_id=buyer_id).all()

#         favorite_data = [item.serialize() for item in favorite_entries if item.phone]

#         return jsonify({"success": True, "phones": favorite_data}), 200
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

# @api.route('/deletefavorite', methods=['DELETE'])
# @cross_origin()
# def delete_favorite():
#     access_token = request.headers.get('Authorization')
#     if not access_token:
#         return jsonify({"error": "Access token not found"}), 401
#     try:
#         data = request.json
#         buyer_id = data.get('buyer_id')
#         phone_sell_id = data.get('phone_sell_id')

#         item_to_delete = Favorite.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

#         if not item_to_delete:
#             return jsonify({'error': 'Item not found in cart'}), 404

#         db.session.delete(item_to_delete)
#         db.session.commit()
#         return jsonify({'message': 'Item deleted successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@api.route('/addfavorite', methods=['POST'])
@cross_origin()
def add_to_favorite():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.json
        if 'buyer_id' not in data or 'phone_sell_id' not in data:
            return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

        buyer_id = data['buyer_id']
        phone_sell_id = data['phone_sell_id']

        # Check if favorite already exists in Redis
        favorite_key = f'favorite:{buyer_id}:{phone_sell_id}'
        if redis_client.exists(favorite_key):
            return jsonify({'message': 'Favorite item already exists', 'favorite': json.loads(redis_client.get(favorite_key))}), 200

        # Add new favorite item to the database
        new_favorite_item = Favorite(buyer_id=buyer_id, phone_sell_id=phone_sell_id)
        db.session.add(new_favorite_item)
        db.session.commit()

        # Cache the new favorite item in Redis
        serialized_data = new_favorite_item.serialize()
        redis_client.set(favorite_key, json.dumps(serialized_data))

        return jsonify({'message': 'Favorite item added successfully', 'favorite': serialized_data}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/getfavorite', methods=['POST'])
@cross_origin()
def get_favorite():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        # Check Redis cache for favorite entries
        favorite_keys = redis_client.keys(f'favorite:{buyer_id}:*')
        favorite_data = []

        for key in favorite_keys:
            favorite_entry = redis_client.get(key)
            if favorite_entry:
                favorite_data.append(json.loads(favorite_entry))
        print(favorite_data)

        if not favorite_data:
            # If not found in cache, query the database
            favorite_entries = Favorite.query.filter_by(buyer_id=buyer_id).all()
            favorite_data = [item.serialize() for item in favorite_entries if item.phone]

            # Cache the retrieved favorite entries in Redis
            for item in favorite_entries:
                favorite_key = f'favorite:{buyer_id}:{item.phone_sell_id}'
                redis_client.set(favorite_key, json.dumps(item.serialize()))

        return jsonify({"success": True, "phones": favorite_data}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/deletefavorite', methods=['DELETE'])
@cross_origin()
def delete_favorite():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.json
        buyer_id = data.get('buyer_id')
        phone_sell_id = data.get('phone_sell_id')

        item_to_delete = Favorite.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

        if not item_to_delete:
            return jsonify({'error': 'Item not found in favorites'}), 404

        db.session.delete(item_to_delete)
        db.session.commit()

        # Remove the favorite item from Redis cache
        favorite_key = f'favorite:{buyer_id}:{phone_sell_id}'
        redis_client.delete(favorite_key)

        return jsonify({'message': 'Favorite item deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/getpurchase', methods=['POST'])
@cross_origin()
def get_purchase():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        purchase_entries = Transaction.query.filter_by(buyer_id=buyer_id).all()

        purchase_data = [item.serialize() for item in purchase_entries if item.phone]

        return jsonify({"success": True, "phones": purchase_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/getsold', methods=['POST'])
@cross_origin()
def get_sold():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        sold_entries = Transaction.query.filter_by(seller_id=buyer_id).all()

        sold_data = [item.serialize() for item in sold_entries if item.phone]

        return jsonify({"success": True, "phones": sold_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# @api.route('/getallsold', methods=['GET'])
# @cross_origin()
# def get_all_sold():
#     try:
#         all_sold = Transaction.query.all()

#         all_sold_data = [item.serialize() for item in all_sold if item.phone]

#         return jsonify({"success": True, "allsoldphones": all_sold_data}), 200
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

@api.route('/getallsold', methods=['GET'])
@cross_origin()
def get_all_sold():
    try:
        # Generate a cache key for the all-sold items
        cache_key = 'all_sold_items'

        # Try to get data from cache
        cached_data = cache_get(cache_key)
        if cached_data:
            print(cached_data)
            return jsonify({"success": True, "allsoldphones": json.loads(cached_data)}), 200

        # If not in cache, query the database
        all_sold = Transaction.query.all()

        # Serialize the data
        all_sold_data = [item.serialize() for item in all_sold if item.phone]

        # Cache the data with an expiration time (e.g., 5 minutes)
        cache_set(cache_key, json.dumps(all_sold_data), timeout=300)

        return jsonify({"success": True, "allsoldphones": all_sold_data}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# @api.route('/filter-phones', methods=['GET'])
# def filter_phones():
#     phonetype = request.args.get('phonetype', '')
#     color = request.args.get('color', '')
#     storage = request.args.get('storage', '')
#     carrier = request.args.get('carrier', '')
#     model = request.args.get('model', '')

#     # Start with a query on the Phones model
#     query = Phones.query

#     # Check if any filters are applied; if not, fetch all phones
#     if not (phonetype or color or storage or carrier or model):
#         all_phones = query.all()
#         # Extract phone IDs
#         phones = [phone.serialize() for phone in all_phones]
#         return jsonify({"phones": phones, "message": "No filters applied, returning all phones."})

#     # Apply filtering conditions if parameters are provided
#     if phonetype:
#         query = query.filter(Phones.phonetype.ilike(f"%{phonetype}%"))
#     if color:
#         query = query.filter(Phones.color.ilike(f"%{color}%"))
#     if storage:
#         query = query.filter(Phones.storage.ilike(f"%{storage}%"))
#     if carrier:
#         query = query.filter(Phones.carrier.ilike(f"%{carrier}%"))
#     if model:
#         query = query.filter(Phones.model.ilike(f"%{model}%"))

#     # Execute the query and get the filtered phones
#     filtered_phones = query.all()

#     # Extract IDs
#     phones = [phone.serialize() for phone in filtered_phones]

#     return jsonify({"phones": phones, "message": "Filtered phones based on criteria."})

@api.route('/filter-phones', methods=['GET'])
def filter_phones():
    phonetype = request.args.get('phonetype', '')
    color = request.args.get('color', '')
    storage = request.args.get('storage', '')
    carrier = request.args.get('carrier', '')
    model = request.args.get('model', '')

    # Generate a unique cache key based on the filter parameters
    prefix = 'phone_filter:'  # Define a prefix manually
    cache_key_str = prefix + cache_key(
        phonetype=phonetype,
        color=color,
        storage=storage,
        carrier=carrier,
        model=model
    )

    # Convert cache_key_str to a string if necessary
    if isinstance(cache_key_str, bytes):
        cache_key_str = cache_key_str.decode('utf-8')

    # Try to get data from cache
    cached_data = cache_get(cache_key_str)
    if cached_data:
        print(cached_data)
        return jsonify({"phones": json.loads(cached_data), "message": "Filtered phones fetched from cache."}), 200

    # Start with a query on the Phones model
    query = Phones.query

    # Check if any filters are applied; if not, fetch all phones
    if not (phonetype or color or storage or carrier or model):
        all_phones = query.all()
        phones = [phone.serialize() for phone in all_phones]

        # Cache the result if no filters are applied
        cache_set(cache_key_str, json.dumps(phones), timeout=300)

        return jsonify({"phones": phones, "message": "No filters applied, returning all phones."})

    # Apply filtering conditions if parameters are provided
    if phonetype:
        query = query.filter(Phones.phonetype.ilike(f"%{phonetype}%"))
    if color:
        query = query.filter(Phones.color.ilike(f"%{color}%"))
    if storage:
        query = query.filter(Phones.storage.ilike(f"%{storage}%"))
    if carrier:
        query = query.filter(Phones.carrier.ilike(f"%{carrier}%"))
    if model:
        query = query.filter(Phones.model.ilike(f"%{model}%"))

    # Execute the query and get the filtered phones
    filtered_phones = query.all()
    phones = [phone.serialize() for phone in filtered_phones]

    # Cache the result
    cache_set(cache_key_str, json.dumps(phones), timeout=300)

    return jsonify({"phones": phones, "message": "Filtered phones based on criteria."}), 200

@api.route('/getmylisting', methods=['POST'])
@cross_origin()
def get_my_listing():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({"error": "Access token not found"}), 401
    try:
        data = request.get_json()
        sellerid = data.get('sellerid')

        if not sellerid:
            return jsonify({"success": False, "error": "sellerid is required"}), 400

        # Find the user by ID to get the email
        user = User.query.get(sellerid)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        # Fetch phones associated with the user's email
        allphones = Phones.query.filter_by(user_email=user.email).all()

        # Serialize the data
        alllistedphones = [item.serialize() for item in allphones]

        return jsonify({"success": True, "alllistedphones": alllistedphones}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500