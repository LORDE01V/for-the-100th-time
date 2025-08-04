from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_service import generate_ai_suggestions

ai_suggestions_bp = Blueprint('ai_suggestions', __name__)

@ai_suggestions_bp.route('/api/ai-suggestions', methods=['GET'])
@jwt_required()
def get_ai_suggestions():
    user_id = get_jwt_identity()
    # Fetch user data (e.g., energy usage, subscription plan) from the database
    user_data = {
        "energy_usage": [45, 42, 40, 38, 35],  # Example data
        "budget": 500,
        "devices": 5
    }
    suggestions = generate_ai_suggestions(user_data)
    return jsonify({"success": True, "suggestions": suggestions})