from flask import Blueprint, request, jsonify
from support import connect_db
import logging

topup_bp = Blueprint('topup', __name__)

@topup_bp.route('/api/topup', methods=['POST'])
def handle_topup():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'user_id' not in data or 'amount' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        # Add actual payment processing logic here
        # Mock success response
        return jsonify({
            "success": True,
            "message": f"Top-up of R{data['amount']} processed",
            "new_balance": 0  # Replace with actual balance calculation
        }), 200
        
    except Exception as e:
        logging.error(f"Topup error: {str(e)}")
        return jsonify({
            "error": "Payment processing failed",
            "message": str(e)
        }), 500 