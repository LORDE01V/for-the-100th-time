import psycopg2
from flask import Blueprint, request, jsonify
from psycopg2 import sql, OperationalError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a Blueprint for event routes
events_bp = Blueprint('events', __name__)

# Database connection helper
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None

# Create the events table if it doesn't exist
def create_events_table():
    conn = get_db_connection()
    if not conn:
        raise Exception("Database connection failed")
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    start TIMESTAMP NOT NULL,
                    "end" TIMESTAMP,
                    description TEXT,
                    location VARCHAR(255),
                    event_type VARCHAR(50) NOT NULL
                );
            """)
            conn.commit()
            print("✅ Events table created successfully!")
    except Exception as e:
        print(f"🚨 Error creating events table: {e}")
    finally:
        conn.close()

# Endpoint to fetch all events
@events_bp.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, title, start, "end", description, location, event_type FROM events;')
            rows = cur.fetchall()
            events = [{
                'id': row[0],
                'title': row[1],
                'start': row[2].isoformat() if row[2] else None,
                'end': row[3].isoformat() if row[3] else None,
                'description': row[4],
                'location': row[5],
                'event_type': row[6]
            } for row in rows]
            return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint to save a new event
@events_bp.route('/api/events', methods=['POST'])
def create_event():
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO events (title, start, "end", description, location, event_type)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (
                data['title'],
                data['start'],
                data.get('end'),
                data.get('description'),
                data.get('location'),
                data.get('event_type', 'meeting')
            ))
            result = cur.fetchone()
            if result is None:
                return jsonify({'error': 'Failed to retrieve event ID'}), 500
            event_id = result[0]
            conn.commit()
            return jsonify({'message': 'Event created successfully', 'event_id': event_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint to delete an event
@events_bp.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM events WHERE id = %s;", (event_id,))
            conn.commit()
            return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Initialize the events table when the module loads
create_events_table()