# __init__.py
import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from app.routes.topup import topup_bp

# Load environment variables
load_dotenv()

# Initialize OAuth
oauth = OAuth()

def create_app():
    app = Flask(__name__,
                template_folder='templates')
    CORS(app, origins=['http://localhost:3000', 'https://frontend-7td4.onrender.com'], supports_credentials=True)        
    
    # CORS configuration
    CORS(app, resources={r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://127.0.0.1:3000",
            "https://frontend-sabs.onrender.com"
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "X-Requested-With"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "expose_headers": ["Authorization"],
        "max_age": 3600
    }})
    
    # Configuration
    app.config.update(
        GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID'),
        GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET'),
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY'),
        SESSION_COOKIE_NAME='session',
        SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_TYPE='filesystem'
    )
    
    # Initialize OAuth
    oauth.init_app(app)
    
    # Configure Google OAuth
    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'verify_ssl': False  # Only for development
        }
    )
    
    # Register blueprints
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(topup_bp)
    
    
    return app 