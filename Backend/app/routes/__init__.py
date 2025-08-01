# Backend/app/routes/__init__.py

from flask import Blueprint

# Create a blueprint for the events routes
events_bp = Blueprint('events', __name__)

# Import the routes to register them with the blueprint
from .events_calendar import create_event  # Adjust based on your actual route functions 