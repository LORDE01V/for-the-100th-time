from flask import Blueprint, request, jsonify
from Backend.support import execute_query

expensenotifications_bp = Blueprint('expensenotifications', __name__)

@expensenotifications_bp.route('/user/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

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