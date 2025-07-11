from flask import Blueprint, request, jsonify
from support import connect_db  # Adjust import if needed

testimonials_bp = Blueprint('testimonials', __name__)


@testimonials_bp.route('/api/testimonials', methods=['POST'])
def create_testimonial():
    data = request.json
    conn = connect_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO stories (name, email, story)
                VALUES (%s, %s, %s)
                RETURNING id, created_at;
            """, (
                data['name'],
                data['email'],
                data['story']
            ))
            result = cur.fetchone()
            conn.commit()
            return jsonify({'message': 'Testimonial saved!', 'id': result[0], 'created_at': result[1]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@testimonials_bp.route('/api/testimonials', methods=['GET'])
def get_testimonials():
    conn = connect_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, email, story, created_at FROM stories ORDER BY created_at DESC;')
            rows = cur.fetchall()
            testimonials = [{
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'story': row[3],
                'created_at': row[4].isoformat() if row[4] else None
            } for row in rows]
            return jsonify(testimonials), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()