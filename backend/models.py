from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)

    def __init__(self, name):
        self.name = name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

class address(db.Model):
    __tablename__ = 'address'
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(120), unique=True, nullable=False)

    def __init__(self, address):
        self.address = address

    def serialize(self):
        return {
            "id": self.id,
            "address": self.address
        }