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
    
@api.route('/edit_price', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def edit_price():
    try:
        # Extract phone details from request body
        body = request.get_json()
        phone_id = body.get('phone_id')
        new_price = body.get('new_price')

        if phone_id is None or new_price is None:
            return jsonify({"error": "Phone ID and new price must be provided"}), 400

        # Find the phone in the database
        phone = Phones.query.get(phone_id)
        if not phone:
            return jsonify({"error": "Phone not found"}), 404
        
        phone.price = new_price

        db.session.commit()
        return jsonify({"message": "Price updated successfully", "phone": phone.serialize()}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to update price"}), 500

@api.route('/edit_paypalemail', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def edit_paypalemail():
    try:
        # Extract phone details from request body
        body = request.get_json()
        phone_id = body.get('phone_id')
        new_paypal_email = body.get('new_paypal_email')

        if phone_id is None or new_paypal_email is None:
            return jsonify({"error": "Phone ID and  new paypalemail must be provided"}), 400

        # Find the phone in the database
        phone = Phones.query.get(phone_id)
        if not phone:
            return jsonify({"error": "Phone not found"}), 404
        
        phone.paypal_email = new_paypal_email

        db.session.commit()
        return jsonify({"message": "Price updated successfully", "phone": phone.serialize()}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to update price"}), 500
    
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

@api.route('/deletephone', methods=['DELETE'])
@cross_origin()
def delete_phone():
    try:
        data = request.json
        phone_id = data.get('phone_id')

        if not phone_id:
            return jsonify({'error': 'phone_id not provided'}), 400

        phone_to_delete = Phones.query.filter_by(id=phone_id).first()

        if not phone_to_delete:
            return jsonify({'error': 'Phone not found'}), 404

        db.session.delete(phone_to_delete)
        db.session.commit()

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
    seller_id=data.get('seller_id')
    currency = "USD"  # Fixed currency

    if not price:
        return jsonify({'error': 'Price is required'}), 400
    
    custom_data = {
        "sellerpaypalemail": sellerpaypalemail,
        "buyer_id": buyer_id,
        "phone_sell_id": phone_sell_id,
        "seller_id": seller_id
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
            seller_id = custom_data.get('seller_id')

            payout_result = create_payout(sellerpaypalemail, payout_amount)
            payout_transaction_id=payout_result.get('payout_batch_id')
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
            # Now delete the item from the cart
            item_to_delete = Cart.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()
            if item_to_delete:
                db.session.delete(item_to_delete)
                db.session.commit()  # Commit this specific operation
            else:
                return jsonify({'error': 'Item not found in cart'}), 404

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

@api.route('/addcart', methods=['POST'])
@cross_origin() 
def add_to_cart():
    try:
        data = request.json
        if 'buyer_id' not in data or 'phone_sell_id' not in data:
            return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

        buyer_id = data['buyer_id']
        phone_sell_id = data['phone_sell_id']
        
        new_cart_item = Cart(buyer_id=buyer_id, phone_sell_id=phone_sell_id)
        
        db.session.add(new_cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Cart item added successfully', 'cart': new_cart_item.serialize()}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api.route('/getcart', methods=['POST'])
@cross_origin() 
def get_cart():
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        cart_entries = Cart.query.filter_by(buyer_id=buyer_id).all()
        
        cart_data = [cart.serialize() for cart in cart_entries if cart.phone]
        
        return jsonify({"success": True, "phones": cart_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/deletecart', methods=['DELETE'])
@cross_origin()
def delete_from_cart():
    try:
        data = request.json
        buyer_id = data.get('buyer_id')
        phone_sell_id = data.get('phone_sell_id')
        
        item_to_delete = Cart.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

        if not item_to_delete:
            return jsonify({'error': 'Item not found in cart'}), 404

        db.session.delete(item_to_delete)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/addfavorite', methods=['POST'])
@cross_origin() 
def add_to_favorite():
    try:
        data = request.json
        if 'buyer_id' not in data or 'phone_sell_id' not in data:
            return jsonify({'error': 'Missing buyer_id or phone_sell_id'}), 400

        buyer_id = data['buyer_id']
        phone_sell_id = data['phone_sell_id']
        
        new_favorite_item = Favorite(buyer_id=buyer_id, phone_sell_id=phone_sell_id)
        
        db.session.add(new_favorite_item)
        db.session.commit()
        
        return jsonify({'message': 'Favorite item added successfully', 'favorite': new_favorite_item.serialize()}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/getfavorite', methods=['POST'])
@cross_origin() 
def get_favorite():
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')

        if not buyer_id:
            return jsonify({"success": False, "error": "buyer_id is required"}), 400

        favorite_entries = Favorite.query.filter_by(buyer_id=buyer_id).all()
        
        favorite_data = [item.serialize() for item in favorite_entries if item.phone]
        
        return jsonify({"success": True, "phones": favorite_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/deletefavorite', methods=['DELETE'])
@cross_origin()
def delete_favorite():
    try:
        data = request.json
        buyer_id = data.get('buyer_id')
        phone_sell_id = data.get('phone_sell_id')
        
        item_to_delete = Favorite.query.filter_by(buyer_id=buyer_id, phone_sell_id=phone_sell_id).first()

        if not item_to_delete:
            return jsonify({'error': 'Item not found in cart'}), 404

        db.session.delete(item_to_delete)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/getpurchase', methods=['POST'])
@cross_origin() 
def get_purchase():
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

@api.route('/getallsold', methods=['GET'])
@cross_origin()
def get_all_sold():
    try:
        all_sold = Transaction.query.all()

        all_sold_data = [item.serialize() for item in all_sold if item.phone]

        return jsonify({"success": True, "allsoldphones": all_sold_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/filter-phones', methods=['GET'])
def filter_phones():
    phonetype = request.args.get('phonetype', '')
    color = request.args.get('color', '')
    storage = request.args.get('storage', '')
    carrier = request.args.get('carrier', '')
    model = request.args.get('model', '')

    # Start with a query on the Phones model
    query = Phones.query

    # Check if any filters are applied; if not, fetch all phones
    if not (phonetype or color or storage or carrier or model):
        all_phones = query.all()
        # Extract phone IDs
        phones = [phone.serialize() for phone in all_phones]
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

    # Extract IDs
    phones = [phone.serialize() for phone in filtered_phones]

    return jsonify({"phones": phones, "message": "Filtered phones based on criteria."})

@api.route('/getmylisting', methods=['POST'])
@cross_origin()
def get_my_listing():
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
