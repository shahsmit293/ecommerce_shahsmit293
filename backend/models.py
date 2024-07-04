from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, unique=True)  # Add unique constraint

    def __init__(self, email):
        self.email = email

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
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
    IMEI = db.Column(db.Integer, nullable=True)
    user_email = db.Column(db.String(120), db.ForeignKey('user.email'), nullable=True)  # Update foreign key to reference email
    image_url = db.Column(ARRAY(db.String), nullable=True) 
    user = db.relationship('User', backref=db.backref('phones', lazy=True))

    def __init__(self, price,phonetype, color, storage, carrier, model, condition, seller, location,IMEI, user_email,image_url):
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
            "image_url":self.image_url
        }
