from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)


from . import auth_bp
from app.extensions import db
from app.models.user import User
from app.utils.roles import role_required


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON requerido"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y password son obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Usuario ya existe"}), 409

    user = User(
    username=email,
    email=email,
    role="user"
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Usuario creado correctamente",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Login exitoso",
        "access_token": access_token,
        "refresh_token": refresh_token,   # 👈 AQUÍ NACE
        "user": {
            "id": user.id,
            "email": user.email
        }
    }), 200



@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "email": user.email
    }), 200

@auth_bp.route("/admin-only", methods=["GET"])
@jwt_required()
def admin_only():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != "admin":
        return {"error": "Acceso denegado"}, 403

    return {"message": "Bienvenido admin"}, 200

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)

    return jsonify({
        "access_token": new_access_token
    }), 200
