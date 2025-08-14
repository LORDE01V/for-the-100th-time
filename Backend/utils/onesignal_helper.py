# utils/onesignal_helper.py
import requests
import os
from dotenv import load_dotenv
load_dotenv()

ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID")
ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY")

def get_subscribers():
    url = f"https://onesignal.com/api/v1/players?app_id={ONESIGNAL_APP_ID}"
    headers = {
        "Authorization": f"Basic {ONESIGNAL_API_KEY}",
        "Content-Type": "application/json"
    }

    # WARNING: Disabling SSL verification is INSECURE. This is kept from previous versions
    # of the code but should be addressed by fixing the CA certificate chain.
    response = requests.get(url, headers=headers, verify=False)
    return response.json()

def tag_user_location(player_id, location):
    """
    Applies a tag to a specific user/player in OneSignal.
    """
    url = f"https://onesignal.com/api/v1/players/{player_id}"
    headers = {
        "Authorization": f"Basic {ONESIGNAL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "tags": {
            "loadshedding_location": location.lower().replace(" ", "_") # Sanitize tag
        }
    }
    
    # WARNING: See above warning about verify=False
    response = requests.put(url, headers=headers, json=payload, verify=False)
    response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
    return response.json()
