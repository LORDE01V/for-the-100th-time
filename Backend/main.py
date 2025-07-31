# main.py
import sys
import os
import requests # Import requests library
import json

# Get the absolute path to the project root (for-the-100th-time directory)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import timedelta, datetime
import secrets
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import threading
import uvicorn
from flask import Blueprint, url_for, session
from email_utils import send_welcome_email
from app import create_app
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from support import connect_db
from app.routes.supportt import support_bp 
from app.routes.community_stories import community_stories_bp
from app.routes.userprofile import profile_bp
from app.routes.notification_preference import notifications_bp
from app.routes.events_calendar import events_calendar_bp
from app.routes.topup import topup_bp
from Backend.app.routes.expenses import expenses_bp
from app.routes.expensenotifications import expensenotifications_bp
from Backend.support import update_user_balance
from app.routes.group_buying import group_buying_bp
#from Backend.support import add_story
from Backend.support import save_support_request
# from Backend.support import save_payment_method # Commented out
# from Backend.support import fetch_user_payment_methods # Commented out
# Add the Backend directory and its parent to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))  # Current directory: Backend
parent_dir = os.path.dirname(backend_dir)  # Parent directory: for-the-100th-time
sys.path.append(backend_dir)  # Add Backend
sys.path.append(parent_dir)  # Add for-the-100th-time, to ensure subpackages are accessible

# Load environment variables (same as support.py)
load_dotenv()

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
flask_app.config['JWT_HEADER_TYPE'] = 'Bearer' 

# Initialize CORS properly in one place
CORS(flask_app, 
     resources={r"/api/*": {
         "origins": ["http://localhost:3000", "https://backened-h577.onrender.com", "http://127.0.0.1:3000","https://frontend-7td4.onrender.com"],
         "supports_credentials": True,
         "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin","X-Requested-With"],
         #"expose_headers": ["Authorization"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
     }}
)
jwt = JWTManager(flask_app)

# Register blueprints
flask_app.register_blueprint(home_bp)
flask_app.register_blueprint(auth_bp, name='auth_blueprint', url_prefix='/api/auth')
flask_app.register_blueprint(support_bp)
flask_app.register_blueprint(community_stories_bp)
flask_app.register_blueprint(profile_bp)
flask_app.register_blueprint(notifications_bp, url_prefix='/notifications')
flask_app.register_blueprint(events_calendar_bp)
flask_app.register_blueprint(topup_bp, url_prefix='/api')
flask_app.register_blueprint(expenses_bp, url_prefix='/api')
flask_app.register_blueprint(expensenotifications_bp, url_prefix='/api')
flask_app.register_blueprint(group_buying_bp, url_prefix='/api')


# Remove the after_request handler entirely to avoid conflicts
# @flask_app.after_request
# def add_cors_headers(response):
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
#     response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
#     return response

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

# Auth routes (updated for PostgreSQL)
from flask import request, jsonify
import traceback

@flask_app.route('/api/auth/register', methods=['POST'])
def flask_register():
    conn = None
    try:
        data = request.get_json()
        print("Received registration data:", data)
        
        if not all(key in data for key in ['name', 'email', 'password']):
            print("Missing required fields")
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        phone = data.get('phone', None)

        conn = get_db()
        if not conn:
            print("Database connection error")
            return jsonify({'success': False, 'message': 'Database error'}), 500

        with conn.cursor() as cur:
            print("Checking for existing user...")
            cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            if cur.fetchone():
                print("Email already exists")
                return jsonify({'success': False, 'message': 'Email already exists'}), 400

            print("Inserting new user...")
            hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=8)
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (%s, %s, %s, %s) RETURNING id, email, full_name""",
                (data['email'].lower(), hashed_pw, data['name'], phone)
            )
            user_data = cur.fetchone()
            if not user_data:
                print("Failed to create user")
                return jsonify({'success': False, 'message': 'Failed to create user'}), 500
            conn.commit()

        try:
            print("Sending welcome email...")
            send_welcome_email(data['email'], data['name'])
        except Exception as email_error:
            print("Failed to send welcome email:", email_error)

        print("Registration successful:", user_data)
        return jsonify({
            'success': True,
            'user': {
                'id': user_data[0],
                'email': user_data[1],
                'name': user_data[2]
            }
        }), 201

    except Exception as e:
        print(f"Registration Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if conn:
            conn.close()

@flask_app.route('/api/auth/login', methods=['POST'])
def flask_login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()  # Force lowercase
        password = data.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Missing credentials'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        with conn.cursor() as cur:
            cur.execute('''
                SELECT id, password_hash, full_name 
                FROM users 
                WHERE email = %s
            ''', (email,))
            user = cur.fetchone()

            if user and check_password_hash(user[1], password):
                access_token = create_access_token(identity=user[0])
                return jsonify({
                    'success': True,
                    'token': access_token,
                    'user': {
                        'id': user[0],
                        'name': user[2],
                        'email': email
                    }
                }), 200

        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        flask_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if conn:
            conn.close()

@flask_app.route('/api/topup', methods=['OPTIONS'])
def handle_topup_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true' 
    return response


@flask_app.route('/api/topup', methods=['POST'])
def api_topup():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400
    user_id = data.get('user_id')
    amount = data.get('amount')
    new_balance = update_user_balance(user_id, amount)
    return jsonify({'newBalance': new_balance, 'success': True})




@flask_app.route('/api/solar/systems', methods=['POST'])
@jwt_required()
def flask_create_solar_system():
    """Handle solar system installations"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's add_solar_system()
    # ... implementation ...
    return jsonify({'message': 'Solar system creation not implemented yet'}), 501

@flask_app.route('/api/contracts', methods=['POST'])
@jwt_required()
def flask_create_solar_contract():
    """Handle contract creation"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's create_contract()
    # ... implementation ...
    return jsonify({'message': 'Contract creation not implemented yet'}), 501

@flask_app.route('/api/payments', methods=['POST'])
@jwt_required()
def flask_record_payment():
    """Handle payment processing"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's record_payment()
    # ... implementation ...
    return jsonify({'message': 'Payment recording not implemented yet'}), 501

@flask_app.route('/api/contracts', methods=['GET'])
@jwt_required()
def flask_get_contracts():
    """Get user's solar contracts"""
    current_user = get_jwt_identity()
    # Add authorization and call support.py's get_user_contracts()
    # ... implementation ...
    return jsonify({'message': 'Get contracts not implemented yet'}), 501

@flask_app.errorhandler(404)
def not_found(e):
    return jsonify(error="Route not found"), 404

# Initialize Hugging Face API details
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY') # Make sure you set this env var
MISTRAL_MODEL_ID = os.getenv('MISTRAL_MODEL_ID', 'mistralai/Mistral-7B-Instruct-v0.1')
HUGGINGFACE_API_URL = f"https://api-inference.huggingface.co/models/{MISTRAL_MODEL_ID}"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
    "Content-Type": "application/json"
}

# Replace DummyChatbot with a class that queries Hugging Face
class HuggingFaceChatbot:
    def get_response(self, message):
        payload = {
            "inputs": message,
            "parameters": {
                "max_new_tokens": 150, # Adjust as needed
                "temperature": 0.7,    # Adjust for creativity
                "return_full_text": False # Get only the generated part
            },
            "options": {
                "wait_for_model": True # Wait if the model is loading
            }
        }
        try:
            response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload)
            response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
            result = response.json()
            if isinstance(result, list) and result:
                # Assuming the response structure from inference API
                # Mistral-7B-Instruct-v0.1 typically returns a list of dicts with 'generated_text'
                generated_text = result[0].get('generated_text', '').strip()
                # The model might echo the prompt back, so we need to clean it
                # A simple way for instruct models is to look for the model's response part
                if generated_text.startswith(message):
                    generated_text = generated_text[len(message):].strip()
                return generated_text if generated_text else "I couldn't generate a specific response. Can you try again?"
            return "I received an unexpected response from the AI model."
        except requests.exceptions.RequestException as e:
            print(f"Hugging Face API Error: {e}")
            return "I'm having trouble connecting to my AI brain right now. Please try again later."
        except Exception as e:
            print(f"Chatbot processing error: {e}")
            return "An internal error occurred while processing your request."

chatbot = HuggingFaceChatbot() # Initialize your actual chatbot here

# ================= FASTAPI APP =================
app = FastAPI(title="Lumina Solar FastAPI")

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://frontend-7td4.onrender.com"],
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
@app.post("/fastapi/auth/register")
async def fastapi_register(user: UserRegister):
    """FastAPI version of /api/auth/register"""
    conn = None
    try:
        conn = get_db()
        if not conn:  # Check if connection failed
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
            
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email exists")

            hashed_pw = generate_password_hash(user.password)
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (%s, %s, %s, %s) RETURNING id, email, full_name""",
                (user.email, hashed_pw, user.name, user.phone)
            )
            user_data = cur.fetchone()
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Account deleted successfully'
            })
            
    # except Exception as e:
    #         # Rollback in case of error
    #         if conn:  # Ensure conn is not None before rollback
    #             conn.rollback()
    #         print(f"Error during account deletion: {str(e)}")
    #         raise
            
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
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.post("/fastapi/auth/login")
async def fastapi_login(user: UserLogin, topic_id: int):
    """FastAPI version of /api/auth/login"""
    conn = None
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


# GET /api/events - Fetch all events
@flask_app.route('/api/events', methods=['GET'])
@jwt_required()
def get_events():
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute("SELECT date, title, start, end, description, location, event_type FROM events")
        events = cur.fetchall()

        # Convert events to a dictionary
        events_dict = {
            event[0]: {
                "title": event[1],
                "start": event[2],
                "end": event[3],
                "description": event[4],
                "location": event[5],
                "eventType": event[6]
            }
            for event in events
        }

        return jsonify(events_dict), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch events'}), 500

# POST /api/events - Save a new event
@flask_app.route('/api/events', methods=['POST'])
@jwt_required()
def save_event():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Extract event details
        date = data.get('date')
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        description = data.get('description')
        location = data.get('location')
        event_type = data.get('eventType')

        # Validate required fields
        if not all([date, title, start, end, description, location, event_type]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO events (date, title, start, end, description, location, event_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (date) DO UPDATE
            SET title = EXCLUDED.title,
                start = EXCLUDED.start,
                end = EXCLUDED.end,
                description = EXCLUDED.description,
                location = EXCLUDED.location,
                event_type = EXCLUDED.event_type
            """,
            (date, title, start, end, description, location, event_type)
        )
        conn.commit()

        return jsonify({'success': True, 'message': 'Event saved successfully'}), 201
    except Exception as e:
        print(f"Error saving event: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to save event'}), 500

# DELETE /api/events/<date> - Delete an event for a specific date
@flask_app.route('/api/events/<date>', methods=['DELETE'])
@jwt_required()
def delete_event(date):
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute("DELETE FROM events WHERE date = %s", (date,))
        if cur.rowcount == 0:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        conn.commit()
        return jsonify({'success': True, 'message': 'Event deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete event'}), 500



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
            ticket_id = save_support_request(user_id, subject, message, priority)
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

# @flask_app.route('/api/payment-methods', methods=['POST']) # Commented out
# @jwt_required() # Commented out
# def add_payment_method(): # Commented out
#     try: # Commented out
#         # Debug logging # Commented out
#         print("=== Payment Method Creation Request Debug ===") # Commented out
#         print("Request Headers:", dict(request.headers)) # Commented out
#         print("Request Data:", request.get_json()) # Commented out
#         # Commented out
#         user_id = get_jwt_identity() # Commented out
#         print("User ID:", user_id) # Commented out
#         # Commented out
#         data = request.get_json() # Commented out
#         if not data: # Commented out
#             print("No data received in request") # Commented out
#             return jsonify({'success': False, 'message': 'No data provided'}), 400 # Commented out
# # Commented out
#         # Validate required fields # Commented out
#         required_fields = ['type', 'cardNumber', 'expiryDate', 'cardHolderName'] # Commented out
#         for field in required_fields: # Commented out
#             if field not in data: # Commented out
#                 print(f"Missing required field: {field}") # Commented out
#                 return jsonify({ # Commented out
#                     'success': False, # Commented out
#                     'message': f'Missing required field: {field}' # Commented out
#                 }), 400 # Commented out
# # Commented out
#         # Convert frontend field names to backend field names # Commented out
#         payment_data = { # Commented out
#             'payment_type': data['type'], # Commented out
#             'card_number': data['cardNumber'], # Commented out
#             'expiry_date': data['expiryDate'], # Commented out
#             'card_holder_name': data['cardHolderName'], # Commented out
#             'is_default': data.get('isDefault', False) # Commented out
#         } # Commented out
# # Commented out
#         print("Processed payment data:", payment_data) # Commented out
# # Commented out
#         # Save payment method # Commented out
#         conn = get_db() # Commented out
#         if not conn: # Commented out
#             return jsonify({'success': False, 'message': 'Database error'}), 500 # Commented out
#         cur = conn.cursor() # Commented out
#         try: # Commented out
#             result = save_payment_method( # Commented out
#                 user_id=user_id, # Commented out
#                 payment_type=payment_data['payment_type'], # Commented out
#                 card_number=payment_data['card_number'], # Commented out
#                 expiry_date=payment_data['expiry_date'], # Commented out
#                 card_holder_name=payment_data['card_holder_name'], # Commented out
#                 is_default=payment_data['is_default'] # Commented out
#             ) # Commented out
# # Commented out
#             print("Save payment method result:", result) # Commented out
# # Commented out
#             if result: # Commented out
#                 # Create notification for successful payment method addition # Commented out
#                 try: # Commented out
#                     # Create notification # Commented out
#                     cur.execute(''' # Commented out
#                         INSERT INTO notifications (user_id, title, message, type) # Commented out
#                         VALUES (%s, %s, %s, %s) # Commented out
#                     ''', ( # Commented out
#                         user_id, # Commented out
#                         'Payment Method Added', # Commented out
#                         f'Successfully added a new {payment_data["payment_type"]} payment method.', # Commented out
#                         'success' # Commented out
#                     )) # Commented out
#                     conn.commit() # Commented out
#                 except Exception as e: # Commented out
#                     print(f"Error creating notification: {str(e)}") # Commented out
#                     conn.rollback() # Commented out
# # Commented out
#             return jsonify({ # Commented out
#                 'success': True, # Commented out
#                 'message': 'Payment method saved successfully', # Commented out
#                 'payment_method_id': result # Commented out
#             }) # Commented out
#         except Exception as e: # Commented out
#             print("Error saving payment method:", str(e)) # Commented out
#             import traceback # Commented out
#             print("Traceback:", traceback.format_exc()) # Commented out
#             return jsonify({'success': False, 'message': str(e)}), 500 # Commented out
#     except Exception as e: # Commented out
#         print("Error saving payment method:", str(e)) # Commented out
#         import traceback # Commented out
#         print("Traceback:", traceback.format_exc()) # Commented out
#         return jsonify({'success': False, 'message': str(e)}), 500 # Commented out
# # Commented out
# @flask_app.route('/api/payment-methods', methods=['GET']) # Commented out
# @jwt_required() # Commented out
# def get_payment_methods(): # Commented out
#     conn = None  # Initialize conn to None # Commented out
#     try: # Commented out
#         user_id = get_jwt_identity() # Commented out
#         payment_methods = fetch_user_payment_methods(user_id) # Commented out
#         # Commented out
#         # Format the payment methods for the frontend # Commented out
#         formatted_methods = [] # Commented out
#         # Commented out
#         # Check if payment_methods is not None and is iterable # Commented out
#         if payment_methods: # Commented out
#             for method in payment_methods: # Commented out
#                 try: # Commented out
#                     formatted_method = { # Commented out
#                         'id': method['id'],  # Assuming id is the first column # Commented out
#                         'payment_type': method['payment_type'], # Commented out
#                         'card_number': method['card_number'], # Commented out
#                         'expiry_date': method['expiry_date'].strftime('%m/%y') if method['expiry_date'] else None, # Commented out
#                         'card_holder_name': method['card_holder_name'], # Commented out
#                         'is_default': method['is_default'], # Commented out
#                         'created_at': method['created_at'].isoformat() if method['created_at'] else None  # Add created_at # Commented out
#                     } # Commented out
#                     formatted_methods.append(formatted_method) # Commented out
#                 except (IndexError, AttributeError) as e: # Commented out
#                     print(f"Error formatting payment method: {str(e)}") # Commented out
#                     continue # Commented out
#         # Commented out
#         print("Debug - Formatted payment methods:", formatted_methods)  # Debug log # Commented out
#         # Commented out
#         return jsonify({ # Commented out
#             'success': True, # Commented out
#             'payment_methods': formatted_methods # Commented out
#         }) # Commented out
#     except Exception as e: # Commented out
#         raise HTTPException(status_code=500, detail=str(e)) # Commented out
#     finally: # Commented out
#         if conn: conn.close() # Commented out


class ChatMessage(BaseModel):
    message: str
    history: List[dict]

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        response = chatbot.get_response(chat_message.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Correctly defining and handling the Flask /api/ai-agent route
@flask_app.route('/api/ai-agent', methods=['POST'])
def ai_agent_openrouter():
    data = request.get_json(force=True, silent=True)
    if not data or 'prompt' not in data or not data['prompt'].strip():
        return jsonify({'response': 'Prompt is required'}), 400
    prompt = data['prompt'].strip()

    # Guardrails: Only answer energy/solar/forecast/loadshedding/dashboard queries
    allowed_keywords = [
        'energy', 'solar', 'forecast', 'loadshedding', 'dashboard', 'usage', 'optimizer', 'battery', 'panel', 'grid', 'power', 'consumption', 'generation', 'saving', 'outage', 'electricity', 'renewable', 'weather', 'sunlight', 'pv', 'inverter', 'subscription', 'tariff', 'billing', 'alert', 'notification', 'report', 'trend', 'ai', 'suggestion', 'tip', 'support', 'device', 'area', 'location', 'status', 'schedule', 'time', 'history', 'performance', 'maintenance', 'capacity', 'storage', 'efficiency', 'cost', 'payment', 'topup', 'transaction', 'user', 'profile', 'account', 'login', 'register', 'plan', 'upgrade', 'downgrade', 'settings', 'help', 'faq', 'contact', 'feedback', 'optimizer', 'optimizer agent', 'optimizer model', 'optimizer suggestion', 'optimizer plan', 'optimizer forecast', 'optimizer dashboard', 'optimizer usage', 'optimizer report', 'optimizer tip', 'optimizer support', 'optimizer device', 'optimizer area', 'optimizer location', 'optimizer status', 'optimizer schedule', 'optimizer time', 'optimizer history', 'optimizer performance', 'optimizer maintenance', 'optimizer capacity', 'optimizer storage', 'optimizer efficiency', 'optimizer cost', 'optimizer payment', 'optimizer topup', 'optimizer transaction', 'optimizer user', 'optimizer profile', 'optimizer account', 'optimizer login', 'optimizer register', 'optimizer plan', 'optimizer upgrade', 'optimizer downgrade', 'optimizer settings', 'optimizer help', 'optimizer faq', 'optimizer contact', 'optimizer feedback'
    ]
    prompt_lower = prompt.lower()
    if not any(kw in prompt_lower for kw in allowed_keywords):
        return jsonify({'response': "I'm only trained to assist with Solar Optimizer App queries like energy usage, solar data, forecast, and loadshedding. Please ask something related to that."}), 200

    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    if not OPENROUTER_API_KEY:
        return jsonify({'response': 'OpenRouter API key not set in environment.'}), 500

    try:
        api_url = 'https://openrouter.ai/api/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'HTTP-Referer': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'mistralai/mistral-small-3.2-24b-instruct',
            'messages': [
                { 'role': 'user', 'content': prompt }
            ]
        }
        resp = requests.post(api_url, headers=headers, data=json.dumps(payload), timeout=60)
        if resp.status_code == 200:
            result = resp.json()
            # OpenRouter returns choices[0].message.content
            answer = None
            if 'choices' in result and result['choices'] and 'message' in result['choices'][0]:
                answer = result['choices'][0]['message'].get('content', '').strip()
            if answer:
                return jsonify({'response': answer}), 200
            else:
                return jsonify({'response': 'No answer found from OpenRouter.'}), 200
        else:
            return jsonify({'response': f'OpenRouter error: {resp.status_code} - {resp.text}'}), 500
    except Exception as e:
        return jsonify({'response': f'Error contacting OpenRouter: {str(e)}'}), 500


# ================= RUN BOTH APPS =================
if __name__ == '__main__':
    print("=== Registered routes ===")
    for rule in flask_app.url_map.iter_rules():
        print(rule)
    print("=========================")
    flask_app.run(host='0.0.0.0', port=5000, debug=True)