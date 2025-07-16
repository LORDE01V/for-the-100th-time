from dotenv import load_dotenv
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from hugging_services import HuggingFaceChatbot
import logging
from agent import EnergyUsageOptimizerAgent
from sys import stdout  # Import for StreamHandler
from flask_jwt_extended import JWTManager
import datetime
from db_utils import create_topup_table  # Import the new function
from app.routes.topup import topup_bp  # Add this import

# Set up logging to console only
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(stdout)  # Log to console
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))  # Optional formatting
logger.addHandler(handler)  # Add the handler

load_dotenv()  # Load .env variables

ESKOM_TOKEN = os.getenv("ESKOM_TOKEN")  # Added Eskom token loading

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5000"]}})

# Add JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Remove hardcoded fallback
jwt = JWTManager(app)

chatbot = HuggingFaceChatbot()

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat endpoint for interacting with the HuggingFace chatbot.
    Expects JSON with a 'message' field.
    """
    try:
        data = request.json
        message = data.get('message', '')
        logger.info(f"Received message: {message}")
        response = chatbot.get_response(message)
        logger.info(f"Sending response: {response}")
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    """
    Converts voice (audio) input to text using the chatbot's voice processing.
    Expects a file upload with the key 'audio'.
    """
    try:
        logger.info("Received voice-to-text request")
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        logger.info(f"Processing audio file: {audio_file.filename}")
        
        # Save the .webm file (no ffmpeg conversion)
        temp_path = 'temp_audio.webm'
        audio_file.save(temp_path)
        logger.info(f"Saved audio file to {temp_path}")
        
        # Pass .webm file directly to the chatbot
        text = chatbot.process_voice_query(temp_path)
        logger.info(f"Processed text: {text}")
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info("Cleaned up temporary audio file")
            
        return jsonify({'text': text})
    except Exception as e:
        logger.error(f"Error in voice-to-text endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/energy-optimizer', methods=['GET'])
def optimize_energy():
    """
    Analyzes energy usage and returns optimization recommendations.
    """
    logger.info("Energy optimizer endpoint called")
    try:
        agent = EnergyUsageOptimizerAgent()
        results = agent.analyze_usage()
        logger.info(f"Energy optimization results: {results}")
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in energy optimizer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/areas', methods=['GET'])  # Added Eskom areas endpoint
def get_eskom_areas():
    """
    Fetches Eskom areas based on search text.
    """
    text = request.args.get("text", "")
    if not text:
        return {"error": "Please provide search text"}, 400

    r = requests.get(
        f"https://developer.sepush.co.za/business/2.0/areas_search?text={text}",
        headers={"token": ESKOM_TOKEN}
    )
    data = r.json()
    return data

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the server is running.
    """
    logger.info("Health check requested")
    return jsonify({'status': 'ok', 'message': 'Server is healthy'})

@app.route('/api/version', methods=['GET'])
def version():
    """
    Returns the current version of the backend API.
    """
    version_info = {
        'version': '1.0.0',
        'description': 'Backend API for energy optimizer and chatbot'
    }
    logger.info(f"Version info requested: {version_info}")
    return jsonify(version_info)

@app.route('/api/ai/suggest-plan', methods=['POST'])
def suggest_plan():
    try:
        data = request.json  # Expecting JSON with usageHours, budget, deviceCount
        logger.info(f"Received suggest-plan request: {data}")
        # Simple mock logic: Based on input, return a plan (e.g., 'Pro Saver' if budget > 50)
        if data and data.get('budget', 0) > 50:
            return jsonify({'plan': 'Pro Saver'})
        else:
            return jsonify({'plan': 'Basic Plan'})
    except Exception as e:
        logger.error(f"Error in suggest-plan endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/log', methods=['POST'])
def log_message():
    try:
        message = request.json.get('message', '')
        log_file_path = os.path.abspath('../frontend/frontend.log')  # Path relative to backend
        with open(log_file_path, 'a') as log_file:
            log_file.write(f"{datetime.datetime.now()} - {message}\n")
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Call the table creation function here to ensure the table exists before the app starts
    create_topup_table()
    
    logger.info("Starting Flask app on port 5000")
    app.run(debug=True, port=5000)