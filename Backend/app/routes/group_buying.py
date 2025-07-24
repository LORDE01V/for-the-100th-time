from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Backend.support import add_user_to_campaign

group_buying_bp = Blueprint('group_buying', __name__)

@group_buying_bp.route('/campaigns/join', methods=['POST'])
@jwt_required(optional=True)
def join_campaign():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight successful'}), 200
    user_id = get_jwt_identity()
    data = request.get_json()
    campaign_id = data.get('campaign_id')

    if not campaign_id:
        return jsonify({'error': 'Campaign ID is required'}), 400

    try:
        add_user_to_campaign(user_id, campaign_id)
        return jsonify({'message': 'Successfully joined the campaign'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500