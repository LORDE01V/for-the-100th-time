import ssl
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime
import re
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from hugging_services import HuggingFaceChatbot
import logging
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager
from app.routes.auth import auth_bp
from app.routes.loadshedding import loadshedding_bp # This import might be redundant if loadshedding routes are directly in app.py
from app.routes.email import email_bp # This import might be redundant if email routes are directly in app.py

# SSL workaround for dev
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
print("ESKOMSEPUSH_API_KEY:", os.environ.get("ESKOMSEPUSH_API_KEY"))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")

# CORS
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# OAuth
oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'}
)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default_jwt_secret_key")
jwt = JWTManager(app)

# Register blueprints (ensure these are correctly defined if they exist as separate files)
app.register_blueprint(auth_bp)
# app.register_blueprint(loadshedding_bp) # Commented out if loadshedding routes are directly in app.py
# app.register_blueprint(email_bp) # Commented out if email routes are directly in app.py

chatbot = HuggingFaceChatbot()

# SendGrid (ensure this is only if you're using SendGrid directly in app.py, not via email_bp)
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail

# --- Chatbot Endpoints ---
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        if not message:
            return jsonify({'error': 'Message field is required'}), 400
        logger.info(f"Received message: {message}")
        response = chatbot.get_response(message)
        logger.info(f"Sending response: {response}")
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

import tempfile

@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    try:
        logger.info("Received voice-to-text request")
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({'error': 'No audio file provided'}), 400
        audio_file = request.files['audio']
        logger.info(f"Processing audio file: {audio_file.filename}")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name
        logger.info(f"Saved audio file to {temp_path}")
        text = chatbot.process_voice_query(temp_path)
        logger.info(f"Processed text: {text}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info("Cleaned up temporary audio file")
        return jsonify({'text': text})
    except Exception as e:
        logger.error(f"Error in voice-to-text endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

# --- Energy Optimizer Endpoint (if agent available) ---
try:
    from agent import EnergyUsageOptimizerAgent
    AGENT_AVAILABLE = True
except ImportError:
    AGENT_AVAILABLE = False

@app.route('/api/energy-optimizer', methods=['GET'])
def optimize_energy():
    logger.info("Energy optimizer endpoint called")
    if not AGENT_AVAILABLE:
        return jsonify({'error': 'EnergyUsageOptimizerAgent not available'}), 500
    try:
        agent = EnergyUsageOptimizerAgent()
        results = agent.analyze_usage()
        logger.info(f"Energy optimization results: {results}")
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in energy optimizer: {str(e)}")
        return jsonify({'error': str(e)}), 500

# --- Eskom Areas Search Endpoint ---
@app.route('/api/areas', methods=['GET'])
def get_eskom_areas():
    # Correctly use ESKOMSEPUSH_API_KEY from .env
    eskom_api_key = os.getenv("ESKOMSEPUSH_API_KEY") 
    text = request.args.get("text", "")
    if not text:
        return jsonify({"error": "Please provide search text"}), 400
    if not eskom_api_key:
        return jsonify({"error": "ESKOMSEPUSH_API_KEY not set in environment variables."}), 500

    try:
        r = requests.get(
            f"https://developer.sepush.co.za/business/2.0/areas_search?text={text}",
            headers={"Token": eskom_api_key}
        )
        r.raise_for_status() # Raise an exception for HTTP errors
        return jsonify(r.json())
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Eskom areas: {e}")
        return jsonify({"error": f"Failed to fetch Eskom areas: {e}"}), 500


# --- Health Check ---
@app.route('/api/health', methods=['GET'])
def health_check():
    logger.info("Health check requested")
    return jsonify({'status': 'ok', 'message': 'Server is healthy'})

# --- Version Endpoint ---
@app.route('/api/version', methods=['GET'])
def version():
    version_info = {
        'version': '1.0.0',
        'description': 'Backend API for energy optimizer and chatbot'
    }
    logger.info(f"Version info requested: {version_info}")
    return jsonify(version_info)

# --- AI Suggest Plan Endpoint ---
@app.route('/api/ai/suggest-plan', methods=['POST'])
def suggest_plan():
    try:
        data = request.json
        logger.info(f"Received suggest-plan request: {data}")
        if data and data.get('budget', 0) > 50:
            return jsonify({'plan': 'Pro Saver'})
        else:
            return jsonify({'plan': 'Basic Plan'})
    except Exception as e:
        logger.error(f"Error in suggest-plan endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# --- Logging Endpoint ---
@app.route('/api/log', methods=['POST'])
def log_message():
    try:
        message = request.json.get('message', '')
        log_file_path = os.path.abspath('backend.log')
        with open(log_file_path, 'a') as log_file:
            log_file.write(f"{datetime.now()} - {message}\n")
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Weather Endpoint ---
# Add or update this dictionary at the top of your app.py (or above the endpoint)
AREA_COORDINATES = {
    "johannesburg": {"latitude": -26.2023, "longitude": 28.0436},
    "capetown": {"latitude": -33.9249, "longitude": 18.4241},
    "durban": {"latitude": -29.8587, "longitude": 31.0218},
    "pretoria": {"latitude": -25.7479, "longitude": 28.2293},
    "bloemfontein": {"latitude": -29.0852, "longitude": 26.1596},
    "portelizabeth": {"latitude": -33.9608, "longitude": 25.6022},
    "eastlondon": {"latitude": -33.0153, "longitude": 27.9116},
    "polokwane": {"latitude": -23.9045, "longitude": 29.4689},
    "nelspruit": {"latitude": -25.4658, "longitude": 30.9853},
    "kimberley": {"latitude": -28.7383, "longitude": 24.7637},
    "pietermaritzburg": {"latitude": -29.6006, "longitude": 30.3794},
    "george": {"latitude": -33.9648, "longitude": 22.4617},
    # ...add more as needed
}

@app.route('/api/weather')
def weather():
    # 1. Try to get lat/lon from query params
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if lat and lon:
        latitude = float(lat)
        longitude = float(lon)
    else:
        # 2. Fallback to areaId if no lat/lon provided
        area_id = request.args.get('areaId', 'johannesburg').lower()
        coords = AREA_COORDINATES.get(area_id, AREA_COORDINATES["johannesburg"])
        latitude = coords["latitude"]
        longitude = coords["longitude"]

    base_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max",
        "hourly": "temperature_2m,relative_humidity_2m",
        "timezone": "auto"
    }

    try:
        response = requests.get(base_url, params=params, timeout=30)
        data = response.json()
        if isinstance(data, list):
            data = data[0]

        # --- Transform daily data ---
        daily = data.get("daily", {})
        daily_forecast = []
        for i in range(len(daily.get("time", []))):
            daily_forecast.append({
                "date": daily["time"][i],
                "temperature_2m_max": daily["temperature_2m_max"][i],
                "temperature_2m_min": daily["temperature_2m_min"][i],
                "sunrise": daily["sunrise"][i],
                "sunset": daily["sunset"][i],
                "daylight_duration": daily.get("daylight_duration", [None]*len(daily["time"]))[i],
                "sunshine_duration": daily.get("sunshine_duration", [None]*len(daily["time"]))[i],
                "uv_index_max": daily.get("uv_index_max", [None]*len(daily["time"]))[i],
                "uv_index_clear_sky_max": daily.get("uv_index_clear_sky_max", [None]*len(daily["time"]))[i],
            })

        # --- Transform hourly data ---
        hourly = data.get("hourly", {})
        hourly_forecast = []
        for i in range(len(hourly.get("time", []))):
            hourly_forecast.append({
                "time": hourly["time"][i],
                "temperature_2m": hourly["temperature_2m"][i],
                "relative_humidity_2m": hourly["relative_humidity_2m"][i],
            })

        return jsonify({
            "daily_forecast": daily_forecast,
            "hourly_forecast": hourly_forecast
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "Weather service timed out. Please try again later."}), 504
    except Exception as e:
        import traceback
        print("=== WEATHER API ERROR ===")
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to fetch weather: {str(e)}"}), 500

# --- OneSignal Notification Endpoints ---
@app.route("/api/notify/test", methods=["POST"])
def test_push_notification():
    onesignal_api_key = os.getenv("ONESIGNAL_API_KEY")
    onesignal_app_id = os.getenv("ONESIGNAL_APP_ID")
    if not onesignal_api_key or not onesignal_app_id:
        logging.error("OneSignal API Key or App ID not set in environment variables.")
        return jsonify({"error": "OneSignal API Key or App ID not set in environment variables"}), 500
    message = "This is a test push notification from your Flask backend!"
    heading = "Test Push Notification"
    notification_url = "https://onesignal.com/api/v1/notifications"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {onesignal_api_key}"
    }
    payload = {
        "app_id": onesignal_app_id,
        "included_segments": ["All"],
        "contents": {"en": message},
        "headings": {"en": heading},
        "channel_for_external_user_ids": "push",
    }
    try:
        logging.info(f"Sending OneSignal test notification with payload: {payload}")
        response = requests.post(notification_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        logging.info(f"OneSignal test response: {response.json()}")
        return jsonify({"status": "success", "message": "Test push notification sent!", "onesignal_response": response.json()}), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending OneSignal test notification: {e}")
        return jsonify({"error": f"Failed to send test push notification: {e}"}), 500
    except Exception as e:
        logging.exception("Exception in /api/notify/test")
        return jsonify({"error": str(e)}), 500

@app.route("/api/notifications/send", methods=["POST"])
def send_notification():
    onesignal_api_key = os.getenv("ONESIGNAL_API_KEY")
    onesignal_app_id = os.getenv("ONESIGNAL_APP_ID")
    if not onesignal_api_key or not onesignal_app_id:
        logging.error("OneSignal API Key or App ID not set in environment variables.")
        return jsonify({"error": "OneSignal API Key or App ID not set in environment variables"}), 500
    data = request.get_json()
    message = data.get("message")
    heading = data.get("heading", "Loadshedding Update")
    if not message:
        return jsonify({"error": "Message is required for notification"}), 400
    notification_url = "https://onesignal.com/api/v1/notifications"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {onesignal_api_key}"
    }
    payload = {
        "app_id": onesignal_app_id,
        "included_segments": ["All"],
        "contents": {"en": message},
        "headings": {"en": heading},
        "channel_for_external_user_ids": "push",
    }
    try:
        logging.info(f"Sending OneSignal notification with payload: {payload}")
        response = requests.post(notification_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        logging.info(f"OneSignal response: {response.json()}")
        return jsonify({"status": "success", "onesignal_response": response.json()}), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending OneSignal notification: {e}")
        return jsonify({"error": f"Failed to send notification: {e}"}), 500
    except Exception as e:
        logging.exception("Exception in /api/notifications/send")
        return jsonify({"error": str(e)}), 500

# --- SendGrid Email Test Endpoint ---
@app.route("/api/email/test", methods=["POST"])
def test_email_notification():
    sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
    sender_email = os.getenv("COMPANY_EMAIL")
    data = request.get_json()
    recipient_email = data.get("recipient_email")
    if not sendgrid_api_key or not sender_email:
        logging.error("SendGrid API Key or Sender Email not set in environment variables.")
        return jsonify({"error": "SendGrid API Key or Sender Email not set in environment variables"}), 500
    if not recipient_email:
        logging.error("Recipient email not provided in request body.")
        return jsonify({"error": "Recipient email not provided in request body"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", recipient_email):
        logging.error(f"Invalid email address provided: {recipient_email}")
        return jsonify({"error": "Invalid email address format"}), 400
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    subject = f"Test Email from Flask Backend - {timestamp}"
    html_content = f"""
    <h1>Test Email</h1>
    <p>This is a test email sent from your Flask backend using SendGrid.</p>
    <ul>
        <li><strong>Recipient:</strong> {recipient_email}</li>
        <li><strong>Timestamp:</strong> {timestamp}</li>
    </ul>
    <p>If you received this email, your SendGrid integration is working correctly.</p>
    """
    # Assuming SendGridAPIClient and Mail are imported if needed
    # from sendgrid import SendGridAPIClient
    # from sendgrid.helpers.mail import Mail
    try:
        # sendgrid_client = SendGridAPIClient(sendgrid_api_key)
        # response = sendgrid_client.send(message)
        # logging.info(f"SendGrid test email response: Status Code: {response.status_code}, Body: {response.body}, Headers: {response.headers}")
        # if response.status_code == 202:
        #     return jsonify({"status": "success", "message": "Test email sent successfully!"}), 200
        # else:
        #     return jsonify({"status": "error", "message": "Failed to send test email.", "sendgrid_response": {"status_code": response.status_code, "body": response.body.decode(), "headers": dict(response.headers)}}), response.status_code
        return jsonify({"status": "success", "message": "SendGrid email logic placeholder. Uncomment SendGrid code to enable."}), 200 # Placeholder for SendGrid logic
    except Exception as e:
        logging.exception("Exception in /api/email/test")
        return jsonify({"error": str(e)}), 500

# --- Static File Serving ---
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/loadshedding', methods=['GET'])
def get_loadshedding():
    area_id = request.args.get('areaId')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    eskom_api_key = os.getenv("ESKOMSEPUSH_API_KEY")  # Corrected to ESKOMSEPUSH_API_KEY

    headers = {"Token": eskom_api_key}

    if not eskom_api_key:
        return jsonify({"error": "ESKOMSEPUSH_API_KEY not set in environment variables."}), 500

    if area_id:
        try:
            status_resp = requests.get(
                f"https://developer.sepush.co.za/business/2.0/area?id={area_id}",
                headers=headers,
                timeout=10
            )
            status_resp.raise_for_status()
            return jsonify(status_resp.json())
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching loadshedding status for area {area_id}: {e}")
            return jsonify({"error": f"Failed to fetch loadshedding data for area {area_id}: {e}"}), 500

    if lat and lon:
        try:
            area_resp = requests.get(
                f"https://developer.sepush.co.za/business/2.0/areas_nearby?lat={lat}&lon={lon}",
                headers=headers,
                timeout=10
            )
            area_resp.raise_for_status()
            area_data = area_resp.json()
            if not area_data.get("areas"):
                return jsonify({"error": "No Eskom area found for this location"}), 404
            # If multiple areas, you might want to return a list or pick the closest
            # For simplicity, picking the first one found
            area_id_from_coords = area_data["areas"][0]["id"]
            status_resp = requests.get(
                f"https://developer.sepush.co.za/business/2.0/area?id={area_id_from_coords}",
                headers=headers,
                timeout=10
            )
            status_resp.raise_for_status()
            return jsonify(status_resp.json())
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching nearby loadshedding areas for lat={lat}, lon={lon}: {e}")
            return jsonify({"error": f"Failed to get nearby areas: {e}"}), 500

    return jsonify({"error": "Missing areaId or lat/lon"}), 400

if __name__ == '__main__':
    logger.info("Starting Flask app on port 5000")
    app.run(debug=True, port=5000)
