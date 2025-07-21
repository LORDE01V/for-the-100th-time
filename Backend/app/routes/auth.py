from flask import Blueprint, redirect, url_for, session, jsonify, request, current_app, render_template, make_response
from app import oauth
from support import get_user_by_email, create_user, update_user_by_id, get_db
from werkzeug.security import check_password_hash, generate_password_hash
import os
import time
import logging
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, create_refresh_token, decode_token
from flask_cors import CORS, cross_origin

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")
CORS(auth_bp, supports_credentials=True) # Unified CORS is configured in app/__init__.py

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)

def create_response(message=None, status=200):
    return jsonify({"message": message}), status

@auth_bp.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response

@auth_bp.route('/google')
def google_login():
    try:
        action = request.args.get('action', 'login')
        session['oauth_action'] = action
        redirect_uri = url_for('auth.google_callback', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)
    except Exception as e:
        logger.error(f"Google login initiation error: {e}")
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error=auth_failed")

@auth_bp.route('/google/callback')
def google_callback():
    try:
        token = oauth.google.authorize_access_token()
        resp = oauth.google.get('https://www.googleapis.com/oauth2/v1/userinfo')
        user_info = resp.json()
        
        email = user_info['email']
        name = user_info['name']
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        existing_user = get_user_by_email(email)
        action = session.get('oauth_action', 'login')

        if action == 'register':
            if existing_user:
                # User already exists, show error and redirect to login
                return f"""
                <html>
                <script>
                    alert('This email is already registered. Please login instead.');
                    window.location.href = '{frontend_url}/login';
                </script>
                </html>
                """
            else:
                # Create new user and redirect to home
                password_hash = generate_password_hash('google-oauth-user')
                create_user(
                    email=email,
                    password_hash=password_hash,
                    full_name=name
                )
                session['user_id'] = email
                access_token = create_access_token(identity=email)
                refresh_token = create_refresh_token(identity=email)
                return f"""
                <html>
                <script>
                    localStorage.setItem('access_token', '{access_token}');
                    localStorage.setItem('refresh_token', '{refresh_token}');
                    window.location.href = '{frontend_url}/home';
                </script>
                </html>
                """
        else:  # login
            if not existing_user:
                # User doesn't exist, show error and redirect to register
                return f"""
                <html>
                <script>
                    alert('Account not found. Please register first.');
                    window.location.href = '{frontend_url}/register';
                </script>
                </html>
                """
            else:
                # Login successful, redirect to home
                access_token = create_access_token(identity=email)
                refresh_token = create_refresh_token(identity=email)
                return f"""
                <html>
                <script>
                    localStorage.setItem('access_token', '{access_token}');
                    localStorage.setItem('refresh_token', '{refresh_token}');
                    window.location.href = '{frontend_url}/home';
                </script>
                </html>
                """
    except Exception as e:
        logger.error(f"Google callback error: {e}")
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error=auth_failed")


@auth_bp.route('/user')
@jwt_required()
def get_current_user():
    current_user_email = get_jwt_identity()
    user = get_user_by_email(current_user_email)
    if user:
        return jsonify({
            "id": user["id"],
            "email": user["email"],
            "name": user["full_name"],
            "onboarded": user["onboarded"] # Include onboarded status
        }), 200
    return jsonify({"msg": "User not found"}), 404

@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    logger.info(f"Attempting login for email: {email}")
    user = get_user_by_email(email)

    if not user:
        logger.error(f"User not found for email: {email}")
        return jsonify({"message": "Invalid credentials"}), 401

    # Log password lengths for debugging without exposing actual passwords
    logger.info(f"Verifying password: Incoming password length {len(password) if password else 0}, Stored hash length {len(user['password_hash']) if user['password_hash'] else 0}")

    if user and check_password_hash(user['password_hash'], password):
        access_token = create_access_token(identity=user['email'])
        refresh_token = create_refresh_token(identity=user['email'])
        logger.info(f"User {email} logged in successfully.")
        return jsonify(
            message="Login successful",
            access_token=access_token,
            refresh_token=refresh_token,
            user={"id": user["id"], "email": user["email"], "name": user["full_name"], "onboarded": user["onboarded"]},
            redirect='/dashboard'  # Redirect to dashboard on successful login
        ), 200
    else:
        logger.error(f"Failed login attempt for email: {email}")
        return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')

    if not email or not password or not full_name:
        return jsonify({"message": "Missing email, password, or full name"}), 400

    if get_user_by_email(email):
        return jsonify({"message": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    
    logger.info(f"User registration for email: {email} - Plain password length: {len(password)}, Hashed password length: {len(hashed_password)}")

    try:
        user_id = create_user(email, hashed_password, full_name)
        if user_id:
            return jsonify({"message": "Registration successful", "user_id": user_id}), 201
        else:
            return jsonify({"message": "Registration failed"}), 500
    except Exception as e:
        logger.error(f"Registration error: {e} - Email: {email}")
        return jsonify({"message": f"Registration failed: {e}"}), 500

@auth_bp.route('/user', methods=['PUT'])
@jwt_required()
def update_user():
    current_user_email = get_jwt_identity()
    user = get_user_by_email(current_user_email)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    updated_full_name = data.get('full_name', user['full_name'])
    updated_password = data.get('password')
    onboarded_status = data.get('onboarded', user['onboarded']) # Get onboarded status from request

    hashed_password = generate_password_hash(updated_password) if updated_password else None

    # Pass the onboarded status to the update function
    if update_user_by_id(user['id'], updated_full_name, hashed_password, onboarded_status):
        return jsonify({"message": "User updated successfully"}), 200
    return jsonify({"message": "User update failed"}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_identity = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_identity)
    return jsonify({"access_token": new_access_token}), 200

@auth_bp.route('/check-token', methods=['GET'])
@jwt_required(optional=True)
def check_token():
    current_user = get_jwt_identity()
    if current_user:
        return jsonify(logged_in=True, user_email=current_user), 200
    else:
        return jsonify(logged_in=False), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return jsonify({"message": "Missing email or new password"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"message": "User not found"}), 404

    hashed_password = generate_password_hash(new_password)
    if update_user_by_id(user['id'], user['full_name'], hashed_password, user['onboarded']):
        return jsonify({"message": "Password reset successfully"}), 200
    return jsonify({"message": "Password reset failed"}), 500 