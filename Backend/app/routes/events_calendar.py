from flask import Blueprint, request, jsonify, current_app
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Define the Event model
class Event(db.Model):
    __tablename__ = 'events_calendar'  # Explicit table name for clarity
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(100), nullable=False)  # Adjust type as needed
    description = db.Column(db.String(255), default='')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date,
            'description': self.description
        }

# Define the blueprint
events_calendar_bp = Blueprint('events_calendar', __name__)

@events_calendar_bp.route('/api/events', methods=['POST'])
def create_event():
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
        current_app.logger.error(f"Error creating event: {e}")
        return jsonify({'error': str(e)}), 500

@events_calendar_bp.route('/api/events', methods=['GET'])
def get_events():
    try:
        events = Event.query.all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching events: {e}")
        return jsonify({'error': 'Failed to fetch events'}), 500

@events_calendar_bp.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404

        db.session.delete(event)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting event: {e}")
        return jsonify({'error': 'Failed to delete event'}), 500