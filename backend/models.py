from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=True)

    def __init__(self, email):
        self.email = email

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
        }

