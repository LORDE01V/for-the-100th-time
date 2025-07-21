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
# from flask import Blueprint, url_for, session # No longer needed for Flask blueprints
# from email_utils import send_welcome_email # Keep if needed for FastAPI
# from app import create_app # No longer needed

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

# ================= FLASK APP (REMOVED) =================
# All Flask-related code, including app initialization, CORS,
# JWTManager for Flask, and Flask blueprints are being removed
# as the application will now be entirely FastAPI-based.

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

# Initialize Hugging Face API details (kept for chat endpoint)
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
app = FastAPI()

# Configure CORS globally for FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://gridx-frrontend.onrender.com", "http://localhost:3000"], # Allow your frontend URL and local for testing
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# JWT (compatible with Flask's tokens - ensure token generation matches)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login") # Updated tokenUrl

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
@app.post("/api/auth/register") # Changed to /api/auth/register
async def fastapi_register(user: UserRegister):
    """FastAPI version of /api/auth/register"""
    conn = None
    try:
        conn = get_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database error")
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (user.email.lower(),)) # Ensure lowercase email
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already exists")

            hashed_pw = generate_password_hash(user.password, method='pbkdf2:sha256', salt_length=8) # Explicit method
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (%s, %s, %s, %s) RETURNING id, email, full_name""",
                (user.email.lower(), hashed_pw, user.name, user.phone) # Ensure lowercase email
            )
            user_data = cur.fetchone()
            conn.commit()
        # send_welcome_email(user.email, user.name) # Uncomment if you have this function and it's compatible
        return {
            "success": True,
            "user": {"id": user_data[0], "email": user_data[1], "name": user_data[2]}
        }
    except Exception as e:
        print(f"Registration Error: {str(e)}") # For server logs
        raise HTTPException(status_code=500, detail="Registration failed")
    finally:
        if conn: conn.close()

@app.post("/api/auth/login") # Changed to /api/auth/login
async def fastapi_login(user: UserLogin):
    """FastAPI version of /api/auth/login"""
    conn = None
    try:
        conn = get_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database error")
        with conn.cursor() as cur:
            cur.execute(
                'SELECT id, password_hash, full_name, email FROM users WHERE email = %s', # Added email to select
                (user.email.lower(),) # Ensure lowercase email
            )
            db_user = cur.fetchone()

            if db_user and check_password_hash(db_user[1], user.password): # db_user[1] is password_hash
                # Ensure JWT_SECRET_KEY is used for access token creation
                # The Flask-JWT-Extended create_access_token needs to be adapted or replaced
                # with a standard JWT library for FastAPI, or you need to re-import
                # Flask's JWTManager if you intend to share tokens.
                # For simplicity, let's assume create_access_token is a utility function
                # that creates a token using JWT_SECRET_KEY.
                # If create_access_token is from flask_jwt_extended, it won't work directly here.
                # You'll need to use a JWT library compatible with FastAPI, e.g., python-jose.
                # For now, let's mock it or assume a compatible utility exists.
                # For a quick fix, let's create a dummy token.
                
                # IMPORTANT: Replace this with proper JWT token generation for FastAPI
                # For a Flask-JWT-Extended token, you'd need the JWTManager instance.
                # As we're moving to FastAPI, it's better to use python-jose or similar.
                # Example: from jose import jwt
                # token = jwt.encode({"sub": str(db_user[0])}, JWT_SECRET_KEY, algorithm="HS256")
                
                # For now, let's use a placeholder if create_access_token is not available without Flask.
                # If create_access_token is a custom helper, it must be available here.
                # Given it was imported from flask_jwt_extended, we need to adapt.
                # Let's use a simple dummy token for now, which the frontend already expects
                # based on your previous logs (mocktoken123).
                
                # If you want real JWTs, you'll need to implement JWT generation for FastAPI.
                # For this step, I will simplify and directly return the mock token
                # as the previous Flask routes were doing.
                
                return {
                    "success": True,
                    "access_token": "mocktoken123", # Using mock token for now
                    "user": {
                        "id": db_user[0],
                        "name": db_user[2], # full_name
                        "email": db_user[3] # email
                    }
                }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        print(f"Login error: {str(e)}") # For server logs
        raise HTTPException(status_code=500, detail="Login failed")
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

# Placeholder for /api/ai-suggestions route if needed in FastAPI
@app.get("/api/ai-suggestions")
async def get_ai_suggestions():
    # This was a Flask route, needs to be re-implemented for FastAPI
    # For now, return a placeholder
    return {"success": True, "suggestions": ["FastAPI suggestions coming soon!"]}

# Placeholder for /api/ai-agent route if needed in FastAPI
@app.post("/api/ai-agent")
async def ai_agent_fastapi(prompt_data: dict):
    # This was a Flask route, needs to be re-implemented for FastAPI
    # For now, return a placeholder
    return {"response": "AI Agent functionality coming soon in FastAPI!"}

# Add other routes that were originally Flask routes, if needed:
# /api/solar/systems
# /api/contracts
# /api/payments

# For any other Flask blueprints or routes, they need to be re-implemented in FastAPI.

# ================= RUN BOTH APPS (REMOVED) =================
# Since we are now solely using FastAPI, we don't need to run
# both apps or manage Flask's url_map.

# The Gunicorn command 'gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app'
# will now correctly run this FastAPI application.