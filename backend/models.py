import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, unique=True)  # Add unique constraint
    firstname = db.Column(db.String(50), nullable=True)
    lastname = db.Column(db.String(50), nullable=True)
    phonenumber = db.Column(db.String(20), nullable=True)

    def __init__(self, email,firstname,lastname,phonenumber):
        self.email = email
        self.firstname = firstname
        self.lastname = lastname
        self.phonenumber = phonenumber
        
    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "phonenumber": self.phonenumber
        }

class Phones(db.Model):
    __tablename__ = 'phones'
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=True)
    phonetype = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    storage = db.Column(db.String(50), nullable=True)
    carrier = db.Column(db.String(50), nullable=True)
    model = db.Column(db.String(50), nullable=True)
    condition = db.Column(db.String(50), nullable=True)
    seller = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    IMEI = db.Column(db.String(20), nullable=True)
    user_email = db.Column(db.String(120), db.ForeignKey('user.email'), nullable=True)  
    image_url = db.Column(ARRAY(db.String), nullable=True)
    paypal_email = db.Column(db.String(120), nullable=True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    seller_contact_number = db.Column(db.String(20), nullable=True) 
    user = db.relationship('User', backref=db.backref('phones', lazy=True))

    def __init__(self, price,phonetype, color, storage, carrier, model, condition, seller, location,IMEI, user_email,paypal_email,first_name,last_name,seller_contact_number,image_url):
        self.price = price
        self.phonetype=phonetype
        self.color = color
        self.storage = storage
        self.carrier = carrier
        self.model = model
        self.condition = condition
        self.seller = seller
        self.location = location
        self.IMEI=IMEI
        self.user_email = user_email
        self.image_url=image_url
        self.paypal_email = paypal_email
        self.first_name = first_name
        self.last_name = last_name
        self.seller_contact_number = seller_contact_number

    def serialize(self):
        return {
            "id": self.id,
            "price": self.price,
            "phonetype": self.phonetype,
            "color": self.color,
            "storage": self.storage,
            "carrier": self.carrier,
            "model": self.model,
            "condition": self.condition,
            "seller": self.seller,
            "location": self.location,
            'IMEI':self.IMEI,
            "user_email": self.user_email,
            "user": self.user.serialize() if self.user else {},
            "paypal_email": self.paypal_email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "seller_contact_number": self.seller_contact_number,
            "image_url":self.image_url
        }

class Transaction(db.Model):
    __tablename__ = 'transaction'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, nullable=True)
    seller_id = db.Column(db.Integer, nullable=True)
    phone_sell_id = db.Column(db.Integer, db.ForeignKey('phones.id'), nullable=True)
    payment_amount = db.Column(db.Integer, nullable=True)
    payout_amount = db.Column(db.Integer, nullable=True)
    shipping_address = db.Column(db.String(2000), nullable=True)
    payment_transaction_id = db.Column(db.String(255), nullable=True)
    payout_transaction_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=True)
    phone = db.relationship('Phones', backref=db.backref('transactions', lazy=True))

    def __init__(self, buyer_id, seller_id, phone_sell_id, payment_amount, payout_amount, shipping_address, payment_transaction_id, payout_transaction_id):
        self.buyer_id = buyer_id
        self.seller_id=seller_id
        self.phone_sell_id=phone_sell_id
        self.payment_amount = payment_amount
        self.payout_amount = payout_amount
        self.shipping_address = shipping_address
        self.payment_transaction_id = payment_transaction_id
        self.payout_transaction_id = payout_transaction_id

    def serialize(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "phone_sell_id": self.phone_sell_id,
            "payment_amount": self.payment_amount,
            "payout_amount": self.payout_amount,
            "shipping_address": self.shipping_address,
            "payment_transaction_id": self.payment_transaction_id,
            "payout_transaction_id": self.payout_transaction_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "phone": self.phone.serialize() if self.phone else {},
        }

class Cart(db.Model):
    __tablename__ = 'cart'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, nullable=True)
    phone_sell_id = db.Column(db.Integer, db.ForeignKey('phones.id', ondelete='CASCADE'), nullable=True)
    phone = db.relationship('Phones', backref=db.backref('carts', lazy=True, cascade="all, delete-orphan"))

    def __init__(self, buyer_id, phone_sell_id):
        self.buyer_id = buyer_id
        self.phone_sell_id=phone_sell_id

    def serialize(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "phone_sell_id": self.phone_sell_id,
            "phone": self.phone.serialize() if self.phone else {}
        }

class Favorite(db.Model):
    __tablename__ = 'favorite'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, nullable=True)
    phone_sell_id = db.Column(db.Integer, db.ForeignKey('phones.id', ondelete='CASCADE'), nullable=True)
    phone = db.relationship('Phones', backref=db.backref('favorites', lazy=True, cascade="all, delete-orphan"))

    def __init__(self, buyer_id, phone_sell_id):
        self.buyer_id = buyer_id
        self.phone_sell_id=phone_sell_id

    def serialize(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "phone_sell_id": self.phone_sell_id,
            "phone": self.phone.serialize() if self.phone else {}
        }

class Subscribed(db.Model):
    __tablename__ = 'subscribed'
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), db.ForeignKey('user.email'), nullable=True)  
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=True)
    user = db.relationship('User', backref=db.backref('subscriptions', lazy=True))

    def __init__(self, user_email):
        self.user_email = user_email

    def serialize(self):
        return {
            'id': self.id,
            'user_email': self.user_email,
            'created_at': self.created_at,
            'user':self.user.serialize() if self.user else {}
        }

class Meetings(db.Model):
    __tablename__ = 'meetings'
    id = db.Column(db.Integer, primary_key=True)
    subscriber_email = db.Column(db.String(120), db.ForeignKey('user.email'), nullable=True)
    participant_email = db.Column(db.String(120), db.ForeignKey('user.email'), nullable=True)
    meeting_link = db.Column(db.String, nullable=True)
    host_url = db.Column(db.String(600), nullable=True)
    passcode = db.Column(db.String, nullable=True)
    meeting_id = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=True)
    subscriber = db.relationship('User', foreign_keys=[subscriber_email], backref=db.backref('created_meetings', lazy=True))
    participant = db.relationship('User', foreign_keys=[participant_email], backref=db.backref('joined_meetings', lazy=True))

    def __init__(self, subscriber_email, participant_email, meeting_link, host_url, passcode, meeting_id):
        self.subscriber_email = subscriber_email
        self.participant_email = participant_email
        self.meeting_link = meeting_link
        self.host_url=host_url
        self.passcode = passcode
        self.meeting_id = meeting_id

    def serialize(self):
        return {
            'id': self.id,
            'subscriber_email': self.subscriber_email,
            'participant_email': self.participant_email,
            'meeting_link': self.meeting_link,
            'host_url':self.host_url,
            'passcode': self.passcode,
            'meeting_id': self.meeting_id,
            'created_at': self.created_at,
            'subscriber': self.subscriber.serialize() if self.subscriber else {},
            'participant': self.participant.serialize() if self.participant else {}
        }