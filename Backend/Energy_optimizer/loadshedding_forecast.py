import os
import requests
from dotenv import load_dotenv

load_dotenv()

ESKOM_TOKEN = os.getenv("ESKOM_TOKEN")
AREA_ID = os.getenv("AREA_ID")

def get_load_shedding_schedule(area_id=None):
    """
    Fetches the load shedding schedule for a given area ID.
    If no area ID is provided, it defaults to the AREA_ID from environment variables.
    """
    if not area_id:
        area_id = os.getenv("AREA_ID")  # Default to environment variable if area_id is not provided

    url = "https://developer.sepush.co.za/business/2.0/area"
    headers = {"Token": ESKOM_TOKEN}
    params = {"id": area_id}

    try:
        r = requests.get(url, headers=headers, params=params)
        events = r.json().get("events", [])
        if not events:
            return ["No load shedding today"]
        return [f"{e['note']} at {e['start']}" for e in events]
    except Exception as e:
        return [f"Error: {str(e)}"]