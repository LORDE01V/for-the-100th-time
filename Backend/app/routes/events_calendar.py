from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from Backend.support import create_event, get_all_events, delete_event

events_calendar_bp = Blueprint('events_calendar', __name__)


@events_calendar_bp.route('/api/events_calendar', methods=['POST'])
@jwt_required()
def create_event_route():
    try:
        # Parse incoming JSON data
        data = request.json

        # Validate required fields
        required_fields = ['title', 'start', 'end', 'description', 'location', 'eventType']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Validate field types (example: start and end should be valid timestamps)
        try:
            from datetime import datetime
            datetime.strptime(data['start'], '%Y-%m-%dT%H:%M')
            datetime.strptime(data['end'], '%Y-%m-%dT%H:%M')
        except ValueError:
            return jsonify({'error': 'Invalid date format for start or end. Use YYYY-MM-DDTHH:MM'}), 400

        # Call the create_event function to save the event
        event_id = create_event(
            title=data['title'],
            start=data['start'],
            end=data['end'],
            description=data['description'],
            location=data['location'],
            event_type=data['eventType']
        )

        # Return success response
        return jsonify({'id': event_id}), 201

    except Exception as e:
        # Handle unexpected errors
        return jsonify({'error': f'Failed to create event: {str(e)}'}), 500

@events_calendar_bp.route('/api/events_calendar', methods=['GET'])
@jwt_required()
def get_events_route():
    try:
        events = get_all_events()
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch events: {str(e)}'}), 500