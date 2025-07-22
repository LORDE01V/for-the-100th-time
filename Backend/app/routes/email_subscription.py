from flask import Blueprint, request, jsonify
import os
import requests
from app.utils.sendgrid_utils import add_email_to_sendgrid_list

email_subscription_bp = Blueprint('email_subscription_bp', __name__)

@email_subscription_bp.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json(force=True)
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    success, message = add_email_to_sendgrid_list(email)
    if success:
        print(f"[Subscribe] {email} subscribed successfully.")
        return jsonify({"success": True, "message": message}), 200
    else:
        print(f"[Subscribe] Failed to subscribe {email}: {message}")
        return jsonify({"success": False, "error": message}), 400 