import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Define your models here
class Event(db.Model):
    # Example fields; adjust as necessary
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(100), nullable=False)  # Adjust type as needed
    description = db.Column(db.String(255), default='')

# Define the blueprint
events_calendar_bp = Blueprint('events_calendar', __name__)

@events_calendar_bp.route('/api/events', methods=['POST'])
def create_event():
    from app.models import Event  # Move import here to avoid circular import
    data = request.get_json()
    
    # Validate incoming data
    if not data or 'title' not in data or 'date' not in data:
        return jsonify({'error': 'Invalid data, title and date are required.'}), 400

    # Create a new event instance
    new_event = Event(
        title=data['title'],
        date=data['date'],
        description=data.get('description', '')  # Default to empty string if not provided
    )
    
    try:
        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Event created successfully', 'event': new_event.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500