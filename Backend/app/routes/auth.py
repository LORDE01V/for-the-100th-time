from flask import Blueprint, redirect, url_for, session, jsonify, request, current_app, render_template
from app import oauth
from support import get_user_by_email, create_user, update_user_by_id, get_db, get_user_by_id
from werkzeug.security import check_password_hash, generate_password_hash
import os
import time
import logging
from datetime import datetime
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_cors import CORS, cross_origin


auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")
#CORS(auth_bp, origins=["*"], supports_credentials=True)  # Remove strict CORS here

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

@auth_bp.route('/user', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    logging.info("Attempting to get current user.")
    if request.method == 'OPTIONS':
        logging.info("Received OPTIONS request for /api/auth/user, returning 200 OK.")
        return create_response("OK", 200)
    
    try:
        user_id = get_jwt_identity() # Get user ID from JWT identity
        logging.info(f"JWT Identity (user_id): {user_id}")
        user = get_user_by_id(user_id) # Use get_user_by_id
        if not user:
            logging.warning(f"User not found for ID: {user_id}")
            return create_response("User not found", 404)
        
        logging.info(f"Found user: {user['email']} (ID: {user['id']})")
        return jsonify({
            "id": user['id'],
            "full_name": user['full_name'],
            "surname": user.get('surname', ''),
            "email": user['email'],
            "phone_number": user.get('phone', ''),
            "address": user.get('address', ''),
        })
    except Exception as e:
        logging.error(f"Error in get_current_user: {str(e)}")
        return create_response("Internal server error", 500)

@auth_bp.route('/logout')
def logout():
    session.clear()
    return create_response("Logged out successfully")

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return create_response("OK", 200)
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            logging.error('No valid JSON data received in login request')
            return create_response('Invalid credentials', 400)
        
        email = data.get('email', '').lower()
        password = data.get('password')
        
        if not email or not password:
            logging.error('Missing or invalid email/password in data')
            return create_response('Invalid credentials', 400)
        
        try:
            user = get_user_by_email(email)
            if not user:
                logging.error(f'User not found for email: {email}')
                return create_response('Invalid credentials', 401)
            
            if not check_password_hash(user['password_hash'], password):
                logging.error(f'Password mismatch for email: {email}')
                return create_response('Invalid credentials', 401)
            
            access_token = create_access_token(identity=str(user['id']))
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],  
                    'email': user['email'],
                    'full_name': user['full_name'], # Ensure full_name is returned
                    'phone_number': user.get('phone_number', '') # Include phone_number
                },
                'access_token': access_token,  # Change 'token' to 'access_token'
                'redirect': url_for('home.home_page')
            })
        except Exception as db_error:
            logging.error(f'Database error during login: {str(db_error)}')
            return create_response('Failed to connect to the server. Please check database settings.', 500)
    except Exception as e:
        logging.error(f'Login error: {str(e)}')
        return create_response('Login failed', 500)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return create_response("OK", 200)
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            logging.error('No valid JSON data received in registration request')
            return create_response('Invalid registration data', 400)

        email = data.get('email', '').lower()
        password = data.get('password')
        full_name = data.get('full_name', '') 
        phone_number = data.get('phone', '') # Extract phone_number from request data

        if not email or not password:
            logging.error('Missing or invalid email/password in registration data')
            return create_response('Email and password are required', 400)

        existing_user = get_user_by_email(email)
        if existing_user:
            logging.error(f'Attempted registration with existing email: {email}')
            return create_response('User with that email already exists', 409) # 409 Conflict

        hashed_password = generate_password_hash(password)
        # Pass phone_number to create_user
        new_user_id = create_user(email=email, password_hash=hashed_password, full_name=full_name, phone_number=phone_number)

        if new_user_id is None:
            logging.error(f'Failed to create user in database for email: {email}')
            return create_response('Registration failed due to database error', 500)
        
        # After successful registration, automatically log in the user
        access_token = create_access_token(identity=str(new_user_id))
        
        return jsonify({
            "success": True,
            "access_token": access_token,
            "user": {
                "id": new_user_id,
                "email": email,
                "full_name": full_name,
                "phone_number": phone_number # Include phone_number in response
            }
        }), 201 # 201 Created

    except Exception as e:
        logging.error(f'Registration error: {str(e)}')
        return create_response('Registration failed', 500)

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

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    print("Incoming Request Data:", data)  # Log the incoming request data

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'message': 'Old and new password are required'}), 400

    user_id = get_jwt_identity()

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT password_hash FROM users WHERE id = %s", (int(user_id),))
            user = cur.fetchone()
            if not user or not check_password_hash(user[0], old_password):
                return jsonify({'message': 'Old password is incorrect'}), 400

            new_hash = generate_password_hash(new_password)
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, int(user_id)))
            conn.commit()

        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Failed to update password'}), 500
    finally:
        if conn:
            conn.close()


# Route to delete account


# Route to delete account
@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    conn = get_db()
    with conn.cursor() as cur:
        # Delete the user (and cascade to related data if your schema supports it)
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200