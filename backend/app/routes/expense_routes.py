from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.expense import Expense

expense_bp = Blueprint("expenses", __name__)


@expense_bp.route("/", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = int(get_jwt_identity())

    expenses = (
        Expense.query.filter_by(user_id=user_id)
        .order_by(Expense.expense_date.desc(), Expense.id.desc())
        .all()
    )

    return jsonify(
        [
            {
                "id": expense.id,
                "title": expense.title,
                "amount": float(expense.amount),
                "payment_method": expense.payment_method,
                "expense_date": expense.expense_date.isoformat(),
                "note": expense.note,
                "is_recurring": expense.is_recurring,
                "category_id": expense.category_id,
            }
            for expense in expenses
        ]
    ), 200


@expense_bp.route("/", methods=["POST"])
@jwt_required()
def create_expense():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ["title", "amount", "category_id", "expense_date"]
    missing_fields = [
        field for field in required_fields if not data.get(field)]

    if missing_fields:
        return jsonify(
            {"error": f"Missing required fields: {', '.join(missing_fields)}"}
        ), 400

    try:
        expense_date = datetime.strptime(
            data["expense_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "expense_date must be in YYYY-MM-DD format"}), 400

    try:
        amount = float(data["amount"])
    except (TypeError, ValueError):
        return jsonify({"error": "Amount must be a valid number"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    expense = Expense(
        user_id=user_id,
        category_id=int(data["category_id"]),
        title=data["title"].strip(),
        amount=amount,
        payment_method=data.get("payment_method", "upi"),
        expense_date=expense_date,
        note=data.get("note", "").strip() or None,
        is_recurring=bool(data.get("is_recurring", False)),
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify(
        {
            "message": "Expense created successfully",
            "expense": {
                "id": expense.id,
                "title": expense.title,
                "amount": float(expense.amount),
                "payment_method": expense.payment_method,
                "expense_date": expense.expense_date.isoformat(),
                "note": expense.note,
                "is_recurring": expense.is_recurring,
                "category_id": expense.category_id,
            },
        }
    ), 201


@expense_bp.route("/<int:expense_id>", methods=["GET"])
@jwt_required()
def get_expense(expense_id):
    user_id = int(get_jwt_identity())

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    return jsonify(
        {
            "id": expense.id,
            "title": expense.title,
            "amount": float(expense.amount),
            "payment_method": expense.payment_method,
            "expense_date": expense.expense_date.isoformat(),
            "note": expense.note,
            "is_recurring": expense.is_recurring,
            "category_id": expense.category_id,
        }
    ), 200


@expense_bp.route("/<int:expense_id>", methods=["PUT"])
@jwt_required()
def update_expense(expense_id):
    user_id = int(get_jwt_identity())

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "title" in data:
        if not str(data["title"]).strip():
            return jsonify({"error": "Title cannot be empty"}), 400
        expense.title = str(data["title"]).strip()

    if "amount" in data:
        try:
            amount = float(data["amount"])
        except (TypeError, ValueError):
            return jsonify({"error": "Amount must be a valid number"}), 400

        if amount <= 0:
            return jsonify({"error": "Amount must be greater than 0"}), 400

        expense.amount = amount

    if "payment_method" in data:
        expense.payment_method = data["payment_method"]

    if "note" in data:
        expense.note = str(data["note"]).strip() or None

    if "is_recurring" in data:
        expense.is_recurring = bool(data["is_recurring"])

    if "category_id" in data:
        try:
            expense.category_id = int(data["category_id"])
        except (TypeError, ValueError):
            return jsonify({"error": "category_id must be a valid integer"}), 400

    if "expense_date" in data:
        try:
            expense.expense_date = datetime.strptime(
                data["expense_date"], "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({"error": "expense_date must be in YYYY-MM-DD format"}), 400

    db.session.commit()

    return jsonify(
        {
            "message": "Expense updated successfully",
            "expense": {
                "id": expense.id,
                "title": expense.title,
                "amount": float(expense.amount),
                "payment_method": expense.payment_method,
                "expense_date": expense.expense_date.isoformat(),
                "note": expense.note,
                "is_recurring": expense.is_recurring,
                "category_id": expense.category_id,
            },
        }
    ), 200


@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    user_id = int(get_jwt_identity())

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted successfully"}), 200
