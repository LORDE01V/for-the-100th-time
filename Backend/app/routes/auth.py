from flask import Blueprint, redirect, url_for, session, jsonify, request, current_app, render_template
from app import oauth
from support import get_user_by_email, create_user, update_user_by_id, get_db
from werkzeug.security import check_password_hash, generate_password_hash
import os
import time
import logging
from datetime import datetime
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_cors import CORS, cross_origin

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")
CORS(auth_bp, origins=["*"], supports_credentials=True)  # Remove strict CORS here

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
@jwt_required()
def get_current_user():
    user_email = get_jwt_identity()
    user = get_user_by_email(user_email)
    if not user:
        return create_response("User not found", 404)
        
    return jsonify({
        "id": user['id'],
        "full_name": user['full_name'],
        "surname": user.get('surname', ''),
        "email": user['email'],
        "phone_number": user.get('phone', ''),
        "address": user.get('address', ''),
    })

@auth_bp.route('/logout')
def logout():
    session.clear()
    return create_response("Logged out successfully")

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def login():
    if request.method == 'OPTIONS':
        return create_response("OK", 200)
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
        user = get_user_by_email(email.lower())
        if not user:
            logging.error(f'User not found for email: {email}')
            return create_response('Invalid credentials', 401)
        
        logging.info(f'Verifying password: Incoming password length {len(password)}, Stored hash length {len(user["password_hash"])}')  # Log lengths only
        if not check_password_hash(user['password_hash'], password):
            logging.error(f'Password mismatch for email: {email} - Hash verification failed')
            return create_response('Invalid credentials', 401)
        
        access_token = create_access_token(identity=user['id'])  # Use ID instead of email
        response = jsonify({
            'success': True,
            'user': {
                'email': user['email'],
                'name': user['full_name']
            },
            'redirect': url_for('home.home_page')
        })
        # Assuming set_access_cookies is defined elsewhere or needs to be imported
        # from flask_jwt_extended import set_access_cookies
        # set_access_cookies(response, access_token) 
        return response
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
    
    email = data.get('email').lower()
    password = data.get('password')
    full_name = data.get('name')
    
    if get_user_by_email(email):
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        password_hash = generate_password_hash(password)
        logging.info(f'User registration for email: {email} - Plain password length: {len(password)}, Hashed password length: {len(password_hash)}')
        create_user(email=email, password_hash=password_hash, full_name=full_name)
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        logging.error(f'Registration error: {str(e)} - Email: {email}')
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/user', methods=['PUT'])
@jwt_required()
def update_user():
    try:
        data = request.get_json()
        if not data:
            return create_response('No data provided', 400)
        
        user_email = get_jwt_identity()
        user = get_user_by_email(user_email)
        if not user:
            return create_response('User not found', 404)
        
        user_id = user['id']
        
        # Only include fields that are provided and exist in your schema
        updates = {}
        if 'email' in data:
            updates['email'] = data.get('email')
        if 'full_name' in data:
            updates['full_name'] = data.get('full_name')
        # Skip 'surname' for now, or add it after migrating the database
        # if 'surname' in data:  # Uncomment this once the column is added
        #     updates['surname'] = data.get('surname')
        if 'phone_number' in data:
            updates['phone_number'] = data.get('phone_number')
        if 'address' in data:
            updates['address'] = data.get('address')
        
        if not updates:  # No valid updates
            return create_response('No valid fields to update', 400)
        
        # Build the update query dynamically based on provided fields
        query = "UPDATE users SET "
        query_values = []
        for key in updates:
            if key in ['email', 'full_name', 'phone_number', 'address']:  # Only include known columns
                query += f"{key} = COALESCE(%s, {key}), "
                query_values.append(updates[key])
        query = query.rstrip(', ')  # Remove trailing comma
        query += " WHERE id = %s RETURNING id"
        query_values.append(user_id)
        
        # Execute the query
        conn = get_db()  # Now this should be defined
        with conn.cursor() as cur:
            cur.execute(query, query_values)
            conn.commit()
        
        return create_response('Profile updated successfully', 200)
    
    except Exception as e:
        logging.error(f'Update error: {str(e)}')
        return create_response('Internal server error', 500)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        new_password = data.get('new_password')
        if not email or not new_password:
            return create_response('Email and new password are required', 400)
        
        user = get_user_by_email(email)
        if not user:
            return create_response('User not found', 404)
        
        new_hash = generate_password_hash(new_password)
        if update_user_by_id(user['id'], password_hash=new_hash):  # Assuming update_user_by_id can handle password_hash
            return create_response('Password reset successfully', 200)
        else:
            return create_response('Reset failed', 500)
    except Exception as e:
        logging.error(f'Password reset error: {str(e)}')
        return create_response('Reset failed', 500) 