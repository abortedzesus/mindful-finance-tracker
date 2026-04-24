from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.category import Category

category_bp = Blueprint("categories", __name__)


@category_bp.route("/", methods=["GET"])
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    categories = Category.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "color": c.color,
            "icon": c.icon
        } for c in categories
    ]), 200


@category_bp.route("/", methods=["POST"])
@jwt_required()
def create_category():
    user_id = get_jwt_identity()
    data = request.get_json()

    category = Category(
        user_id=user_id,
        name=data.get("name"),
        color=data.get("color", "#6366f1"),
        icon=data.get("icon", "wallet")
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({"message": "Category created", "id": category.id}), 201
