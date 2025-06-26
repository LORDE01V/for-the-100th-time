import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOMORROW_IO_KEY = os.getenv("TOMORROW_IO_API_KEY")
LOCATION = os.getenv("LOCATION")

def get_sunlight_hours():
    url = "https://api.tomorrow.io/v4/weather/forecast"
    params = {
        "location": LOCATION,
        "fields": "cloudCover",
        "timesteps": "1h",
        "apikey": TOMORROW_IO_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    sunlight_hours = []

    try:
        intervals = data["data"]["timelines"][0]["intervals"]
        for interval in intervals:
            time = interval["startTime"][11:16]  # get HH:MM
            cloud_cover = interval["values"]["cloudCover"]
            if cloud_cover < 30:
                sunlight_hours.append(time)
    except Exception as e:
        sunlight_hours.append(f"Error: {str(e)}")

    return sunlight_hours[:5] or ["No clear hours found"]
