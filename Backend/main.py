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
    create_stories_table,
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
    create_stories_table
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
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['name', 'email', 'password']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Get optional phone or set None
        phone = data.get('phone', None)

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        with conn.cursor() as cur:
            # Check existing user
            cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            if cur.fetchone():
                return jsonify({'success': False, 'message': 'Email already exists'}), 400

        # Hash password and insert (using users table from support.py)
        email = data['email']
        password = data['password']
        name = data['name']
        hashed_password = generate_password_hash(password)
        cur.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id',
            (email, hashed_password, name)
        )
        result = cur.fetchone()
        if result is None:
            raise Exception("Failed to retrieve user ID: No rows returned.")
        user_id = result[0]
        conn.commit()

        send_welcome_email(data['email'], data['name'])

        return jsonify({
            'success': True,
            'user': {
                'id': result[0],
                'email': email,
                'name': name
            }
        }), 201

    except Exception as e:
        print(f"Registration Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/auth/login', methods=['POST'])
def flask_login():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({'success': False, 'message': 'Email and password required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()

        # Check credentials
        cur.execute('SELECT id, email, password_hash, full_name FROM users WHERE email = %s', (email,))
        user = cur.fetchone()

        if user and check_password_hash(user[2], password):
            # Create token with user ID as string
            access_token = create_access_token(identity=str(user[0]))
            return jsonify({
                'success': True,
                'token': access_token,
                'user': {
                    'id': user[0],
                    'name': user[3],
                    'email': user[1]
                },
                'redirect': '/'  # Simple frontend route
            })

        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        flask_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        old_password = str(data.get('oldPassword', ''))
        new_password = str(data.get('newPassword', ''))

        if not old_password or not new_password:
            return jsonify({'success': False, 'message': 'Both old and new passwords are required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()

        # Get current password hash
        cur.execute('SELECT password_hash FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        
        if not result:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        current_hash = result[0]

        # Verify old password
        if not check_password_hash(current_hash, old_password):
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401

        # Hash and update new password
        new_hash = generate_password_hash(new_password)
        cur.execute('UPDATE users SET password_hash = %s WHERE id = %s', (new_hash, user_id))
        conn.commit()

        return jsonify({'success': True, 'message': 'Password updated successfully'})

    except Exception as e:
        print(f"Password change error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to change password'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Settings routes
@flask_app.route('/api/settings', methods=['GET'])
@jwt_required()
def get_user_settings():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get user settings or create default if not exists
        cur.execute('''
            INSERT INTO user_settings (user_id)
            VALUES (%s)
            ON CONFLICT (user_id) DO NOTHING
            RETURNING receive_sms, receive_email, language
        ''', (user_id,))
        
        if cur.rowcount == 0:
            # If no insert happened, get existing settings
            cur.execute('''
                SELECT receive_sms, receive_email, language
                FROM user_settings
                WHERE user_id = %s
            ''', (user_id,))
        
        settings = cur.fetchone()
        conn.commit()
        
        if not settings:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve settings'}), 500
        
        return jsonify({
            'success': True,
            'settings': {
                'receiveSms': settings[0],
                'receiveEmail': settings[1],
                'language': settings[2]
            }
        })

    except Exception as e:
        print(f"Get settings error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to get settings'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/settings', methods=['PUT'])
@jwt_required()
def modify_user_settings():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Extract and validate settings
        receive_sms = bool(data.get('receiveSms', False))
        receive_email = bool(data.get('receiveEmail', False))
        language = str(data.get('language', 'en'))

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Update or insert settings
        cur.execute('''
            INSERT INTO user_settings (user_id, receive_sms, receive_email, language)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE
            SET receive_sms = EXCLUDED.receive_sms,
                receive_email = EXCLUDED.receive_email,
                language = EXCLUDED.language,
                updated_at = CURRENT_TIMESTAMP
            RETURNING receive_sms, receive_email, language
        ''', (user_id, receive_sms, receive_email, language))
        
        settings = cur.fetchone()
        conn.commit()
        
        if not settings:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve settings'}), 500
        
        return jsonify({
            'success': True,
            'settings': {
                'receiveSms': settings[0],
                'receiveEmail': settings[1],
                'language': settings[2]
            }
        })

    except Exception as e:
        print(f"Update settings error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update settings'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Add these profile endpoints
@flask_app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        try:
            # Get user profile data
            cur.execute('''
                SELECT p.full_name, p.email_address, p.phone_number, p.address, p.energy_motto,
                       p.profile_picture_url,
                       s.facebook_profile_url, s.twitter_profile_url, s.instagram_profile_url
                FROM user_profiles p
                LEFT JOIN social_links s ON p.user_id = s.user_id
                WHERE p.user_id = %s
            ''', (user_id,))
            
            profile = cur.fetchone()
            
            if profile:
                return jsonify({
                    'success': True,
                    'profile': {
                        'full_name': profile[0],
                        'email_address': profile[1],
                        'phone_number': profile[2],
                        'address': profile[3],
                        'energy_motto': profile[4] if profile[4] is not None else '',
                        'profilePictureUrl': profile[5],
                        'social_accounts': {
                            'facebook_profile_url': profile[6],
                            'twitter_profile_url': profile[7],
                            'instagram_profile_url': profile[8]
                        }
                    }
                })
            else:
                # If no profile exists, return empty values
                return jsonify({
                    'success': True,
                    'profile': {
                        'full_name': '',
                        'email_address': '',
                        'phone_number': '',
                        'address': '',
                        'energy_motto': '',
                        'profilePictureUrl': None,
                        'social_accounts': {
                            'facebook_profile_url': None,
                            'twitter_profile_url': None,
                            'instagram_profile_url': None
                        }
                    }
                })

        except Exception as e:
            print(f"Database error in get_profile: {str(e)}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to get profile: {str(e)}'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Update the profile endpoint to match frontend expectations
@flask_app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Extract and validate profile data
        full_name = str(data.get('full_name', ''))
        email_address = str(data.get('email_address', ''))
        phone = str(data.get('phone_number', ''))
        address = str(data.get('address', ''))
        energy_motto = str(data.get('energy_motto', ''))
        
        # Extract social accounts data
        social_accounts = data.get('social_accounts', {})
        facebook_url = social_accounts.get('facebook_profile_url')
        twitter_url = social_accounts.get('twitter_profile_url')
        instagram_url = social_accounts.get('instagram_profile_url')

        if not email_address:
            return jsonify({'success': False, 'message': 'Email address is required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        try:
            # Update profile data
            cur.execute('''
                INSERT INTO user_profiles (user_id, full_name, email_address, phone_number, address, energy_motto)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    email_address = EXCLUDED.email_address,
                    phone_number = EXCLUDED.phone_number,
                    address = EXCLUDED.address,
                    energy_motto = EXCLUDED.energy_motto,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING full_name, email_address, phone_number, address, energy_motto
            ''', (user_id, full_name, email_address, phone, address, energy_motto))
            
            profile = cur.fetchone()
            
            # Update social links
            cur.execute('''
                INSERT INTO social_links (user_id, facebook_profile_url, twitter_profile_url, instagram_profile_url)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET facebook_profile_url = EXCLUDED.facebook_profile_url,
                    twitter_profile_url = EXCLUDED.twitter_profile_url,
                    instagram_profile_url = EXCLUDED.instagram_profile_url
            ''', (user_id, facebook_url, twitter_url, instagram_url))
            
            conn.commit()
            
            if not profile:
                return jsonify({'success': False, 'message': 'Failed to update profile'}), 500

            return jsonify({
                'success': True,
                'profile': {
                    'full_name': profile[0],
                    'email_address': profile[1],
                    'phone_number': profile[2],
                    'address': profile[3],
                    'energy_motto': profile[4],
                    'social_accounts': {
                        'facebook_profile_url': facebook_url,
                        'twitter_profile_url': twitter_url,
                        'instagram_profile_url': instagram_url
                    }
                }
            })

        except Exception as e:
            if conn:  # Ensure conn is not None before rollback
                conn.rollback()
            raise e
        finally:
            if 'conn' in locals():
                if 'cur' in locals(): cur.close()
                if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                    conn.close()

    except Exception as e:
        print(f"Update profile error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to update profile: {str(e)}'}), 500

# Add these new routes to main.py

@flask_app.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    try:
        user_id = get_jwt_identity()
        print(f"=== Fetching expenses for user {user_id} ===")

        try:
            expenses_list = get_user_expenses(user_id)
            print(f"Successfully fetched {len(expenses_list)} expenses")
            
            return jsonify({
                'success': True,
                'expenses': expenses_list
            })

        except Exception as e:
            print(f"Error fetching expenses: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Unexpected error in expenses endpoint: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@flask_app.route('/api/expenses', methods=['POST'])
@jwt_required()
def create_expense():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Debug logging
        print("=== Expense Creation Request Debug ===")
        print(f"User ID: {user_id}")
        print(f"Request Data: {data}")

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        amount = data.get('amount')
        purpose = data.get('purpose')
        type = data.get('type')

        # Validate required fields
        if not all([amount, purpose, type]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
        except (TypeError, ValueError) as e:
            print(f"Amount validation error: {str(e)}")
            return jsonify({'success': False, 'message': 'Invalid amount format'}), 400

        try:
            expense_id = create_expense(user_id, amount, purpose, type)
            print(f"Expense created successfully with ID: {expense_id}")
            
            return jsonify({
                'success': True,
                'expense_id': expense_id
            }), 201

        except Exception as e:
            print(f"Error creating expense: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Unexpected error in expense creation: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@flask_app.route('/api/topup', methods=['POST'])
@jwt_required()
def process_top_up():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Debug logging
        print("=== Top-up Request Debug ===")
        print(f"User ID: {user_id}")
        print(f"Request Data: {data}")

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        amount = data.get('amount')
        type = data.get('type')
        promo_code = data.get('promoCode')
        voucher_code = data.get('voucherCode')

        # Debug logging
        print(f"Parsed data - Amount: {amount}, Type: {type}")
        print(f"Promo Code: {promo_code}, Voucher Code: {voucher_code}")

        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
        except (TypeError, ValueError) as e:
            print(f"Amount validation error: {str(e)}")
            return jsonify({'success': False, 'message': 'Invalid amount format'}), 400

        if not type:
            return jsonify({'success': False, 'message': 'Transaction type is required'}), 400

        try:
            result = process_top_up_transaction(user_id, amount, type, promo_code, voucher_code)
            print(f"Top-up successful - Result: {result}")
            
            # Ensure we're sending the correct property names
            return jsonify({
                'success': True,
                'top_up_id': result['top_up_id'],
                'new_balance': float(result['new_balance'])  # Make sure this matches the frontend expectation
            }), 201

        except Exception as e:
            print(f"Error in process_top_up_transaction: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Unexpected error in top-up endpoint: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@flask_app.route('/api/topup/balance', methods=['GET'])
@jwt_required()
def get_balance():
    try:
        user_id = get_jwt_identity()
        balance = get_user_balance(user_id)
        
        return jsonify({
            'success': True,
            'balance': float(balance)
        })

    except Exception as e:
        print(f"Error fetching balance: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch balance'}), 500

@flask_app.route('/api/auto-topup/settings', methods=['GET'])
@jwt_required()
def get_auto_top_up_settings():
    try:
        user_id = get_jwt_identity()
        print(f"=== Getting auto top-up settings for user {user_id} ===")
        
        # Debug log the user_id
        print(f"User ID from JWT: {user_id}")
        
        # Use the renamed function
        settings = get_user_auto_top_up_settings(user_id)
        print(f"Settings found: {settings}")
        
        # If no settings exist, return empty settings instead of None
        if settings is None:
            return jsonify({
                'success': True,
                'settings': {
                    'min_balance': 0,
                    'top_up_amount': 0,
                    'frequency': 'weekly',
                    'is_enabled': False
                }
            })
        
        return jsonify({
            'success': True,
            'settings': settings
        })

    except Exception as e:
        print(f"Error getting auto top-up settings: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': f'Failed to get auto top-up settings: {str(e)}'}), 500

@flask_app.route('/api/auto-topup/settings', methods=['POST'])
@jwt_required()
def save_auto_top_up_settings():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        print(f"=== Saving auto top-up settings for user {user_id} ===")
        print(f"Request data: {data}")

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Extract and validate the data
        try:
            min_balance = float(data.get('minBalance'))
            top_up_amount = float(data.get('autoTopUpAmount'))
            frequency = data.get('autoTopUpFrequency')
        except (TypeError, ValueError) as e:
            print(f"Data validation error: {str(e)}")
            return jsonify({'success': False, 'message': 'Invalid data format'}), 400

        if not all([min_balance, top_up_amount, frequency]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        if min_balance <= 0 or top_up_amount <= 0:
            return jsonify({'success': False, 'message': 'Amounts must be greater than 0'}), 400

        if frequency not in ['weekly', 'monthly', 'quarterly']:
            return jsonify({'success': False, 'message': 'Invalid frequency'}), 400

        try:
            settings = save_user_auto_top_up_settings(user_id, min_balance, top_up_amount, frequency)
            print(f"Settings saved successfully: {settings}")
            
            return jsonify({
                'success': True,
                'settings': settings
            })

        except Exception as e:
            print(f"Error saving settings: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Unexpected error in save settings endpoint: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@flask_app.route('/api/auto-topup/toggle', methods=['POST'])
@jwt_required()
def toggle_auto_top_up():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        is_enabled = data.get('isEnabled')
        if is_enabled is None:
            return jsonify({'success': False, 'message': 'Missing isEnabled field'}), 400

        success = toggle_auto_top_up(user_id, is_enabled)
        
        return jsonify({
            'success': True,
            'isEnabled': is_enabled
        })

    except Exception as e:
        print(f"Error toggling auto top-up: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to toggle auto top-up'}), 500

@flask_app.route('/api/auth/delete-account', methods=['POST'])
@jwt_required()
def delete_account():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Start transaction
        cur.execute("BEGIN")
        
        try:
            # Delete all user-related data in the correct order (due to foreign key constraints)
            # Delete from user_profiles
            cur.execute('DELETE FROM user_profiles WHERE user_id = %s', (user_id,))
            
            # Delete from user_settings
            cur.execute('DELETE FROM user_settings WHERE user_id = %s', (user_id,))
            
            # Delete from expenses
            cur.execute('DELETE FROM expenses WHERE user_id = %s', (user_id,))
            
            # Delete from top_ups
            cur.execute('DELETE FROM top_ups WHERE user_id = %s', (user_id,))
            
            # Delete from user_balances
            cur.execute('DELETE FROM user_balances WHERE user_id = %s', (user_id,))
            
            # Delete from auto_top_up_settings
            cur.execute('DELETE FROM auto_top_up_settings WHERE user_id = %s', (user_id,))
            
            # Delete from social_links
            cur.execute('DELETE FROM social_links WHERE user_id = %s', (user_id,))
            
            # Delete from solar_systems
            cur.execute('DELETE FROM solar_systems WHERE user_id = %s', (user_id,))
            
            # Delete from energy_usage
            cur.execute('DELETE FROM energy_usage WHERE user_id = %s', (user_id,))
            
            # Delete from environmental_impact
            cur.execute('DELETE FROM environmental_impact WHERE user_id = %s', (user_id,))
            
            # Delete from payment_methods
            cur.execute('DELETE FROM payment_methods WHERE user_id = %s', (user_id,))
            
            # Delete from transactions
            cur.execute('DELETE FROM transactions WHERE user_id = %s', (user_id,))
            
            # Delete from forum_topics
            cur.execute('DELETE FROM forum_topics WHERE user_id = %s', (user_id,))
            
            # Delete from forum_replies
            cur.execute('DELETE FROM forum_replies WHERE user_id = %s', (user_id,))
            
            # Delete from support_tickets
            cur.execute('DELETE FROM support_tickets WHERE user_id = %s', (user_id,))
            
            # Finally, delete the user
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            
            # Commit the transaction
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Account deleted successfully'
            })
            
        except Exception as e:
            # Rollback in case of error
            if conn:  # Ensure conn is not None before rollback
                conn.rollback()
            print(f"Error during account deletion: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Delete account error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete account'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Forum routes
@flask_app.route('/api/forum/topics', methods=['GET'])
@jwt_required()
def get_forum_topics():
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get all topics with author info and reply count
        cur.execute('''
            SELECT 
                t.id,
                t.title,
                t.content,
                t.created_at,
                u.full_name as author_name,
                u.id as author_id,
                COUNT(r.id) as reply_count,
                COALESCE(MAX(r.created_at), t.created_at) as last_activity
            FROM forum_topics t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN forum_replies r ON t.id = r.topic_id
            GROUP BY t.id, u.full_name, u.id
            ORDER BY last_activity DESC
        ''')
        
        topics = []
        for row in cur.fetchall():
            topics.append({
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'created_at': row[3].isoformat(),
                'author': {
                    'id': row[5],
                    'name': row[4]
                },
                'posts': row[6] + 1,  # Include the original post in count
                'last_activity': row[7].isoformat()
            })
        
        return jsonify({
            'success': True,
            'topics': topics
        })

    except Exception as e:
        print(f"Error fetching forum topics: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch forum topics'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/forum/topics', methods=['POST'])
@jwt_required()
def create_forum_topic():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        title = data.get('title')
        content = data.get('content')

        if not all([title, content]):
            return jsonify({'success': False, 'message': 'Title and content are required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Create new topic
        cur.execute('''
            INSERT INTO forum_topics (user_id, title, content)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        ''', (user_id, title, content))
        
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to create topic'}), 500
        topic_id, created_at = result
        
        # Get author info
        cur.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve author name'}), 500
        author_name = result[0]
        
        return jsonify({
            'success': True,
            'topic': {
                'id': topic_id,
                'title': title,
                'content': content,
                'created_at': created_at.isoformat(),
                'author': {
                    'id': user_id,
                    'name': author_name
                },
                'posts': 1,
                'last_activity': created_at.isoformat()
            }
        }), 201

    except Exception as e:
        print(f"Error creating forum topic: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create forum topic'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/forum/topics/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_forum_topic(topic_id):
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get topic with author info
        cur.execute('''
            SELECT 
                t.id,
                t.title,
                t.content,
                t.created_at,
                u.id as author_id,
                u.full_name as author_name
            FROM forum_topics t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = %s
        ''', (topic_id,))
        
        topic = cur.fetchone()
        if not topic:
            return jsonify({'success': False, 'message': 'Topic not found'}), 404
        
        # Get all replies for the topic
        cur.execute('''
            SELECT 
                r.id,
                r.content,
                r.created_at,
                u.id as author_id,
                u.full_name as author_name
            FROM forum_replies r
            JOIN users u ON r.user_id = u.id
            WHERE r.topic_id = %s
            ORDER BY r.created_at ASC
        ''', (topic_id,))
        
        replies = []
        for row in cur.fetchall():
            replies.append({
                'id': row[0],
                'content': row[1],
                'created_at': row[2].isoformat(),
                'author': {
                    'id': row[3],
                    'name': row[4]
                }
            })
        
        return jsonify({
            'success': True,
            'topic': {
                'id': topic[0],
                'title': topic[1],
                'content': topic[2],
                'created_at': topic[3].isoformat(),
                'author': {
                    'id': topic[4],
                    'name': topic[5]
                },
                'replies': replies
            }
        })

    except Exception as e:
        print(f"Error fetching forum topic: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch forum topic'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/forum/topics/<int:topic_id>/replies', methods=['POST'])
@jwt_required()
def create_forum_reply(topic_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        content = data.get('content')
        if not content:
            return jsonify({'success': False, 'message': 'Content is required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Verify topic exists
        cur.execute('SELECT id FROM forum_topics WHERE id = %s', (topic_id,))
        if not cur.fetchone():
            return jsonify({'success': False, 'message': 'Topic not found'}), 404
        
        # Create reply
        cur.execute('''
            INSERT INTO forum_replies (topic_id, user_id, content)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        ''', (topic_id, user_id, content))
        
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to create reply'}), 500
        reply_id, created_at = result
        
        # Get author info
        cur.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve author name'}), 500
        author_name = result[0]
        
        return jsonify({
            'success': True,
            'reply': {
                'id': reply_id,
                'content': content,
                'created_at': created_at.isoformat(),
                'author': {
                    'id': user_id,
                    'name': author_name
                }
            }
        }), 201

    except Exception as e:
        print(f"Error creating forum reply: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create forum reply'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/support/ticket', methods=['POST', 'OPTIONS'])
@jwt_required()
def handle_support_ticket():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print("=== Support Ticket Creation Debug ===")
        print(f"User ID: {user_id}")
        print(f"Request Data: {data}")
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        subject = data.get('subject')
        message = data.get('message')

        if not all([subject, message]):
            return jsonify({'success': False, 'message': 'Subject and message are required'}), 400

        try:
            priority = data.get('priority', 'low')
            ticket_id = create_support_ticket(user_id, subject, message, priority)
            return jsonify({
                'success': True,
                'message': 'Support ticket created successfully',
                'ticket_id': ticket_id
            }), 201

        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Create support ticket error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create support ticket'}), 500

@flask_app.route('/api/payment-methods', methods=['POST'])
@jwt_required()
def add_payment_method():
    try:
        # Debug logging
        print("=== Payment Method Creation Request Debug ===")
        print("Request Headers:", dict(request.headers))
        print("Request Data:", request.get_json())
        
        user_id = get_jwt_identity()
        print("User ID:", user_id)
        
        data = request.get_json()
        if not data:
            print("No data received in request")
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['type', 'cardNumber', 'expiryDate', 'cardHolderName']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400

        # Convert frontend field names to backend field names
        payment_data = {
            'payment_type': data['type'],
            'card_number': data['cardNumber'],
            'expiry_date': data['expiryDate'],
            'card_holder_name': data['cardHolderName'],
            'is_default': data.get('isDefault', False)
        }

        print("Processed payment data:", payment_data)

        # Save payment method
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        try:
            result = save_payment_method(
                user_id=user_id,
                payment_type=payment_data['payment_type'],
                card_number=payment_data['card_number'],
                expiry_date=payment_data['expiry_date'],
                card_holder_name=payment_data['card_holder_name'],
                is_default=payment_data['is_default']
            )

            print("Save payment method result:", result)

            if result:
                # Create notification for successful payment method addition
                try:
                    # Create notification
                    cur.execute('''
                        INSERT INTO notifications (user_id, title, message, type)
                        VALUES (%s, %s, %s, %s)
                    ''', (
                        user_id,
                        'Payment Method Added',
                        f'Successfully added a new {payment_data["payment_type"]} payment method.',
                        'success'
                    ))
                    conn.commit()
                except Exception as e:
                    print(f"Error creating notification: {str(e)}")
                    conn.rollback()

            return jsonify({
                'success': True,
                'message': 'Payment method saved successfully',
                'payment_method_id': result
            })
        except Exception as e:
            print("Error saving payment method:", str(e))
            import traceback
            print("Traceback:", traceback.format_exc())
            return jsonify({'success': False, 'message': str(e)}), 500
    except Exception as e:
        print("Error saving payment method:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@flask_app.route('/api/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    try:
        user_id = get_jwt_identity()
        payment_methods = fetch_user_payment_methods(user_id)
        
        # Format the payment methods for the frontend
        formatted_methods = []
        
        # Check if payment_methods is not None and is iterable
        if payment_methods:
            for method in payment_methods:
                try:
                    formatted_method = {
                        'id': method['id'],  # Assuming id is the first column
                        'payment_type': method['payment_type'],
                        'card_number': method['card_number'],
                        'expiry_date': method['expiry_date'].strftime('%m/%y') if method['expiry_date'] else None,
                        'card_holder_name': method['card_holder_name'],
                        'is_default': method['is_default'],
                        'created_at': method['created_at'].isoformat() if method['created_at'] else None  # Add created_at
                    }
                    formatted_methods.append(formatted_method)
                except (IndexError, AttributeError) as e:
                    print(f"Error formatting payment method: {str(e)}")
                    continue
        
        print("Debug - Formatted payment methods:", formatted_methods)  # Debug log
        
        return jsonify({
            'success': True,
            'payment_methods': formatted_methods
        })
    except Exception as e:
        print("Error fetching payment methods:", str(e))
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@flask_app.route('/api/payment-methods/<int:payment_method_id>', methods=['DELETE'])
@jwt_required()
def delete_payment_method(payment_method_id):
    try:
        user_id = get_jwt_identity()
        
        # Get payment method details before deleting
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        try:
            cur.execute('''
                SELECT payment_type, card_number, card_holder_name 
                FROM payment_methods 
                WHERE id = %s AND user_id = %s
            ''', (payment_method_id, user_id))
            payment_method = cur.fetchone()
            
            if not payment_method:
                return jsonify({
                    'success': False,
                    'message': 'Payment method not found or could not be deleted'
                }), 404
            
            # Use the renamed function to delete the payment method
            result = remove_payment_method(payment_method_id)
            
            if result:
                # Create notification for successful payment method deletion
                cur.execute('''
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES (%s, %s, %s, %s)
                ''', (
                    user_id,
                    'Payment Method Removed',
                    f'Successfully removed your {payment_method[0]} payment method ending in {payment_method[1][-4:] if payment_method[1] else "N/A"}.',
                    'info'
                ))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Payment method deleted successfully'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Payment method not found or could not be deleted'
                }), 404

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if cur: cur.close()
            if conn: conn.close()

    except Exception as e:
        print(f"Error deleting payment method: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@flask_app.route('/api/payment-methods/<int:payment_method_id>/default', methods=['PUT'])
@jwt_required()
def set_default_payment_method(payment_method_id):
    try:
        user_id = get_jwt_identity()
        
        # First, unset all default payment methods for this user
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        
        # Update all payment methods to not be default
        cur.execute('''
            UPDATE payment_methods 
            SET is_default = FALSE 
            WHERE user_id = %s
        ''', (user_id,))
        
        # Set the selected payment method as default
        cur.execute('''
            UPDATE payment_methods 
            SET is_default = TRUE 
            WHERE id = %s AND user_id = %s
            RETURNING id
        ''', (payment_method_id, user_id))
        
        result = cur.fetchone()
        conn.commit()
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Default payment method updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Payment method not found'
            }), 404

    except Exception as e:
        print(f"Error setting default payment method: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Add debug logging
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

@flask_app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get all notifications for the user
        cur.execute('''
            SELECT id, title, message, type, is_read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
        ''', (user_id,))
        
        notifications = cur.fetchall()
        
        return jsonify({
            'success': True,
            'notifications': [{
                'id': n[0],
                'title': n[1],
                'message': n[2],
                'type': n[3],
                'is_read': n[4],
                'created_at': n[5].isoformat()
            } for n in notifications]
        })

    except Exception as e:
        print(f"Get notifications error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to get notifications'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Mark notification as read
        cur.execute('''
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = %s AND user_id = %s
            RETURNING id
        ''', (notification_id, user_id))
        
        if cur.rowcount == 0:
            return jsonify({'success': False, 'message': 'Notification not found'}), 404
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })

    except Exception as e:
        print(f"Mark notification read error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to mark notification as read'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/profile/picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        if 'profile_picture' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
            
        file = request.files['profile_picture']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
            
        if file and allowed_file(file.filename):
            user_id = get_jwt_identity()
            filename = secure_filename(f"{user_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Store the file path in the database
            conn = get_db()
            if not conn:
                return jsonify({'success': False, 'message': 'Database error'}), 500
            cur = conn.cursor()
            try:
                cur.execute('''
                    UPDATE user_profiles 
                    SET profile_picture_url = %s 
                    WHERE user_id = %s
                ''', (f"/uploads/profile_pictures/{filename}", user_id))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'profile_picture_url': f"/uploads/profile_pictures/{filename}"
                })
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                cur.close()
                if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                    conn.close()
                
        return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
    except Exception as e:
        print(f"Upload profile picture error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to upload profile picture: {str(e)}'}), 500

@flask_app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Example chat logic
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        user_message = data.get('message', '')
        response = process_chat_message(user_message)  # Replace with actual chat processing logic
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

def process_chat_message(user_message):
    """Process the chat message and return a response."""
    # Replace this with actual chat processing logic
    return f"Echo: {user_message}"

if __name__ == '__main__':
    flask_app.run(port=5000)