import sys
import os

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
from hugging_services import HuggingFaceChatbot
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from support import connect_db

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

# Initialize extensions
CORS(flask_app, 
     resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5000"]}},
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

            # Create user with proper hash length
            hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=8)  # Explicit method
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (%s, %s, %s, %s) RETURNING id, email, full_name""",
                (data['email'].lower(), hashed_pw, data['name'], phone)  # Force lowercase
            )
            user_data = cur.fetchone()
            conn.commit()

        send_welcome_email(data['email'], data['name'])

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
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if conn: conn.close()

@flask_app.route('/api/auth/login', methods=['POST'])
def flask_login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()  # Force lowercase
        password = data.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Missing credentials'}), 400

        conn = get_db()
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
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if conn:
            conn.close()

@flask_app.route('/api/solar/systems', methods=['POST'])
@jwt_required()
def flask_create_solar_system():
    """Handle solar system installations"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's add_solar_system()
    # ... implementation ...

@flask_app.route('/api/contracts', methods=['POST'])
@jwt_required()
def flask_create_solar_contract():
    """Handle contract creation"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's create_contract()
    # ... implementation ...

@flask_app.route('/api/payments', methods=['POST'])
@jwt_required()
def flask_record_payment():
    """Handle payment processing"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's record_payment()
    # ... implementation ...

@flask_app.route('/api/contracts', methods=['GET'])
@jwt_required()
def flask_get_contracts():
    """Get user's solar contracts"""
    current_user = get_jwt_identity()
    # Add authorization and call support.py's get_user_contracts()
    # ... implementation ...

@flask_app.errorhandler(404)
def not_found(e):
    return jsonify(error="Route not found"), 404

# ================= FASTAPI APP =================
app = FastAPI(title="Lumina Solar FastAPI")

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

        return {
            "success": True,
            "user": {"id": user_data[0], "email": user_data[1], "name": user_data[2]}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.post("/fastapi/auth/login")
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
                token = create_access_token(identity=db_user[0])
                return {
                    "success": True,
                    "token": token,
                    "user": {"id": db_user[0], "name": db_user[3], "email": db_user[1]}
                }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

# Initialize chatbot
chatbot = HuggingFaceChatbot()

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

# ================= RUN BOTH APPS =================
if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=5000, debug=True)

conn, cur = connect_db()
if conn: print("✅ Database connection successful")
else: print("❌ Database connection failed")