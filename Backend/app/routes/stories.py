from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from support import execute_query
from functools import wraps
from datetime import datetime

stories_bp = Blueprint('stories', __name__)

def add_cors_headers(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        resp = make_response(f(*args, **kwargs))
        resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:4200'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp
    return decorated_function

# Create stories table if it doesn't exist
def init_stories_table():
    query = """
    CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        quote TEXT NOT NULL,
        rating INTEGER NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_approved BOOLEAN DEFAULT FALSE
    )
    """
    execute_query('create', query)

# Initialize table when module is imported
init_stories_table()

def _dummy_stories():
    now = datetime.utcnow().isoformat()
    return [
        {
            'id': -1,
            'name': 'Thandi M.',
            'quote': 'GridX has cut my monthly costs and the lights stay on!',
            'rating': 5,
            'user_avatar': 'https://ui-avatars.com/api/?name=Thandi+M&background=random',
            'created_at': now
        },
        {
            'id': -2,
            'name': 'Sipho K.',
            'quote': 'Setup was quick and the dashboard makes usage clear.',
            'rating': 4,
            'user_avatar': 'https://ui-avatars.com/api/?name=Sipho+K&background=random',
            'created_at': now
        },
        {
            'id': -3,
            'name': 'Aisha P.',
            'quote': 'Auto top-ups mean I never run out of credit anymore.',
            'rating': 5,
            'user_avatar': 'https://ui-avatars.com/api/?name=Aisha+P&background=random',
            'created_at': now
        },
    ]

@stories_bp.route('/stories', methods=['GET','OPTIONS'])
@add_cors_headers
def get_stories():
    if request.method == 'OPTIONS':
        return make_response('', 200)
    """Get all approved stories"""
    try:
        query = """
        SELECT s.id,
               s.name,
               s.quote,
               s.rating,
               COALESCE(s.avatar_url, 'https://ui-avatars.com/api/?name=' || REPLACE(s.name, ' ', '+') || '&background=random') as user_avatar,
               s.created_at
        FROM stories s
        WHERE s.is_approved = TRUE
        ORDER BY s.created_at DESC
        """
        result = execute_query('search', query)
        db_stories = []
        if result:
            columns = ['id', 'name', 'quote', 'rating', 'user_avatar', 'created_at']
            db_stories = [dict(zip(columns, row)) for row in result]
        # Always append dummy stories so there is content even on a fresh DB
        return jsonify(db_stories + _dummy_stories())
    except Exception as e:
        # If the table is missing or any other error occurs, still return dummy stories
        return jsonify(_dummy_stories()), 200

@stories_bp.route('/stories', methods=['POST','OPTIONS'])
@add_cors_headers
@jwt_required(optional=True)
def create_story():
    if request.method == 'OPTIONS':
        return make_response('', 200)
    """Create a new story"""
    try:
        data = request.json
        user_id = get_jwt_identity()  # Will be None if not logged in
        
        # Validate required fields
        if not all(k in data for k in ['name', 'email', 'quote', 'rating']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Basic validation
        if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            
        if len(data['quote']) < 10 or len(data['quote']) > 1000:
            return jsonify({'error': 'Story must be between 10 and 1000 characters'}), 400
        
        # Insert story
        is_approved = True  # Auto-approve for now

        def _insert_story():
            query = """
            INSERT INTO stories (user_id, name, email, quote, rating, is_approved)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """
            return execute_query('insert', query, (
                user_id,
                data['name'][:100],
                data['email'][:100],
                data['quote'][:1000],
                data['rating'],
                is_approved
            ))

        # Try insert; if table is missing, initialize and retry once
        try:
            result = _insert_story()
        except Exception as err:
            if 'relation "stories" does not exist' in str(err).lower():
                init_stories_table()
                result = _insert_story()
            else:
                raise
        
        if result:
            story = None
            if is_approved:
                story_query = """
                SELECT s.id,
                       s.name,
                       s.quote,
                       s.rating,
                       COALESCE(s.avatar_url, 'https://ui-avatars.com/api/?name=' || REPLACE(s.name, ' ', '+') || '&background=random') as user_avatar,
                       s.created_at
                FROM stories s
                WHERE s.id = %s
                """
                story_result = execute_query('search', story_query, (result,))
                if story_result:
                    columns = ['id', 'name', 'quote', 'rating', 'user_avatar', 'created_at']
                    story = dict(zip(columns, story_result[0]))

            return jsonify({
                'message': 'Story submitted successfully!',
                'needs_approval': not is_approved,
                'story': story
            }), 201
            
        return jsonify({'error': 'Failed to submit story'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin endpoint to approve/reject stories (protected)
@stories_bp.route('/api/admin/stories/<int:story_id>', methods=['PUT'])
@jwt_required()
def moderate_story(story_id):
    """Approve or reject a story (admin only)"""
    try:
        # In a real app, verify user is admin here
        data = request.json
        if 'is_approved' not in data:
            return jsonify({'error': 'Missing is_approved field'}), 400
            
        query = "UPDATE stories SET is_approved = %s WHERE id = %s RETURNING id"
        result = execute_query('update', query, (data['is_approved'], story_id))
        
        if result:
            return jsonify({'message': 'Story updated successfully'})
        return jsonify({'error': 'Story not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
