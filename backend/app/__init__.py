from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, cors

from app.routes.auth_routes import auth_bp
from app.routes.category_routes import category_bp
from app.routes.expense_routes import expense_bp
from app.routes.bill_routes import bill_bp
from app.routes.analytics_routes import analytics_bp
from app.routes.savings_routes import savings_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=False,
    )

    from app.models import User, Category, Expense, Bill, SavingsGoal, Budget

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(category_bp, url_prefix="/api/categories")
    app.register_blueprint(expense_bp, url_prefix="/api/expenses")
    app.register_blueprint(bill_bp, url_prefix="/api/bills")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(savings_bp, url_prefix="/api/savings")

    @app.route("/")
    def home():
        return {"message": "Expense Tracker API running"}

    return app
