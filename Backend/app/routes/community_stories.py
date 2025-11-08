from flask import Blueprint, request, jsonify
from Backend.support import save_community_story, get_all_community_stories

community_stories_bp = Blueprint('community_stories', __name__)

@community_stories_bp.route('/api/community-stories', methods=['POST'])
def submit_community_story():
    data = request.get_json()
    user_name = data.get('user_name')
    story_text = data.get('story_text')
    rating = data.get('rating')
    if not all([user_name, story_text, rating]):
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        new_id = save_community_story(user_name, story_text, rating)
        return jsonify({'success': True, 'id': new_id, 'message': 'Story submitted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@community_stories_bp.route('/api/community-stories', methods=['GET'])
def fetch_community_stories():
    try:
        stories = get_all_community_stories()
        if not stories:
            return jsonify([])
        # Normalize rows into dicts (supports tuple or dict return)
        normalized = []
        for row in stories:
            if isinstance(row, dict):
                normalized.append({
                    "id": row.get("id"),
                    "user_name": row.get("user_name"),
                    "story_text": row.get("story_text"),
                    "rating": row.get("rating"),
                    "created_at": row.get("created_at"),
                })
            else:
                normalized.append({
                    "id": row[0],
                    "user_name": row[1],
                    "story_text": row[2],
                    "rating": row[3],
                    "created_at": row[4] if len(row) > 4 else None
                })
        return jsonify(normalized)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        