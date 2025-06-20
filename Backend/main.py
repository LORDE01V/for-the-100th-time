from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import timedelta, datetime
import secrets
import os
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
    create_payment_methods_table
)
from werkzeug.utils import secure_filename
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional

# Load environment variables (same as support.py)
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize extensions
# Update CORS configuration to:
# Initialize extensions
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
jwt = JWTManager(app)

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
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        if len(password) < 8:
            return jsonify({'success': False, 'message': 'Password must be at least 8 characters'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()

        # Check if email exists (now in PostgreSQL users table)
        cur.execute('SELECT * FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 400

        # Hash password and insert (using users table from support.py)
        hashed_password = generate_password_hash(password)
        cur.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id',
            (email, hashed_password, name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        # Generate token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'success': True,
            'token': access_token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
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
                }
            })

        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            conn.close()

# ================= FASTAPI APP =================
fastapi_app = FastAPI(title="Lumina Solar FastAPI")

# CORS (match Flask's config)
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT (compatible with Flask's tokens)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/fastapi/auth/login")

# --- FastAPI Models ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

# --- FastAPI Routes ---
@fastapi_app.post("/fastapi/auth/register")
async def fastapi_register(user: UserRegister):
    """FastAPI version of /api/auth/register"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            # Check if email exists
            cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            # Hash password and insert
            hashed_password = generate_password_hash(user.password)
            cur.execute(
                'INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id',
                (user.email, hashed_password, user.name)
            )
            user_id = cur.fetchone()[0]
            conn.commit()

            # Create token
            access_token = create_access_token(identity=str(user_id))
            
            return {
                'success': True,
                'token': access_token,
                'user': {
                    'id': user_id,
                    'name': user.name,
                    'email': user.email
                }
            }

    except Exception as e:
        print(f"FastAPI Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")
    finally:
        if conn:
            conn.close()

@fastapi_app.post("/fastapi/auth/login")
async def fastapi_login(user: UserLogin):
    """FastAPI version of /api/auth/login"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, email, password_hash, full_name FROM users WHERE email = %s',
                (user.email,)
            )
            db_user = cur.fetchone()

            if db_user and check_password_hash(db_user[2], user.password):
                token = create_access_token(identity=str(db_user[0]))
                return {
                    "success": True,
                    "token": token,
                    "user": {
                        "id": db_user[0],
                        "name": db_user[3],
                        "email": db_user[1]
                    }
                }
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# Add these profile endpoints
@app.route('/api/profile', methods=['GET'])
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
                        'social_accounts': {
                            'facebook_profile_url': profile[5],
                            'twitter_profile_url': profile[6],
                            'instagram_profile_url': profile[7]
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
            conn.close()

# Update the profile endpoint to match frontend expectations
@app.route('/api/profile', methods=['PUT'])
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

        return {
            "success": True,
            "user": {"id": user_data[0], "email": user_data[1], "name": user_data[2]}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.route('/api/forum/topics/<int:topic_id>/replies', methods=['POST'])
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
        
        reply_id, created_at = cur.fetchone()
        conn.commit()
        
        # Get author info
        cur.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        author_name = cur.fetchone()[0]
        
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
            conn.close()

@app.route('/api/support/ticket', methods=['POST', 'OPTIONS'])
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
            ticket_id = create_support_ticket(user_id, subject, message)
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

@app.route('/api/payment-methods', methods=['POST'])
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
            return jsonify({
                'success': True,
                'message': 'Payment method saved successfully',
                'payment_method_id': result
            })
        else:
            print("Failed to save payment method - no result returned")
            return jsonify({'success': False, 'message': 'Failed to save payment method'}), 500

    except Exception as e:
        print("Error saving payment method:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

# Add debug logging
@app.before_request
def log_request_info():
    print('Headers:', dict(request.headers))
    print('Body:', request.get_data())
    print('Method:', request.method)
    print('URL:', request.url)

@app.after_request
def after_request(response):
    print('Response:', response.get_data())
    return response

@app.route('/api/notifications', methods=['GET'])
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
            conn.close()

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
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
            conn.close()

@app.route('/api/profile/picture', methods=['POST'])
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
                conn.close()
                
        return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
    except Exception as e:
        print(f"Upload profile picture error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to upload profile picture: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)