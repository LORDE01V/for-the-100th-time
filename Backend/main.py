# main.py
import sys
import os
import requests # Import requests library
import json
import secrets
from datetime import timedelta, datetime # Keep if needed for token expiration or timestamps
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import threading
import uvicorn
import psycopg2
from psycopg2 import OperationalError, sql
from werkzeug.security import generate_password_hash, check_password_hash # For password handling
# Assuming get_db and execute_query are in support.py or db_utils.py
from support import get_db, execute_query, create_user, get_user_by_email, update_user_by_id # Import necessary user ops from support
from functools import lru_cache # For caching Eskom areas
import logging # For unified logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Add the Backend directory and its parent to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))  # Current directory: Backend
parent_dir = os.path.dirname(backend_dir)  # Parent directory: for-the-100th-time
sys.path.append(backend_dir)  # Add Backend
sys.path.append(parent_dir)  # Add for-the-100th-time, to ensure subpackages are accessible


# Load environment variables
load_dotenv()

# Configuration (use environment variables for secrets in production)
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32)) # General secret key
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32)) # Specific JWT key

# ================= FastAPI APP =================
app = FastAPI(
    title="Solar Optimizer Backend API",
    description="API for energy optimization, loadshedding, and user management.",
    version="1.0.0"
)

# Configure CORS globally for FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://gridx-frrontend.onrender.com", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000", "http://192.168.18.3:5000"], # Add all necessary origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT setup for FastAPI (using python-jose if real JWTs are needed, otherwise mock for now)
# For a proper JWT implementation in FastAPI, you'd typically use python-jose
# and create a token based on the user ID. Since your Flask app was using
# `create_access_token` from `Flask-JWT-Extended` and the FastAPI side was mock,
# I will keep the mock token for now, but mark this for future proper implementation.

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- FastAPI Models ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    message: str
    history: List[dict] # Assuming chat history structure

# --- FastAPI Routes (Authentication) ---
@app.post("/api/auth/register")
async def register_user(user: UserRegister):
    conn = None
    try:
        conn = get_db()
        if not conn:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection error")

        existing_user = get_user_by_email(user.email.lower())
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

        hashed_pw = generate_password_hash(user.password, method='pbkdf2:sha256', salt_length=8)
        
        user_id = create_user(user.email.lower(), hashed_pw, user.name, user.phone)
        if user_id:
            return {"message": "User registered successfully", "user_id": user_id}
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.post("/api/auth/login")
async def login_user(user_login: UserLogin):
    conn = None
    try:
        conn = get_db()
        if not conn:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection error")

        user = get_user_by_email(user_login.email.lower())
        if not user or not check_password_hash(user['password_hash'], user_login.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        # In a real app, you'd generate a proper JWT here
        # For now, just return a success message
        return {"message": "Login successful", "user": {"email": user["email"], "name": user["full_name"]}}
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

class HuggingFaceChatbot:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        self.headers = {"Authorization": f"Bearer {os.getenv('HF_API_TOKEN')}"}

    def query(self, payload):
        response = requests.post(self.api_url, headers=self.headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json()

    def get_response(self, message):
        output = self.query({
            "inputs": message,
        })
        # Assuming the response format is a list of dicts with 'generated_text'
        if isinstance(output, list) and output and 'generated_text' in output[0]:
            return output[0]['generated_text']
        return "Sorry, I couldn't get a response from the AI."

hf_chatbot = HuggingFaceChatbot()

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        response_text = hf_chatbot.get_response(chat_message.message)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

ESKOM_API_KEY = os.getenv('ESKOMSEPUSH_API_KEY')
ESKOM_API_BASE_URL = "https://loadshedding.eskom.sepush.co.za/api/v2"

@app.get("/api/loadshedding/national-status")
async def get_national_status():
    try:
        response = requests.get(f"{ESKOM_API_BASE_URL}/status", headers={'token': ESKOM_API_KEY})
        response.raise_for_status()
        data = response.json()
        return {"data": data}
    except requests.exceptions.RequestException as e:
        logger.error(f"Eskom API request failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve national loadshedding status.")

@lru_cache(maxsize=128)
def _get_eskom_areas_cached(text, eskom_api_key):
    try:
        response = requests.get(f"{ESKOM_API_BASE_URL}/areas_search?text={text}", headers={'token': eskom_api_key})
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Eskom areas search API request failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve Eskom areas.")

@app.get("/api/loadshedding/area")
async def get_area_schedule(area_id: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None):
    try:
        if area_id:
            response = requests.get(f"{ESKOM_API_BASE_URL}/area?id={area_id}", headers={'token': ESKOM_API_KEY})
        elif lat and lon:
            response = requests.get(f"{ESKOM_API_BASE_URL}/area?lat={lat}&lon={lon}", headers={'token': ESKOM_API_KEY})
        else:
            raise HTTPException(status_code=400, detail="Please provide an area_id or latitude and longitude.")

        response.raise_for_status()
        data = response.json()
        return {"data": data}
    except requests.exceptions.RequestException as e:
        logger.error(f"Eskom area schedule API request failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve loadshedding schedule for the specified area.")

OPEN_METEO_API_URL = os.getenv('OPEN_METEO_API_URL')

@app.get("/api/weather")
async def get_weather(lat: Optional[float] = None, lon: Optional[float] = None, areaId: Optional[str] = None):
    if not lat or not lon:
        if areaId:
            # Fallback to Nominatim for coordinates if only areaId is provided
            nominatim_url = f"https://nominatim.openstreetmap.org/search?q={areaId}&format=json&limit=1"
            try:
                geo_response = requests.get(nominatim_url, headers={'User-Agent': 'SolarOptimizerApp/1.0'})
                geo_response.raise_for_status()
                geo_data = geo_response.json()
                if geo_data:
                    lat = float(geo_data[0]['lat'])
                    lon = float(geo_data[0]['lon'])
                else:
                    raise HTTPException(status_code=404, detail="Area not found for weather data.")
            except requests.exceptions.RequestException as e:
                logger.error(f"Nominatim API request failed: {e}")
                raise HTTPException(status_code=500, detail="Could not get coordinates for the area.")
        else:
            raise HTTPException(status_code=400, detail="Latitude and longitude or an areaId are required.")

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,apparent_temperature,precipitation,rain,weathercode,cloudcover,windspeed_10m",
        "daily": "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum",
        "current_weather": "true",
        "timezone": "auto"
    }
    try:
        response = requests.get(OPEN_METEO_API_URL, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Open-Meteo API request failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve weather data.")

# Placeholder for AI Suggestions (from Flask app.routes.ai_suggestions.py)
@app.get("/api/ai-suggestions")
async def get_ai_suggestions():
    # This was a Flask route. Placeholder for now.
    # Integrate logic from app.services.ai_service.py if needed.
    return {"message": "AI Suggestions endpoint - Not implemented in FastAPI yet.", "suggestions": []}

# Placeholder for AI Agent (from Flask app.routes.ai_agent.py)
@app.post("/api/ai-agent")
async def handle_ai_agent_fastapi(request_data: dict):
    # This was a Flask route from app.routes.ai_agent.py. Placeholder for now.
    # Integrate the full logic including GREETINGS, FAREWELLS, system_prompt, and OpenRouter API call.
    return {"message": "AI Agent endpoint - Not implemented in FastAPI yet.", "response": "Hello! How can I help you today?"}

from utils.onesignal_helper import send_push_notification

@app.post("/api/notify/test")
async def test_push_notification_fastapi(message_data: dict):
    player_id = message_data.get("player_id")
    heading = message_data.get("heading", "Test Notification")
    content = message_data.get("content", "This is a test notification from FastAPI.")

    if not player_id:
        raise HTTPException(status_code=400, detail="player_id is required.")

    try:
        response_data = send_push_notification(player_id, heading, content)
        return {"message": "Test notification sent successfully", "response": response_data}
    except Exception as e:
        logger.error(f"Failed to send test push notification: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {e}")

@app.post("/api/notifications/send")
async def send_notification_fastapi(message_data: dict):
    player_id = message_data.get("player_id")
    heading = message_data.get("heading", "New Notification")
    content = message_data.get("content", "You have a new message.")

    if not player_id:
        raise HTTPException(status_code=400, detail="player_id is required.")

    try:
        response_data = send_push_notification(player_id, heading, content)
        return {"message": "Notification sent successfully", "response": response_data}
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {e}")


# Placeholder for AI Plan Suggestion (from Flask app.routes.ai_suggestions.py -> suggest_plan)
@app.post("/api/ai/suggest-plan")
async def suggest_plan_fastapi(data: dict):
    # Re-implementing Flask's suggest_plan logic
    # This should interact with an AI model to suggest a plan based on usage data.
    # For now, it's a simple placeholder.
    usage_hours = data.get("usage_hours", 0)
    device_count = data.get("device_count", 0)

    # Simple mock logic for demonstration
    if usage_hours > 100 or device_count > 5:
        suggested_plan = "Premium Plan"
    else:
        suggested_plan = "Basic Plan"

    return {"message": "Plan suggestion generated", "suggested_plan": suggested_plan}

@app.post("/api/log")
async def log_message_fastapi(log_entry: dict):
    level = log_entry.get("level", "info").upper()
    message = log_entry.get("message", "No message provided.")
    
    if level == "INFO":
        logger.info(message)
    elif level == "WARNING":
        logger.warning(message)
    elif level == "ERROR":
        logger.error(message)
    elif level == "DEBUG":
        logger.debug(message)
    else:
        logger.info(f"Unknown log level {level}: {message}")

    return {"status": "success", "message": "Log received"}
