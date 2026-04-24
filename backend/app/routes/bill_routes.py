from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date

from app.extensions import db
from app.models.bill import Bill

bill_bp = Blueprint("bill_bp", __name__)


@bill_bp.route("/", methods=["GET"])
@jwt_required()
def get_bills():
    user_id = get_jwt_identity()
    bills = Bill.query.filter_by(user_id=user_id).all()
    today = date.today()

    return jsonify([
        {
            "id": b.id,
            "title": b.title,
            "amount": b.amount,
            "due_date": b.due_date.isoformat(),
            "is_paid": b.is_paid,
            "is_overdue": (not b.is_paid and b.due_date < today),
        }
        for b in bills
    ])


@bill_bp.route("/", methods=["POST"])
@jwt_required()
def add_bill():
    user_id = get_jwt_identity()
    data = request.get_json()

    due_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()

    bill = Bill(
        title=data["title"],
        amount=data["amount"],
        due_date=due_date,
        user_id=user_id,
    )

    db.session.add(bill)
    db.session.commit()

    return jsonify({"message": "Bill added"}), 201


@bill_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_bill(id):
    user_id = get_jwt_identity()
    bill = Bill.query.filter_by(id=id, user_id=user_id).first()

    if not bill:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json()
    bill.is_paid = data.get("is_paid", bill.is_paid)

    db.session.commit()

    return jsonify({"message": "Updated"})


@bill_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_bill(id):
    user_id = get_jwt_identity()
    bill = Bill.query.filter_by(id=id, user_id=user_id).first()

    if not bill:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(bill)
    db.session.commit()

    return jsonify({"message": "Deleted"})
