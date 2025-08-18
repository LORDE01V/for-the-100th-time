from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db

groupbuying_bp = Blueprint('groupbuying', __name__)

@groupbuying_bp.route('/api/groupbuying/campaigns', methods=['POST'])
def create_campaign():
    try:
        data = request.json
        product = data.get('product')
        image = data.get('image')
        original_price = data.get('originalPrice')
        group_price = data.get('groupPrice')
        goal = data.get('goal')
        deadline = data.get('deadline')
        description = data.get('description')
        category = data.get('category')
        milestones = data.get('milestones')

        if not all([product, original_price, group_price, goal, description, category]):
            return jsonify({'error': 'Missing required campaign fields.'}), 400

        conn, cur = connect_db()
        cur.execute(
            '''
            INSERT INTO group_buying_campaigns (
                product, image, original_price, group_price, goal,
                participants, deadline, description, category, milestones
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            ''',
            (product, image, original_price, group_price, goal,
             0, deadline, description, category, milestones)
        )
        campaign_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Campaign created successfully', 'id': campaign_id}), 201

    except Exception as e:
        print("Create campaign error:", e)
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({'error': 'Failed to create campaign', 'details': str(e)}), 500

@groupbuying_bp.route('/api/groupbuying/campaigns', methods=['GET'])
def get_campaigns():
    try:
        conn, cur = connect_db()
        cur.execute('SELECT * FROM group_buying_campaigns')
        campaigns = cur.fetchall()
        cur.close()
        conn.close()

        campaigns_list = []
        for campaign in campaigns:
            campaigns_list.append({
                'id': campaign[0],
                'product': campaign[1],
                'image': campaign[2],
                'originalPrice': campaign[3],
                'groupPrice': campaign[4],
                'goal': campaign[5],
                'participants': campaign[6],
                'deadline': campaign[7],
                'description': campaign[8],
                'category': campaign[9],
                'milestones': campaign[10], # Assuming milestones are stored as JSONB
                'createdAt': campaign[11].isoformat() if campaign[11] else None
            })
        return jsonify(campaigns_list), 200

    except Exception as e:
        print("Get campaigns error:", e)
        return jsonify({'error': 'Failed to fetch campaigns', 'details': str(e)}), 500

@groupbuying_bp.route('/api/groupbuying/campaigns/<int:campaign_id>/join', methods=['POST'])
def join_campaign(campaign_id):
    try:
        conn, cur = connect_db()
        cur.execute(
            'UPDATE group_buying_campaigns SET participants = participants + 1 WHERE id = %s RETURNING participants',
            (campaign_id,)
        )
        updated_participants = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if updated_participants:
            return jsonify({'message': 'Successfully joined campaign', 'participants': updated_participants[0]}), 200
        else:
            return jsonify({'error': 'Campaign not found'}), 404

    except Exception as e:
        print("Join campaign error:", e)
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({'error': 'Failed to join campaign', 'details': str(e)}), 500
