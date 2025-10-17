from flask import Blueprint, request, jsonify
from support import execute_query
from flask_jwt_extended import jwt_required, get_jwt_identity

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/preferences', methods=['GET', 'POST'])
@jwt_required()
def notification_preferences():
    # Use JWT identity as user id
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        # Fetch preferences
        query = "SELECT receive_sms, receive_email FROM notification_preference WHERE user_id = %s"
        result = execute_query('search', query, (user_id,))
        if result:
            return jsonify({
                'receiveSms': result[0][0],
                'receiveEmail': result[0][1]
            })
        return jsonify({'receiveSms': True, 'receiveEmail': True})  # Default values

    elif request.method == 'POST':
        # Save preferences
        data = request.json
        receive_sms = data.get('receiveSms', True)
        receive_email = data.get('receiveEmail', True)

        query = """
        INSERT INTO notification_preference (user_id, receive_sms, receive_email)
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET
            receive_sms = EXCLUDED.receive_sms,
            receive_email = EXCLUDED.receive_email
        RETURNING user_id
        """
        execute_query('insert', query, (user_id, receive_sms, receive_email))
        return jsonify({'message': 'Preferences updated successfully'})