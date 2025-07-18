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
from app.routes.ai_agent import ai_agent_bp

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

# Initialize CORS properly in one place
CORS(flask_app, 
     resources={r"/api/*": {
         "origins": ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"],
         "supports_credentials": True,
         "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
         "expose_headers": ["Authorization"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
     }}
)
jwt = JWTManager(flask_app)

# Register blueprints
# flask_app.register_blueprint(home_bp)
# flask_app.register_blueprint(auth_bp, name='auth_bp')
# flask_app.register_blueprint(ai_agent_bp)
flask_app.register_blueprint(ai_agent_bp, url_prefix='/api')

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
        flask_app.logger.error(f"Login error: {str(e)}") # Changed app.logger to flask_app.logger
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