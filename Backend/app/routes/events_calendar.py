from flask import Blueprint, request, jsonify
from Backend.support import create_event, get_all_events, delete_event

events_calendar_bp = Blueprint('events_calendar', __name__)

@events_calendar_bp.route('/api/events_calendar', methods=['POST'])
def create_event_route():
    data = request.json
    event_id = create_event(
        title=data['title'],
        start=data['start'],
        end=data['end'],
        description=data['description'],
        location=data['location'],
        event_type=data['eventType']
    )
    return jsonify({'id': event_id}), 201

@events_calendar_bp.route('/api/events_calendar', methods=['GET'])
def get_events_route():
    events = get_all_events()
    return jsonify(events)

@events_calendar_bp.route('/api/events_calendar/<int:event_id>', methods=['DELETE'])
def delete_event_route(event_id):
    delete_event(event_id)
    return '', 204