import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "T0luc42025")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "JWT0LUC42025")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # Database
    SQLALCHEMY_DATABASE_URI = (
        "mysql+pymysql://root:T0luc42025@localhost/sshare"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
