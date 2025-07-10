import ssl
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime
import re

# WARNING: This disables SSL certificate verification globally for urllib.
# This is INSECURE and should only be used for development or in controlled
# environments where the risks are understood. It makes the application
# vulnerable to Man-in-the-Middle attacks.
# The recommended solution is to fix the SSL certificate issue or update
# the system's trusted CA certificates.
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    # Legacy Python that doesn't have _create_unverified_context
    pass
else:
    # Disable SSL certificate verification globally for urllib
    ssl._create_default_https_context = _create_unverified_https_context

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from hugging_services import HuggingFaceChatbot
import logging
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager
from app.routes.auth import auth_bp

# Debug checks for environment variables
# Debug checks for environment variables
# print("🔍 OPEN_METEO_API_URL:", os.getenv("OPEN_METEO_API_URL"))
# print("🔍 FLASK_SECRET_KEY:", os.getenv("FLASK_SECRET_KEY"))
# print("🔍 JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))
# print("🔍 ESKOM_PROXY:", os.getenv("ESKOM_PROXY")) # This is for the previous proxy, not the new ESKOM_SITE_URL
# print("🔍 ESKOM_SITE_URL:", os.getenv("ESKOM_SITE_URL")) # New env variable for the direct Eskom site
# print("🔍 ONESIGNAL_APP_ID:", os.getenv("ONESIGNAL_APP_ID"))
# print("🔍 ONESIGNAL_API_KEY:", os.getenv("ONESIGNAL_API_KEY"))

# Added debug prints for specific Eskom related variables
# for key in ["ESKOM_SITE_URL", "ESKOM_TOKEN", "ESKOM_PROXY"]:
#     print(f"{key}: {os.getenv(key)}")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")

# Configure CORS
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize OAuth
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

from app.routes.loadshedding import loadshedding_bp
from app.routes.email import email_bp
from app.routes.areas import areas_bp
app.register_blueprint(auth_bp)
app.register_blueprint(loadshedding_bp)
app.register_blueprint(email_bp)
app.register_blueprint(areas_bp)

chatbot = HuggingFaceChatbot()

# Import SendGrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

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

@app.route('/api/health', methods=['GET'])
def health_check():
    logger.info("Health check requested")
    return jsonify({'status': 'ok', 'message': 'Server is healthy'})

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

from datetime import datetime
import re

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

    # Basic email validation
    if not re.match(r"[^@]+@[^@]+\.[^@]+", recipient_email):
        logging.error(f"Invalid email address provided: {recipient_email}")
        return jsonify({"error": "Invalid email address format"}), 400

    # More detailed email content
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

    message = Mail(
        from_email=sender_email,
        to_emails=recipient_email,
        subject=subject,
        html_content=html_content
    )
    try:
        sendgrid_client = SendGridAPIClient(sendgrid_api_key)
        response = sendgrid_client.send(message)
        logging.info(f"SendGrid test email response: Status Code: {response.status_code}, Body: {response.body}, Headers: {response.headers}")
        if response.status_code == 202:
            return jsonify({"status": "success", "message": "Test email sent successfully!"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to send test email.", "sendgrid_response": {"status_code": response.status_code, "body": response.body.decode(), "headers": dict(response.headers)}}), response.status_code
    except Exception as e:
        logging.exception("Exception in /api/email/test")
        return jsonify({"error": str(e)}), 500


AREA_COORDINATES = {
    "johannesburg": {"latitude": -26.2041, "longitude": 28.0473},
    "capetown": {"latitude": -33.9249, "longitude": 18.4241},
    "durban": {"latitude": -29.8587, "longitude": 31.0218},
    "pretoria": {"latitude": -25.7479, "longitude": 28.2293},
    "bloemfontein": {"latitude": -29.0852, "longitude": 26.2159},
    "polokwane": {"latitude": -23.9045, "longitude": 29.4688},
    "nelspruit": {"latitude": -25.4773, "longitude": 30.9700},
    "kimberley": {"latitude": -28.7383, "longitude": 24.7630},
    "mafikeng": {"latitude": -25.8733, "longitude": 25.6713},
    "gqeberha": {"latitude": -33.9611, "longitude": 25.6102},
    "eastlondon": {"latitude": -33.0186, "longitude": 27.8942},
}

@app.route("/api/weather", methods=["GET"])
def get_weather():
    area_id = request.args.get('areaId', '').lower()

    if area_id not in AREA_COORDINATES:
        return jsonify({"error": "Invalid or unknown areaId. Supported areaIds are: " + ", ".join(AREA_COORDINATES.keys())}), 400

    coords = AREA_COORDINATES[area_id]
    latitude = coords["latitude"]
    longitude = coords["longitude"]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}&"
        f"daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max&"
        f"hourly=temperature_2m,relative_humidity_2m&timezone=auto"
    )

    try:
        logging.info(f"Fetching weather from: {url}")
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            logging.error(f"Weather API error: {response.status_code} {response.text}")
            return jsonify({"error": "Failed to fetch weather"}), response.status_code

        data = response.json()
        daily = data.get("daily", {})
        hourly = data.get("hourly", {})

        forecast_daily = []
        if 'time' in daily and len(daily['time']) > 0:
            for i in range(min(7, len(daily.get("time", [])))):
                forecast_daily.append({
                    "date": daily.get("time", [""])[i],
                    "temperature_2m_max": daily.get("temperature_2m_max", [None])[i],
                    "temperature_2m_min": daily.get("temperature_2m_min", [None])[i],
                    "sunshine_duration": daily.get("sunshine_duration", [None])[i],
                    "sunrise": daily.get("sunrise", [""])[i],
                    "sunset": daily.get("sunset", [""])[i],
                    "uv_index_max": daily.get("uv_index_max", [None])[i],
                    "daylight_duration": daily.get("daylight_duration", [None])[i]
                })

        forecast_hourly = []
        if 'time' in hourly and len(hourly['time']) > 0:
            for i in range(len(hourly.get("time", []))):
                forecast_hourly.append({
                    "time": hourly.get("time", [""])[i],
                    "temperature_2m": hourly.get("temperature_2m", [None])[i],
                    "relative_humidity_2m": hourly.get("relative_humidity_2m", [None])[i]
                })

        logging.info(f"Returning daily forecast: {forecast_daily}")
        logging.info(f"Returning hourly forecast: {forecast_hourly}")
        return jsonify({
            "daily_forecast": forecast_daily,
            "hourly_forecast": forecast_hourly
        })
    except Exception as e:
        logging.exception("Exception in /api/weather")
        return jsonify({"error": str(e)}), 500





# --- ONESIGNAL NOTIFICATION ENDPOINT ---
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
        "included_segments": ["All"], # Sends to all subscribed users
        "contents": {"en": message},
        "headings": {"en": heading},
        "channel_for_external_user_ids": "push", # Specify push channel
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

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    logger.info("Starting Flask app on port 5000")
    app.run(debug=True, port=5000)
