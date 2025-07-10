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

    # WARNING: Disabling SSL verification is INSECURE and should only be used for development or
    # in controlled environments where the risks are understood. It makes the application
    # vulnerable to Man-in-the-Middle attacks.
    # The 'Basic Constraints of CA cert not marked critical' error suggests an issue with the
    # SSL certificate itself or the CA chain. The recommended solution is to fix the certificate
    # or update the system's trusted CA certificates.
    response = requests.get(url, headers=headers, verify=False)
    return response.json()
