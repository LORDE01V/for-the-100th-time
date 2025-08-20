from flask import Blueprint, request, jsonify
from Backend.support import execute_query
from .auth_middleware import token_required

expensenotifications_bp = Blueprint('expensenotifications', __name__)

@expensenotifications_bp.route('/user/notifications', methods=['GET'])
@token_required
def get_notifications():
    user_id = request.user_id  # Get user_id from token
    # The user_id is now retrieved from the token, so this check is redundant
    # if not user_id:
    #     return jsonify({'error': 'Missing user_id'}), 400

    query = """
        SELECT id, message, created_at, is_read
        FROM notifications
        WHERE user_id = %s
        ORDER BY created_at DESC
    """
    results = execute_query('search', query, (user_id,))
    notifications = []
    if results:
        for row in results:
            notifications.append({
                'id': row[0],
                'message': row[1],
                'created_at': row[2].isoformat(),
                'is_read': row[3]
            })
    return jsonify({'notifications': notifications}), 200