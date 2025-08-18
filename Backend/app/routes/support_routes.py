from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db

support_bp = Blueprint('support', __name__)

@support_bp.route('/api/support', methods=['POST'])
def submit_support_request():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')

        if not all([name, email, message]):
            return jsonify({'error': 'Name, email, and message are required.'}), 400

        conn, cur = connect_db()
        cur.execute(
            '''
            INSERT INTO support_requests (name, email, subject, message)
            VALUES (%s, %s, %s, %s)
            ''',
            (name, email, subject, message)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Support request submitted successfully'}), 200

    except Exception as e:
        print("Support request submission error:", e)
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({'error': 'Failed to submit support request', 'details': str(e)}), 500
