from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from support import create_support_ticket
from db_utils import connect_db  # Import get_db from db_utils

# Create a Blueprint for support routes
support_bp = Blueprint('support', __name__)

# Route to create a support ticket
@support_bp.route('/api/support/ticket', methods=['POST'])
@jwt_required()
def handle_support_ticket():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        required_fields = ['subject', 'message']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        user_id = get_jwt_identity()  # Get user_id from JWT

        priority = data.get('priority', 'normal')

        result = create_support_ticket(
    name=data['name'],
    email=data['email'],
    subject=data['subject'],
    message=data['message']
)

        conn, cur = connect_db()
        if conn:
            conn.commit()

        return jsonify({'success': True, 'ticket_id': result}), 201

    except Exception as e:
        print(f"Error creating support ticket: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create support ticket'}), 500


# Route to fetch all support tickets
@support_bp.route('/api/support/tickets', methods=['GET'])
@jwt_required()
def fetch_support_tickets():
    try:
        conn = connect_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        tickets = fetch_support_tickets(conn)
        return jsonify({'success': True, 'tickets': tickets}), 200

    except Exception as e:
        print(f"Error fetching support tickets: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch support tickets'}), 500