from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from support import execute_query, get_db
import os
from datetime import datetime
from flask import make_response
from functools import wraps

stories_bp = Blueprint('stories', __name__)

from flask import make_response
from functools import wraps

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

@stories_bp.route('/stories', methods=['GET','OPTIONS'])
@add_cors_headers
def get_stories():
    if request.method == 'OPTIONS':
        return make_response('', 200)
    """Get all approved stories"""
    try:
        query = """
        SELECT s.id, s.name, s.quote, s.rating, s.avatar_url, s.created_at,
               COALESCE(u.avatar_url, 'https://ui-avatars.com/api/?name=' || REPLACE(s.name, ' ', '+') || '&background=random') as user_avatar
        FROM stories s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.is_approved = TRUE
        ORDER BY s.created_at DESC
        """
        result = execute_query('search', query)
        if result:
            columns = ['id', 'name', 'quote', 'rating', 'avatar_url', 'created_at', 'user_avatar']
            stories = [dict(zip(columns, row)) for row in result]
            return jsonify(stories)
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        query = """
        INSERT INTO stories (user_id, name, email, quote, rating, is_approved)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
        """
        # Auto-approve if user is logged in, otherwise needs moderation
        is_approved = bool(user_id)
        
        result = execute_query('insert', query, (
            user_id,
            data['name'][:100],
            data['email'][:100],
            data['quote'][:1000],
            data['rating'],
            is_approved
        ))
        
        if result:
            return jsonify({
                'message': 'Story submitted successfully' + (' and approved!' if is_approved else ' (pending approval)'),
                'needs_approval': not is_approved
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
