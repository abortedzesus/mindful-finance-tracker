from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.savings_goal import SavingsGoal

savings_bp = Blueprint("savings_bp", __name__)


@savings_bp.route("/", methods=["GET"])
@jwt_required()
def get_savings_goals():
    user_id = get_jwt_identity()

    goals = (
        SavingsGoal.query.filter_by(user_id=user_id)
        .order_by(SavingsGoal.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": goal.id,
            "title": goal.title,
            "target_amount": float(goal.target_amount),
            "current_amount": float(goal.current_amount),
            "deadline": goal.deadline.isoformat() if goal.deadline else None,
            "created_at": goal.created_at.isoformat(),
        }
        for goal in goals
    ]), 200


@savings_bp.route("/", methods=["POST"])
@jwt_required()
def create_savings_goal():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = str(data.get("title", "")).strip()
    target_amount = data.get("target_amount")
    current_amount = data.get("current_amount", 0)
    deadline = data.get("deadline")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    try:
        target_amount = float(target_amount)
    except (TypeError, ValueError):
        return jsonify({"error": "Target amount must be a valid number"}), 400

    try:
        current_amount = float(current_amount)
    except (TypeError, ValueError):
        return jsonify({"error": "Current amount must be a valid number"}), 400

    if target_amount <= 0:
        return jsonify({"error": "Target amount must be greater than 0"}), 400

    if current_amount < 0:
        return jsonify({"error": "Current amount cannot be negative"}), 400

    parsed_deadline = None
    if deadline:
        try:
            parsed_deadline = datetime.strptime(deadline, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Deadline must be in YYYY-MM-DD format"}), 400

    goal = SavingsGoal(
        user_id=user_id,
        title=title,
        target_amount=target_amount,
        current_amount=current_amount,
        deadline=parsed_deadline,
    )

    db.session.add(goal)
    db.session.commit()

    return jsonify({
        "message": "Savings goal created successfully",
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "target_amount": float(goal.target_amount),
            "current_amount": float(goal.current_amount),
            "deadline": goal.deadline.isoformat() if goal.deadline else None,
        }
    }), 201


@savings_bp.route("/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_savings_goal(goal_id):
    user_id = get_jwt_identity()

    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({"error": "Savings goal not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        goal.title = title

    if "target_amount" in data:
        try:
            target_amount = float(data["target_amount"])
        except (TypeError, ValueError):
            return jsonify({"error": "Target amount must be a valid number"}), 400

        if target_amount <= 0:
            return jsonify({"error": "Target amount must be greater than 0"}), 400

        goal.target_amount = target_amount

    if "current_amount" in data:
        try:
            current_amount = float(data["current_amount"])
        except (TypeError, ValueError):
            return jsonify({"error": "Current amount must be a valid number"}), 400

        if current_amount < 0:
            return jsonify({"error": "Current amount cannot be negative"}), 400

        goal.current_amount = current_amount

    if "deadline" in data:
        if data["deadline"]:
            try:
                goal.deadline = datetime.strptime(
                    data["deadline"], "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Deadline must be in YYYY-MM-DD format"}), 400
        else:
            goal.deadline = None

    db.session.commit()

    return jsonify({
        "message": "Savings goal updated successfully",
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "target_amount": float(goal.target_amount),
            "current_amount": float(goal.current_amount),
            "deadline": goal.deadline.isoformat() if goal.deadline else None,
        }
    }), 200


@savings_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_savings_goal(goal_id):
    user_id = get_jwt_identity()

    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({"error": "Savings goal not found"}), 404

    db.session.delete(goal)
    db.session.commit()

    return jsonify({"message": "Savings goal deleted successfully"}), 200
