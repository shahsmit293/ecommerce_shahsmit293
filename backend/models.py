from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False,default = "0")
    amount = db.Column(db.String(120),nullable=False, default = "0")

    def __init__(self, email,amount):
        self.email = email
        self.amount = amount

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "amount": self.amount
        }

