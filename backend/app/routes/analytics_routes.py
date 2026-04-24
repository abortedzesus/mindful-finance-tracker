from sqlalchemy import func, extract
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.expense import Expense
from app.models.bill import Bill
from app.models.savings_goal import SavingsGoal
from app.models.category import Category

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()

    total_expenses = (
        db.session.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id)
        .scalar()
    )

    unpaid_bills = (
        db.session.query(func.count(Bill.id))
        .filter(Bill.user_id == user_id, Bill.is_paid == False)
        .scalar()
    )

    total_savings = (
        db.session.query(func.coalesce(
            func.sum(SavingsGoal.current_amount), 0))
        .filter(SavingsGoal.user_id == user_id)
        .scalar()
    )

    recent_expenses = (
        Expense.query.filter_by(user_id=user_id)
        .order_by(Expense.expense_date.desc())
        .limit(5)
        .all()
    )

    return jsonify({
        "total_expenses": float(total_expenses),
        "unpaid_bills": unpaid_bills,
        "total_savings": float(total_savings),
        "recent_expenses": [
            {
                "id": e.id,
                "title": e.title,
                "amount": float(e.amount),
                "expense_date": e.expense_date.isoformat()
            }
            for e in recent_expenses
        ]
    }), 200


@analytics_bp.route("/category-breakdown", methods=["GET"])
@jwt_required()
def category_breakdown():
    user_id = get_jwt_identity()

    rows = (
        db.session.query(
            Category.name,
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == user_id)
        .group_by(Category.name)
        .all()
    )

    return jsonify([
        {"category": row[0], "amount": float(row[1])}
        for row in rows
    ]), 200


@analytics_bp.route("/monthly", methods=["GET"])
@jwt_required()
def monthly_expenses():
    user_id = get_jwt_identity()

    rows = (
        db.session.query(
            extract("month", Expense.expense_date).label("month"),
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .filter(Expense.user_id == user_id)
        .group_by(extract("month", Expense.expense_date))
        .order_by(extract("month", Expense.expense_date))
        .all()
    )

    return jsonify([
        {"month": int(row[0]), "amount": float(row[1])}
        for row in rows
    ]), 200
