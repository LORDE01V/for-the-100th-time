from flask import Blueprint, redirect, url_for, session, jsonify, request, current_app, render_template
from app import oauth
from support import get_user_by_email, create_user
from werkzeug.security import check_password_hash, generate_password_hash
import os
import time
import logging
from datetime import datetime
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")

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

@auth_bp.route('/google')
def google_login():
    try:
        action = request.args.get('action', 'login')
        session['oauth_action'] = action
        redirect_uri = url_for('auth.google_callback', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)
    except Exception:
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
                return f"""
                <html>
                <script>
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
                session['user_id'] = email
                access_token = create_access_token(identity=email)
                return jsonify({
                    "success": True,
                    "token": access_token,
                    "user": {
                        "email": email,
                        "name": name
                    },
                    "redirect": url_for('home.home_page')
                })
            
    except Exception as e:
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return f"""
        <html>
        <script>
            alert('Authentication failed. Please try again.');
            window.location.href = '{frontend_url}/login';
        </script>
        </html>
        """

@auth_bp.route('/user')
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return create_response("Not authenticated", 401)
    
    user = get_user_by_email(user_id)
    if not user:
        return create_response("User not found", 404)
        
    return jsonify({
        "authenticated": True
    })

@auth_bp.route('/logout')
def logout():
    session.clear()
    return create_response("Logged out successfully")

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            logging.error('No valid JSON data received in login request')
            return create_response('Invalid credentials', 400)
        
        email = data.get('email')
        if isinstance(email, dict):
            email = email.get('email')
        elif not isinstance(email, str):
            logging.error('Invalid email format in data')
            return create_response('Invalid credentials', 400)
        email = email.lower() if email else None
        
        password = data.get('password')
        if isinstance(password, dict):
            password = password.get('password')
        elif not isinstance(password, str):
            logging.error('Invalid password format in data')
            return create_response('Invalid credentials', 400)
        
        if not email or not password:
            logging.error('Missing or invalid email/password in data')
            return create_response('Invalid credentials', 400)
        
        logging.info(f'Attempting login for email: {email}')
        user = get_user_by_email(email)
        if not user:
            logging.error(f'User not found for email: {email}')
            return create_response('Invalid credentials', 401)
        
        logging.info(f'Verifying password: Incoming password length {len(password)}, Stored hash length {len(user["password_hash"])}')  # Log lengths only
        if not check_password_hash(user['password_hash'], password):
            logging.error(f'Password mismatch for email: {email} - Hash verification failed')
            return create_response('Invalid credentials', 401)
        
        access_token = create_access_token(identity=user['email'])
        return jsonify({
            'success': True,
            'token': access_token,
            'user': {
                'email': user['email'],
                'name': user['full_name']
            },
            'redirect': url_for('home.home_page')
        })
    except Exception as e:
        logging.error(f'Login error: {str(e)} - Request data structure: {type(data)}')
        return create_response('Login failed', 500)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid request data'}), 400
    
    if not all(key in data for key in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data.get('email').lower() if data.get('email') else None
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Invalid email or password'}), 400
    
    if get_user_by_email(email):
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        password_hash = generate_password_hash(password)
        logging.info(f'User registration for email: {email} - Plain password length: {len(password)}, Hashed password length: {len(password_hash)}')
        create_user(email=email, password_hash=password_hash, full_name=data.get('name'), phone=data.get('phone'))
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        logging.error(f'Registration error: {str(e)} - Email: {email}')
        return jsonify({'error': str(e)}), 500 