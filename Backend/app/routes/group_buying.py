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

# ... existing code ...

@group_buying_bp.route('/api/campaigns/create', methods=['POST'])
@jwt_required()
def create_campaign():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ['product', 'description', 'originalPrice', 'groupPrice', 'targetBuyers', 'deadline', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_db()
        if not conn:
            return jsonify({'error': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO campaigns (user_id, product, description, original_price, group_price, target_buyers, deadline, category, image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, product, description, original_price, group_price, target_buyers, deadline, category, image
            """,
            (
                user_id,
                data['product'],
                data['description'],
                data['originalPrice'],
                data['groupPrice'],
                data['targetBuyers'],
                data['deadline'],
                data['category'],
                data.get('image')  # Optional field
            )
        )
        conn.commit()
        new_campaign = cur.fetchone()
        return jsonify(new_campaign), 201
    except Exception as e:
        print(f"Error creating campaign: {str(e)}")
        return jsonify({'error': 'Failed to create campaign'}), 500

# ... existing code ...

@group_buying_bp.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    try:
        conn = get_db()
        if not conn:
            return jsonify({'error': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute("""
            SELECT id, user_id, product, description, original_price, group_price, target_buyers, deadline, category, image
            FROM campaigns
        """)
        campaigns = cur.fetchall()
        return jsonify(campaigns), 200
    except Exception as e:
        print(f"Error fetching campaigns: {str(e)}")
        return jsonify({'error': 'Failed to fetch campaigns'}), 500