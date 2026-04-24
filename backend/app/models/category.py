from app.extensions import db
from datetime import datetime


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(20), nullable=False, default="#6366f1")
    icon = db.Column(db.String(50), nullable=False, default="wallet")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    expenses = db.relationship(
        "Expense",
        backref="category",
        cascade="all, delete-orphan"
    )
