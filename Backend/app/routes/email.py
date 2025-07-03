from flask import Blueprint, jsonify, session
from app.services.gmail_service import get_user_emails
import os

email_bp = Blueprint('email', __name__)

@email_bp.route('/api/emails')
def get_emails():
    if 'google_token' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        access_token = session['google_token']['access_token']
        emails = get_user_emails(access_token)
        return jsonify(emails)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 