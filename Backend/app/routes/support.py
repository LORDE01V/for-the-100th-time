from flask import Blueprint, request, jsonify
#from support import save_support_request
from Backend.support import save_support_request

support_bp = Blueprint('support', __name__)

@support_bp.route('/api/support', methods=['POST'])
def submit_support():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    if not all([name, email, message]):
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        save_support_request(name, email, subject, message)
        return jsonify({'success': True, 'message': 'Support request submitted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500