from flask import Blueprint, request, jsonify
from Backend.support import create_event, get_all_events, delete_event

events_calendar_bp = Blueprint('events_calendar', __name__)

# ... existing code ...

@events_calendar_bp.route('/api/events_calendar', methods=['POST'])
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
            datetime.strptime(data['start'], '%Y-%m-%d %H:%M:%S')
            datetime.strptime(data['end'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({'error': 'Invalid date format for start or end. Use YYYY-MM-DD HH:MM:SS'}), 400

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
def get_events_route():
    events = get_all_events()
    return jsonify(events)

@events_calendar_bp.route('/api/events_calendar/<int:event_id>', methods=['DELETE'])
def delete_event_route(event_id):
    delete_event(event_id)
    return '', 204