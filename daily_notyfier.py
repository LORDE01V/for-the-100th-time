# daily_notifier.py
import requests
import os
import time
import schedule
from dotenv import load_dotenv
from pathlib import Path
import logging

# Set up logging for the notifier script
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load .env from the project root (assuming this script is run from project root or its parent)
# Adjust path if this script is in a different directory relative to .env
env_path = Path(__file__).resolve().parent.parent / '.env' # Assumes script is in 'backend/' or similar
load_dotenv(dotenv_path=env_path)

BACKEND_URL = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:5000") # Ensure this points to your Flask app

def get_national_loadshedding_status_from_backend():
    """Fetches national loadshedding status from your Flask backend."""
    try:
        logger.info(f"Attempting to fetch national loadshedding status from backend: {BACKEND_URL}/api/loadshedding/national-status")
        response = requests.get(f"{BACKEND_URL}/api/loadshedding/national-status", timeout=15) # Increased timeout
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching national status from backend: {e}")
        return None
    except Exception as e:
        logger.exception("Unexpected error in get_national_loadshedding_status_from_backend")
        return None

def send_onesignal_notification_via_backend(message_content, heading="Loadshedding Update"):
    """Sends a OneSignal notification by calling your Flask backend endpoint."""
    try:
        logger.info(f"Attempting to send OneSignal notification via backend: {BACKEND_URL}/api/notifications/send")
        response = requests.post(
            f"{BACKEND_URL}/api/notifications/send",
            json={"message": message_content, "heading": heading},
            timeout=15 # Increased timeout
        )
        response.raise_for_status()
        logger.info(f"Notification sent successfully via backend: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending OneSignal notification via backend: {e}")
        return False
    except Exception as e:
        logger.exception("Unexpected error in send_onesignal_notification_via_backend")
        return False

def daily_loadshedding_notification_job():
    """Job to fetch loadshedding status and send a daily notification."""
    logger.info("Running daily loadshedding notification job...")
    status_data = get_national_loadshedding_status_from_backend()

    if status_data and status_data.get("status"):
        stage = status_data["status"].get("stage", "Unknown Stage")
        next_event_info = "No upcoming events."
        if status_data["events"]:
            # Assuming events are sorted, take the first one
            first_event = status_data["events"][0]
            start_time = first_event.get('start')
            end_time = first_event.get('end')
            event_stage = first_event.get('stage')

            # Format dates nicely
            try:
                start_dt = requests.utils.parse_datetime(start_time)
                end_dt = requests.utils.parse_datetime(end_time)
                next_event_info = f"Next: Stage {event_stage} from {start_dt.strftime('%H:%M')} to {end_dt.strftime('%H:%M')} on {start_dt.strftime('%Y-%m-%d')}."
            except Exception as dt_e:
                logger.warning(f"Could not parse date/time for next event: {dt_e}")
                next_event_info = f"Next: Stage {event_stage} from {start_time} to {end_time}."
        
        message = f"Good morning! The current national loadshedding stage is {stage}. {next_event_info}"
        heading = "Daily Loadshedding Update"
        send_onesignal_notification_via_backend(message, heading)
    else:
        logger.warning("Could not fetch national loadshedding status for daily notification. Skipping notification.")

# Schedule the reminder at 06:00 AM daily
schedule.every().day.at("06:00").do(daily_loadshedding_notification_job)
logger.info("Daily loadshedding notifier scheduled for 06:00 AM.")

if __name__ == "__main__":
    logger.info("Daily loadshedding notifier started. Waiting for scheduled jobs...")
    while True:
        schedule.run_pending()
        time.sleep(1) # Check every 1 second
