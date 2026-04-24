import re
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)

from app.extensions import db
from app.models.user import User
from app.models.category import Category

auth_bp = Blueprint("auth_bp", __name__)


def is_valid_password(password):
    return (
        len(password) >= 8
        and re.search(r"[A-Z]", password)
        and re.search(r"[0-9]", password)
        and re.search(r"[!@#$%^&*]", password)
    )


def create_default_categories(user_id):
    default_categories = [
        {"name": "Food", "color": "#f59e0b", "icon": "utensils"},
        {"name": "Travel", "color": "#06b6d4", "icon": "car"},
        {"name": "Shopping", "color": "#ec4899", "icon": "shopping-bag"},
        {"name": "Bills", "color": "#ef4444", "icon": "receipt"},
        {"name": "Entertainment", "color": "#8b5cf6", "icon": "film"},
        {"name": "Health", "color": "#22c55e", "icon": "heart"},
        {"name": "Education", "color": "#3b82f6", "icon": "book-open"},
    ]

    for item in default_categories:
        exists = Category.query.filter_by(
            user_id=user_id,
            name=item["name"]
        ).first()

        if not exists:
            db.session.add(
                Category(
                    user_id=user_id,
                    name=item["name"],
                    color=item["color"],
                    icon=item["icon"],
                )
            )


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    first_name = str(data.get("first_name", "")).strip()
    middle_name = str(data.get("middle_name", "")).strip()
    last_name = str(data.get("last_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = str(data.get("phone", "")).strip()
    dob = str(data.get("dob", "")).strip()
    password = str(data.get("password", "")).strip()

    if not first_name or not last_name or not email or not phone or not dob or not password:
        return jsonify({"error": "All required fields must be filled"}), 400

    if not (email.endswith("@gmail.com") or email.endswith("@yahoo.com")):
        return jsonify({"error": "Only Gmail or Yahoo email is allowed"}), 400

    if not is_valid_password(password):
        return jsonify({
            "error": "Password must be 8+ characters with 1 uppercase letter, 1 number, and 1 special character"
        }), 400

    existing_user = User.query.filter(
        (User.email == email) | (User.phone == phone)
    ).first()

    if existing_user:
        return jsonify({"error": "Email or phone number already exists"}), 409

    try:
        parsed_dob = datetime.strptime(dob, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date of birth format"}), 400

    user = User(
        first_name=first_name,
        middle_name=middle_name if middle_name else None,
        last_name=last_name,
        email=email,
        phone=phone,
        dob=parsed_dob,
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    create_default_categories(user.id)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "dob": str(user.dob),
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    identifier = str(data.get("identifier", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not identifier or not password:
        return jsonify({"error": "Email/phone and password are required"}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.phone == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email/phone or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    full_name = " ".join(
        part for part in [user.first_name, user.middle_name, user.last_name] if part
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "full_name": full_name,
            "email": user.email,
            "phone": user.phone,
            "dob": str(user.dob),
        }
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({"access_token": new_access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    full_name = " ".join(
        part for part in [user.first_name, user.middle_name, user.last_name] if part
    )

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "middle_name": user.middle_name,
        "last_name": user.last_name,
        "full_name": full_name,
        "email": user.email,
        "phone": user.phone,
        "dob": str(user.dob),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }), 200
