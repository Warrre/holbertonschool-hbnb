from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_restx import Api
from config import config_by_name
from flask_jwt_extended import JWTManager
import jwt

# Initialiser les extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_name='development'):
    """Factory pour créer l'application Flask"""
    app = Flask(__name__)
    
    # Configuration CORS simple
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    jwt.init_app(app)
    
    # Charger la configuration
    if config_name in config_by_name:
        app.config.from_object(config_by_name[config_name])
    else:
        app.config.from_object(config_by_name['default'])
    
    app.config["JWT_SECRET_KEY"] = "super-secret-key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    # Initialiser les extensions avec l'app
    db.init_app(app)
    bcrypt.init_app(app)
    
    # Initialiser Flask-RESTX
    api = Api(app, doc='/docs/', title='HBnB API', version='1.0', description='HBnB API Documentation')
    
    
    # Enregistrer les namespaces RESTX
    try:
        from app.api.v1.users import api as users_ns
        from app.api.v1.places import api as places_ns
        from app.api.v1.reviews import api as reviews_ns
        from app.api.v1.amenities import api as amenities_ns
        from app.api.v1.auth import api as auth_ns

        api.add_namespace(auth_ns, path='/api/v1/auth')
        api.add_namespace(users_ns, path='/api/v1/users')
        api.add_namespace(places_ns, path='/api/v1/places')
        api.add_namespace(reviews_ns, path='/api/v1/reviews')
        api.add_namespace(amenities_ns, path='/api/v1/amenities')
    except ImportError as e:
        print(f"Warning: Could not import API namespaces: {e}")
    
    return app
