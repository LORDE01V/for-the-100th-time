from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import json
from flask import request, jsonify
import sys
import os

# Add this to ensure the Backend directory is in the path (if not already handled in main.py)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # This points to the Backend directory

from support import execute_query

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
@jwt_required()
def home_page():
    return jsonify({"status": "authenticated"})

@home_bp.route('/api/health')
def health_check():
    return jsonify({
        "status": "ok",
        "environment": os.getenv('FLASK_ENV', 'development')
    }), 200

def topup_route():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        promo_code = data.get('promo_code')
        voucher_code = data.get('voucher_code')
        transaction_type = data.get('transaction_type')
        is_auto_topup = data.get('is_auto_topup', False)
        min_balance = data.get('min_balance')
        auto_topup_amount = data.get('auto_topup_amount')
        auto_topup_frequency = data.get('auto_topup_frequency')

        if not user_id or not amount or not transaction_type:
            return jsonify({"error": "Missing required fields"}), 400

        query = """
        INSERT INTO topup_transactions (
            user_id, amount, promo_code, voucher_code, 
            transaction_type, is_auto_topup, min_balance, 
            auto_topup_amount, auto_topup_frequency
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        params = (
            user_id, amount, promo_code, voucher_code,
            transaction_type, is_auto_topup, min_balance,
            auto_topup_amount, auto_topup_frequency
        )

        result = execute_query('insert', query, params)
        if result:
            return jsonify({"message": "Top-up successful", "transaction_id": result[0]}), 200
        else:
            return jsonify({"error": "Top-up failed"}), 500
