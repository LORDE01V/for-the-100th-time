from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import timedelta, datetime
import secrets
import os
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from email_utils import send_welcome_email  # Assuming it's in email_utils.py
from dotenv import load_dotenv
from support import (
    get_user_balance,
    get_user_expenses,
    create_expense,
    process_top_up_transaction,
    get_user_auto_top_up_settings,
    save_user_auto_top_up_settings,
    toggle_auto_top_up,
    create_support_ticket,
    add_energy_motto_column,
    save_payment_method,
    fetch_user_payment_methods,
    remove_payment_method,
    create_payment_methods_table,
    add_story,
    initialize_db,
    get_user_by_email,
    create_user,
    update_user_by_id,
    get_db
)
from werkzeug.utils import secure_filename

# Load environment variables (same as support.py)
load_dotenv()

def create_app():
    """Factory function to create and configure the Flask application."""
    app = Flask(__name__)
    return app

# Configuration (use environment variables for secrets in production)
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))

# ================= FLASK APP =================
# Rename existing app to flask_app
flask_app = create_app()  # Use factory app

flask_app.config.update(
    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'dev'),
    SESSION_COOKIE_NAME='session',
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_TYPE='filesystem'
)
flask_app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
flask_app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
flask_app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
flask_app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False

# Initialize extensions
CORS(flask_app, 
     resources={r"/api/*": {"origins": "http://localhost:3000"}},
     expose_headers=["Authorization"],
     supports_credentials=True)
jwt = JWTManager(flask_app)

# Register blueprints
flask_app.register_blueprint(home_bp)
flask_app.register_blueprint(auth_bp, name='auth_bp')

# Add after request handler
@flask_app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Add these error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({
        'success': False,
        'message': 'Invalid token. Please log in again.'
    }), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({
        'success': False,
        'message': 'Missing token. Please log in.'
    }), 401

# Database connection helper (PostgreSQL)
def get_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'your_password_here'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None

# Add these constants at the top of your file
UPLOAD_FOLDER = 'uploads/profile_pictures'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create the upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Add this near the top of your file, after imports
create_payment_methods_table()

# Auth routes (updated for PostgreSQL)
@flask_app.route('/api/auth/register', methods=['POST'])
def flask_register():
    pass  # Placeholder for registration logic

@flask_app.route('/api/auth/login', methods=['POST'])
def flask_login():
    pass  # Placeholder for login logic

@flask_app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    pass  # Placeholder for password change logic

# Settings routes
@flask_app.route('/api/settings', methods=['GET'])
@jwt_required()
def get_user_settings():
    pass  # Placeholder for getting user settings logic

@flask_app.route('/api/settings', methods=['PUT'])
@jwt_required()
def modify_user_settings():
    pass  # Placeholder for modifying user settings logic

# Profile routes
@flask_app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    pass  # Placeholder for getting user profile logic

@flask_app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    pass  # Placeholder for updating user profile logic

# Expenses routes
@flask_app.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    pass  # Placeholder for getting expenses logic

@flask_app.route('/api/expenses', methods=['POST'])
@jwt_required()
def create_expense():
    pass  # Placeholder for creating expenses logic

# Top-up routes
@flask_app.route('/api/topup', methods=['POST'])
@jwt_required()
def process_top_up():
    pass  # Placeholder for processing top-up logic

@flask_app.route('/api/topup/balance', methods=['GET'])
@jwt_required()
def get_balance():
    pass  # Placeholder for getting balance logic

# Auto top-up routes
@flask_app.route('/api/auto-topup/settings', methods=['GET'])
@jwt_required()
def get_auto_top_up_settings():
    pass  # Placeholder for getting auto top-up settings logic

@flask_app.route('/api/auto-topup/settings', methods=['POST'])
@jwt_required()
def save_auto_top_up_settings():
    pass  # Placeholder for saving auto top-up settings logic

@flask_app.route('/api/auto-topup/toggle', methods=['POST'])
@jwt_required()
def toggle_auto_top_up():
    pass  # Placeholder for toggling auto top-up logic

# Notifications routes
@flask_app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    pass  # Placeholder for getting notifications logic

@flask_app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    pass  # Placeholder for marking notification as read logic

# Profile picture upload route
@flask_app.route('/api/profile/picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    pass  # Placeholder for uploading profile picture logic

# Chat route
@flask_app.route('/api/chat', methods=['POST'])
def chat():
    pass  # Placeholder for chat logic

# Debug logging
@flask_app.before_request
def log_request_info():
    print('Headers:', dict(request.headers))
    print('Body:', request.get_data())
    print('Method:', request.method)
    print('URL:', request.url)

@flask_app.after_request
def after_request(response):
    print('Response:', response.get_data())
    return response

# Entry point for the application
if __name__ == "__main__":
    try:
        # Initialize the database (create tables if they don't exist)
        print("Initializing the database...")
        initialize_db()
        print("Database initialized successfully!")

        # Example usage of database functions
        print("Creating a new user...")
        user_id = create_user(email="test@example.com", password_hash="hashed_password", full_name="Test User")
        print(f"User created with ID: {user_id}")

        print("Fetching user by email...")
        user = get_user_by_email(email="test@example.com")
        print(f"User fetched: {user}")

        print("Updating user details...")
        update_success = update_user_by_id(user_id=user_id, full_name="Updated User", phone_number="1234567890")
        print(f"User update successful: {update_success}")

    except Exception as e:
        print(f"An error occurred: {e}")

    flask_app.run(debug=True)  # Assuming flask_app is the app instance; adjust if needed