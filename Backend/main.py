from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
import secrets
import os
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from email_utils import send_welcome_email
from dotenv import load_dotenv
from support import (
    get_user_balance,
    get_user_expenses,
    create_expense,
    process_top_up_transaction,
    get_user_auto_top_up_settings,
    save_user_auto_top_up_settings,
    toggle_auto_top_up,
    # create_support_ticket,  # Temporarily commented out due to ImportError; add to support.py if needed
    # add_story,  # Temporarily commented out if not defined in support.py; add if required
    initialize_db,
    get_user_by_email,
    create_user,
    update_user_by_id,
    get_db
)

load_dotenv()

flask_app = Flask(__name__)
flask_app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
flask_app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

CORS(flask_app)
jwt = JWTManager(flask_app)

flask_app.register_blueprint(home_bp)
flask_app.register_blueprint(auth_bp)

@flask_app.route('/api/topup/balance', methods=['GET'])
@jwt_required()
def get_balance():
    user_id = get_jwt_identity()
    balance = get_user_balance(user_id)
    return jsonify({'success': True, 'balance': balance})

@flask_app.route('/api/auto-topup/settings', methods=['GET'])
@jwt_required()
def get_auto_top_up_settings():
    user_id = get_jwt_identity()
    settings = get_user_auto_top_up_settings(user_id)
    return jsonify({'success': True, 'settings': settings})

@flask_app.route('/api/auto-topup/settings', methods=['POST'])
@jwt_required()
def save_auto_top_up_settings():
    user_id = get_jwt_identity()
    data = request.get_json()
    success = save_user_auto_top_up_settings(user_id, data.get('enabled'), data.get('threshold'), data.get('amount'))
    return jsonify({'success': success})

@flask_app.route('/api/auto-topup/toggle', methods=['POST'])
@jwt_required()
def toggle_auto_top_up_route():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = toggle_auto_top_up(user_id, data.get('enable'))
    return jsonify(result)

@flask_app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    return jsonify({'success': True, 'notifications': []})

@flask_app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    return jsonify({'success': True, 'message': 'Notification marked as read'})

@flask_app.route('/api/profile/picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    return jsonify({'success': True, 'message': 'Upload successful'})

@flask_app.route('/api/chat', methods=['POST'])
def chat():
    return jsonify({'success': True, 'response': 'Chat message received'})

if __name__ == '__main__':
    try:
        initialize_db()
    except Exception as e:
        print(f'Error: {e}')
    flask_app.run(debug=True)