# notification.py
import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID")
ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY")

logger = logging.getLogger(__name__)

HEADERS = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": f"Basic {ONESIGNAL_API_KEY}"
}

ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications"


def send_push_notification(title, message, url=None):
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "included_segments": ["Subscribed Users"],
        "headings": {"en": title},
        "contents": {"en": message},
    }
    if url:
        payload["url"] = url

    try:
        response = requests.post(ONESIGNAL_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        logger.info("Push notification sent successfully")
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Push notification error: {e}")
        return {"error": str(e)}


def send_email_notification(email, subject, message):
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "include_email_tokens": [email],
        "email_subject": subject,
        "email_body": message
    }
    try:
        response = requests.post(ONESIGNAL_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        logger.info("Email notification sent successfully")
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Email notification error: {e}")
        return {"error": str(e)}
