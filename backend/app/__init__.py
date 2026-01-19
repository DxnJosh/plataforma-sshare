from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt
from flask_cors import CORS
from app.routes.auth import auth_bp
from app.routes.tickets import tickets_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # 🔥 IMPORTAR MODELOS AQUÍ (ANTES DE MIGRACIONES)
    from app.models.user import User
    from app.models.ticket import Ticket

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.tickets import tickets_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tickets_bp)

    return app
