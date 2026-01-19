from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or user.role != "admin":
                return {"error": "Acceso solo para administradores"}, 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper
