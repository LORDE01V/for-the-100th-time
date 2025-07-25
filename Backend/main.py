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
from dotenv import load_dotenv

from flask import Blueprint, url_for, session
from email_utils import send_welcome_email
from app import app as flask_app
from hugging_services import HuggingFaceChatbot
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from support import connect_db, initialize_db

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
ESKOM_TOKEN = os.getenv("ESKOM_TOKEN")

# ================= FLASK APP =================
# Rename existing app to flask_app
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
flask_app.register_blueprint(home_bp)
flask_app.register_blueprint(auth_bp, name='auth_bp')

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


@flask_app.errorhandler(404)
def not_found(e):
    return jsonify(error="Route not found"), 404

# Initialize chatbot
chatbot = HuggingFaceChatbot()

# Chat endpoint
@flask_app.route("/api/chat", methods=['POST'])
def chat_endpoint():
    try:
        data = request.json
        message = data.get('message', '')
        response = chatbot.get_response(message)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@flask_app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    """
    Converts voice (audio) input to text using the chatbot's voice processing.
    Expects a file upload with the key 'audio'.
    """
    try:
        # No logger defined here, so using print for now.
        print("Received voice-to-text request")
        if 'audio' not in request.files:
            print("No audio file in request")
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        print(f"Processing audio file: {audio_file.filename}")
        
        # Save the .webm file (no ffmpeg conversion)
        temp_path = 'temp_audio.webm'
        audio_file.save(temp_path)
        print(f"Saved audio file to {temp_path}")
        
        # Pass .webm file directly to the chatbot
        text = chatbot.process_voice_query(temp_path)
        print(f"Processed text: {text}")
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print("Cleaned up temporary audio file")
            
        return jsonify({'text': text})
    except Exception as e:
        print(f"Error in voice-to-text endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

from Energy_optimizer.agent import EnergyUsageOptimizerAgent # Import here

@flask_app.route('/api/energy-optimizer', methods=['GET'])
def optimize_energy():
    """
    Analyzes energy usage and returns optimization recommendations.
    """
    print("Energy optimizer endpoint called")
    try:
        agent = EnergyUsageOptimizerAgent()
        results = agent.analyze_usage()
        print(f"Energy optimization results: {results}")
        return jsonify(results)
    except Exception as e:
        print(f"Error in energy optimizer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@flask_app.route('/api/areas', methods=['GET'])  # Added Eskom areas endpoint
def get_eskom_areas():
    """
    Fetches Eskom areas based on search text.
    """
    import requests # Import here
    text = request.args.get("text", "")
    if not text:
        return {"error": "Please provide search text"}, 400

    r = requests.get(
        f"https://developer.sepush.co.za/business/2.0/areas_search?text={text}",
        headers={"token": ESKOM_TOKEN}
    )
    data = r.json()
    return data

@flask_app.route('/api/version', methods=['GET'])
def version():
    """
    Returns the current version of the backend API.
    """
    version_info = {
        'version': '1.0.0',
        'description': 'Backend API for energy optimizer and chatbot'
    }
    print(f"Version info requested: {version_info}")
    return jsonify(version_info)

@flask_app.route('/api/ai/suggest-plan', methods=['POST'])
def suggest_plan():
    try:
        data = request.json  # Expecting JSON with usageHours, budget, deviceCount
        print(f"Received suggest-plan request: {data}")
        # Simple mock logic: Based on input, return a plan (e.g., 'Pro Saver' if budget > 50)
        if data and data.get('budget', 0) > 50:
            return jsonify({'plan': 'Pro Saver'})
        else:
            return jsonify({'plan': 'Basic Plan'})
    except Exception as e:
        print(f"Error in suggest-plan endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@flask_app.route('/api/log', methods=['POST'])
def log_message():
    try:
        import datetime # Import here
        message = request.json.get('message', '')
        log_file_path = os.path.abspath('../frontend/frontend.log')  # Path relative to backend
        with open(log_file_path, 'a') as log_file:
            log_file.write(f"{datetime.datetime.now()} - {message}\n")
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================= RUN FLASK APP =================
if __name__ == '__main__':
    # Ensure the database table is created when running locally
    from support import create_topup_table # Import from support now
    create_topup_table()

    print("Starting Flask app on port 5000")
    flask_app.run(host='0.0.0.0', port=5000, debug=True)