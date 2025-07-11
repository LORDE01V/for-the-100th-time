from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import timedelta, datetime
import secrets
import os
from app.routes.home import home_bp
from app.routes.auth import auth_bp
from email_utils import send_welcome_email  # Assuming it's in email_utils.py
from dotenv import load_dotenv
from support import (
   # get_user_balance,
    #get_user_expenses,
    create_expense,
   # process_top_up_transaction,
   # get_user_auto_top_up_settings,
  #  save_user_auto_top_up_settings,
  #  toggle_auto_top_up,
    create_support_ticket,
    add_energy_motto_column,
    save_payment_method,
    fetch_user_payment_methods,
    remove_payment_method,
    #create_payment_methods_table,
    add_story,

   
)
from werkzeug.utils import secure_filename

# Load environment variables (same as support.py)
load_dotenv()

def create_app():
    """Factory function to create and configure the Flask application."""
    app = Flask(__name__)
    return app

# Configuration (use environment variables for secrets in production)
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))

# ================= FLASK APP =================
# Rename existing app to flask_app
flask_app = create_app()  # Use factory app

flask_app.config.update(
    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'dev'),
    SESSION_COOKIE_NAME='session',
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_TYPE='filesystem'
)
flask_app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
flask_app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
flask_app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
flask_app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False


# Initialize extensions
CORS(flask_app, 
     resources={r"/api/*": {"origins": "http://localhost:3000"}},
     expose_headers=["Authorization"],
     supports_credentials=True)
jwt = JWTManager(flask_app)

# Register blueprints
flask_app.register_blueprint(home_bp)
flask_app.register_blueprint(auth_bp, name='auth_bp')

# Add after request handler
@flask_app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Database connection helper (PostgreSQL)
def get_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'your_password_here'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None

# Auth routes (updated for PostgreSQL)
@flask_app.route('/api/auth/register', methods=['POST'])
def flask_register():
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['name', 'email', 'password']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Get optional phone or set None
        phone = data.get('phone', None)

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        with conn.cursor() as cur:
            # Check existing user
            cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            if cur.fetchone():
                return jsonify({'success': False, 'message': 'Email already exists'}), 400

            # Create user with proper hash length
            hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=8)  # Explicit method
            cur.execute(
                """INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (%s, %s, %s, %s) RETURNING id, email, full_name""",
                (data['email'].lower(), hashed_pw, data['name'], phone)  # Force lowercase
            )
            user_data = cur.fetchone()
            conn.commit()

        send_welcome_email(data['email'], data['name'])

        return jsonify({
            'success': True,
            'user': {
                'id': result[0],
                'email': email,
                'name': name
            }
        }), 201

    except Exception as e:
        print(f"Registration Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/auth/login', methods=['POST'])
def flask_login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()  # Force lowercase
        password = data.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Missing credentials'}), 400

        conn = get_db()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT id, password_hash, full_name 
                FROM users 
                WHERE email = %s
            ''', (email,))
            user = cur.fetchone()

            if user and check_password_hash(user[1], password):
                access_token = create_access_token(identity=user[0])
                return jsonify({
                    'success': True,
                    'token': access_token,
                    'user': {
                        'id': user[0],
                        'name': user[2],
                        'email': email
                    }
                }), 200

        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/solar/systems', methods=['POST'])
@jwt_required()
def flask_create_solar_system():
    """Handle solar system installations"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's add_solar_system()
    # ... implementation ...

@flask_app.route('/api/contracts', methods=['POST'])
@jwt_required()
def flask_create_solar_contract():
    """Handle contract creation"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's create_contract()
    # ... implementation ...

@flask_app.route('/api/payments', methods=['POST'])
@jwt_required()
def flask_record_payment():
    """Handle payment processing"""
    current_user = get_jwt_identity()
    data = request.get_json()
    # Add validation and call support.py's record_payment()
    # ... implementation ...

@flask_app.route('/api/contracts', methods=['GET'])
@jwt_required()
def flask_get_contracts():
    """Get user's solar contracts"""
    current_user = get_jwt_identity()
    # Add authorization and call support.py's get_user_contracts()
    # ... implementation ...

@flask_app.errorhandler(404)
def not_found(e):
    return jsonify(error="Route not found"), 404

# ================= FASTAPI APP =================
app = FastAPI(title="Lumina Solar FastAPI")

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT (compatible with Flask's tokens)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/fastapi/auth/login")

# --- FastAPI Models ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

# --- FastAPI Routes ---
@app.post("/fastapi/auth/register")
async def fastapi_register(user: UserRegister):
    """FastAPI version of /api/auth/register"""
    conn = None
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Start transaction
        cur.execute("BEGIN")
        
        try:
            # Delete all user-related data in the correct order (due to foreign key constraints)
            # Delete from user_profiles
            cur.execute('DELETE FROM user_profiles WHERE user_id = %s', (user_id,))
            
            # Delete from user_settings
            cur.execute('DELETE FROM user_settings WHERE user_id = %s', (user_id,))
            
            # Delete from expenses
            cur.execute('DELETE FROM expenses WHERE user_id = %s', (user_id,))
            
            # Delete from top_ups
            cur.execute('DELETE FROM top_ups WHERE user_id = %s', (user_id,))
            
            # Delete from user_balances
            cur.execute('DELETE FROM user_balances WHERE user_id = %s', (user_id,))
            
            # Delete from auto_top_up_settings
            cur.execute('DELETE FROM auto_top_up_settings WHERE user_id = %s', (user_id,))
            
            # Delete from social_links
            cur.execute('DELETE FROM social_links WHERE user_id = %s', (user_id,))
            
            # Delete from solar_systems
            cur.execute('DELETE FROM solar_systems WHERE user_id = %s', (user_id,))
            
            # Delete from energy_usage
            cur.execute('DELETE FROM energy_usage WHERE user_id = %s', (user_id,))
            
            # Delete from environmental_impact
            cur.execute('DELETE FROM environmental_impact WHERE user_id = %s', (user_id,))
            
            # Delete from payment_methods
            cur.execute('DELETE FROM payment_methods WHERE user_id = %s', (user_id,))
            
            # Delete from transactions
            cur.execute('DELETE FROM transactions WHERE user_id = %s', (user_id,))
            
            # Delete from forum_topics
            cur.execute('DELETE FROM forum_topics WHERE user_id = %s', (user_id,))
            
            # Delete from forum_replies
            cur.execute('DELETE FROM forum_replies WHERE user_id = %s', (user_id,))
            
            # Delete from support_tickets
            cur.execute('DELETE FROM support_tickets WHERE user_id = %s', (user_id,))
            
            # Finally, delete the user
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            
            # Commit the transaction
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Account deleted successfully'
            })
            
        except Exception as e:
            # Rollback in case of error
            if conn:  # Ensure conn is not None before rollback
                conn.rollback()
            print(f"Error during account deletion: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Delete account error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete account'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Forum routes
@flask_app.route('/api/forum/topics', methods=['GET'])
@jwt_required()
def get_forum_topics():
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get all topics with author info and reply count
        cur.execute('''
            SELECT 
                t.id,
                t.title,
                t.content,
                t.created_at,
                u.full_name as author_name,
                u.id as author_id,
                COUNT(r.id) as reply_count,
                COALESCE(MAX(r.created_at), t.created_at) as last_activity
            FROM forum_topics t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN forum_replies r ON t.id = r.topic_id
            GROUP BY t.id, u.full_name, u.id
            ORDER BY last_activity DESC
        ''')
        
        topics = []
        for row in cur.fetchall():
            topics.append({
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'created_at': row[3].isoformat(),
                'author': {
                    'id': row[5],
                    'name': row[4]
                },
                'posts': row[6] + 1,  # Include the original post in count
                'last_activity': row[7].isoformat()
            })
        
        return jsonify({
            'success': True,
            'topics': topics
        })

    except Exception as e:
        print(f"Error fetching forum topics: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch forum topics'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()


@flask_app.route('/api/stories', methods=['POST'])
@jwt_required()
def submit_story():
    """API endpoint to submit a story"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['username', 'email', 'story']):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        username = data['username']
        email = data['email']
        story = data['story']
        
        # Add story to the database
        story_id = add_story(username, email, story)
        if not story_id:
            return jsonify({'success': False, 'message': 'Failed to submit story'}), 500
        
        return jsonify({'success': True, 'story_id': story_id}), 201
    
    except Exception as e:
        print(f"Error submitting story: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to submit story'}), 500

@flask_app.route('/api/forum/topics', methods=['POST'])
@jwt_required()
def create_forum_topic():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        title = data.get('title')
        content = data.get('content')

        if not all([title, content]):
            return jsonify({'success': False, 'message': 'Title and content are required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Create new topic
        cur.execute('''
            INSERT INTO forum_topics (user_id, title, content)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        ''', (user_id, title, content))
        
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to create topic'}), 500
        topic_id, created_at = result
        
        # Get author info
        cur.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve author name'}), 500
        author_name = result[0]
        
        return jsonify({
            'success': True,
            'topic': {
                'id': topic_id,
                'title': title,
                'content': content,
                'created_at': created_at.isoformat(),
                'author': {
                    'id': user_id,
                    'name': author_name
                },
                'posts': 1,
                'last_activity': created_at.isoformat()
            }
        }), 201

    except Exception as e:
        print(f"Error creating forum topic: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create forum topic'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/forum/topics/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_forum_topic(topic_id):
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get topic with author info
        cur.execute('''
            SELECT 
                t.id,
                t.title,
                t.content,
                t.created_at,
                u.id as author_id,
                u.full_name as author_name
            FROM forum_topics t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = %s
        ''', (topic_id,))
        
        topic = cur.fetchone()
        if not topic:
            return jsonify({'success': False, 'message': 'Topic not found'}), 404
        
        # Get all replies for the topic
        cur.execute('''
            SELECT 
                r.id,
                r.content,
                r.created_at,
                u.id as author_id,
                u.full_name as author_name
            FROM forum_replies r
            JOIN users u ON r.user_id = u.id
            WHERE r.topic_id = %s
            ORDER BY r.created_at ASC
        ''', (topic_id,))
        
        replies = []
        for row in cur.fetchall():
            replies.append({
                'id': row[0],
                'content': row[1],
                'created_at': row[2].isoformat(),
                'author': {
                    'id': row[3],
                    'name': row[4]
                }
            })
        
        return jsonify({
            'success': True,
            'topic': {
                'id': topic[0],
                'title': topic[1],
                'content': topic[2],
                'created_at': topic[3].isoformat(),
                'author': {
                    'id': topic[4],
                    'name': topic[5]
                },
                'replies': replies
            }
        })

    except Exception as e:
        print(f"Error fetching forum topic: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch forum topic'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/forum/topics/<int:topic_id>/replies', methods=['POST'])
@jwt_required()
def create_forum_reply(topic_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        content = data.get('content')
        if not content:
            return jsonify({'success': False, 'message': 'Content is required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Verify topic exists
        cur.execute('SELECT id FROM forum_topics WHERE id = %s', (topic_id,))
        if not cur.fetchone():
            return jsonify({'success': False, 'message': 'Topic not found'}), 404
        
        # Create reply
        cur.execute('''
            INSERT INTO forum_replies (topic_id, user_id, content)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        ''', (topic_id, user_id, content))
        
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to create reply'}), 500
        reply_id, created_at = result
        
        # Get author info
        cur.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            return jsonify({'success': False, 'message': 'Failed to retrieve author name'}), 500
        author_name = result[0]
        
        return jsonify({
            'success': True,
            'reply': {
                'id': reply_id,
                'content': content,
                'created_at': created_at.isoformat(),
                'author': {
                    'id': user_id,
                    'name': author_name
                }
            }
        }), 201

    except Exception as e:
        print(f"Error creating forum reply: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create forum reply'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()


# GET /api/events - Fetch all events
@flask_app.route('/api/events', methods=['GET'])
@jwt_required()
def get_events():
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute("SELECT date, title, start, end, description, location, event_type FROM events")
        events = cur.fetchall()

        # Convert events to a dictionary
        events_dict = {
            event[0]: {
                "title": event[1],
                "start": event[2],
                "end": event[3],
                "description": event[4],
                "location": event[5],
                "eventType": event[6]
            }
            for event in events
        }

        return jsonify(events_dict), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch events'}), 500

# POST /api/events - Save a new event
@flask_app.route('/api/events', methods=['POST'])
@jwt_required()
def save_event():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Extract event details
        date = data.get('date')
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        description = data.get('description')
        location = data.get('location')
        event_type = data.get('eventType')

        # Validate required fields
        if not all([date, title, start, end, description, location, event_type]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO events (date, title, start, end, description, location, event_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (date) DO UPDATE
            SET title = EXCLUDED.title,
                start = EXCLUDED.start,
                end = EXCLUDED.end,
                description = EXCLUDED.description,
                location = EXCLUDED.location,
                event_type = EXCLUDED.event_type
            """,
            (date, title, start, end, description, location, event_type)
        )
        conn.commit()

        return jsonify({'success': True, 'message': 'Event saved successfully'}), 201
    except Exception as e:
        print(f"Error saving event: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to save event'}), 500

# DELETE /api/events/<date> - Delete an event for a specific date
@flask_app.route('/api/events/<date>', methods=['DELETE'])
@jwt_required()
def delete_event(date):
    try:
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500

        cur = conn.cursor()
        cur.execute("DELETE FROM events WHERE date = %s", (date,))
        if cur.rowcount == 0:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        conn.commit()
        return jsonify({'success': True, 'message': 'Event deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete event'}), 500



@flask_app.route('/api/support/ticket', methods=['POST', 'OPTIONS'])
@jwt_required()
def handle_support_ticket():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print("=== Support Ticket Creation Debug ===")
        print(f"User ID: {user_id}")
        print(f"Request Data: {data}")
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        subject = data.get('subject')
        message = data.get('message')

        if not all([subject, message]):
            return jsonify({'success': False, 'message': 'Subject and message are required'}), 400

        try:
            priority = data.get('priority', 'low')
            ticket_id = create_support_ticket(user_id, subject, message, priority)
            return jsonify({
                'success': True,
                'message': 'Support ticket created successfully',
                'ticket_id': ticket_id
            }), 201

        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

    except Exception as e:
        print(f"Create support ticket error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create support ticket'}), 500

@flask_app.route('/api/payment-methods', methods=['POST'])
@jwt_required()
def add_payment_method():
    try:
        # Debug logging
        print("=== Payment Method Creation Request Debug ===")
        print("Request Headers:", dict(request.headers))
        print("Request Data:", request.get_json())
        
        user_id = get_jwt_identity()
        print("User ID:", user_id)
        
        data = request.get_json()
        if not data:
            print("No data received in request")
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['type', 'cardNumber', 'expiryDate', 'cardHolderName']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400

        # Convert frontend field names to backend field names
        payment_data = {
            'payment_type': data['type'],
            'card_number': data['cardNumber'],
            'expiry_date': data['expiryDate'],
            'card_holder_name': data['cardHolderName'],
            'is_default': data.get('isDefault', False)
        }

        print("Processed payment data:", payment_data)

        # Save payment method
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        try:
            result = save_payment_method(
                user_id=user_id,
                payment_type=payment_data['payment_type'],
                card_number=payment_data['card_number'],
                expiry_date=payment_data['expiry_date'],
                card_holder_name=payment_data['card_holder_name'],
                is_default=payment_data['is_default']
            )

            print("Save payment method result:", result)

            if result:
                # Create notification for successful payment method addition
                try:
                    # Create notification
                    cur.execute('''
                        INSERT INTO notifications (user_id, title, message, type)
                        VALUES (%s, %s, %s, %s)
                    ''', (
                        user_id,
                        'Payment Method Added',
                        f'Successfully added a new {payment_data["payment_type"]} payment method.',
                        'success'
                    ))
                    conn.commit()
                except Exception as e:
                    print(f"Error creating notification: {str(e)}")
                    conn.rollback()

            return jsonify({
                'success': True,
                'message': 'Payment method saved successfully',
                'payment_method_id': result
            })
        except Exception as e:
            print("Error saving payment method:", str(e))
            import traceback
            print("Traceback:", traceback.format_exc())
            return jsonify({'success': False, 'message': str(e)}), 500
    except Exception as e:
        print("Error saving payment method:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@flask_app.route('/api/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    try:
        user_id = get_jwt_identity()
        payment_methods = fetch_user_payment_methods(user_id)
        
        # Format the payment methods for the frontend
        formatted_methods = []
        
        # Check if payment_methods is not None and is iterable
        if payment_methods:
            for method in payment_methods:
                try:
                    formatted_method = {
                        'id': method['id'],  # Assuming id is the first column
                        'payment_type': method['payment_type'],
                        'card_number': method['card_number'],
                        'expiry_date': method['expiry_date'].strftime('%m/%y') if method['expiry_date'] else None,
                        'card_holder_name': method['card_holder_name'],
                        'is_default': method['is_default'],
                        'created_at': method['created_at'].isoformat() if method['created_at'] else None  # Add created_at
                    }
                    formatted_methods.append(formatted_method)
                except (IndexError, AttributeError) as e:
                    print(f"Error formatting payment method: {str(e)}")
                    continue
        
        print("Debug - Formatted payment methods:", formatted_methods)  # Debug log
        
        return jsonify({
            'success': True,
            'payment_methods': formatted_methods
        })
    except Exception as e:
        print("Error fetching payment methods:", str(e))
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@flask_app.route('/api/payment-methods/<int:payment_method_id>', methods=['DELETE'])
@jwt_required()
def delete_payment_method(payment_method_id):
    try:
        user_id = get_jwt_identity()
        
        # Get payment method details before deleting
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        try:
            cur.execute('''
                SELECT payment_type, card_number, card_holder_name 
                FROM payment_methods 
                WHERE id = %s AND user_id = %s
            ''', (payment_method_id, user_id))
            payment_method = cur.fetchone()
            
            if not payment_method:
                return jsonify({
                    'success': False,
                    'message': 'Payment method not found or could not be deleted'
                }), 404
            
            # Use the renamed function to delete the payment method
            result = remove_payment_method(payment_method_id)
            
            if result:
                # Create notification for successful payment method deletion
                cur.execute('''
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES (%s, %s, %s, %s)
                ''', (
                    user_id,
                    'Payment Method Removed',
                    f'Successfully removed your {payment_method[0]} payment method ending in {payment_method[1][-4:] if payment_method[1] else "N/A"}.',
                    'info'
                ))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Payment method deleted successfully'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Payment method not found or could not be deleted'
                }), 404

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if cur: cur.close()
            if conn: conn.close()

    except Exception as e:
        print(f"Error deleting payment method: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@flask_app.route('/api/payment-methods/<int:payment_method_id>/default', methods=['PUT'])
@jwt_required()
def set_default_payment_method(payment_method_id):
    try:
        user_id = get_jwt_identity()
        
        # First, unset all default payment methods for this user
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500
        cur = conn.cursor()
        
        # Update all payment methods to not be default
        cur.execute('''
            UPDATE payment_methods 
            SET is_default = FALSE 
            WHERE user_id = %s
        ''', (user_id,))
        
        # Set the selected payment method as default
        cur.execute('''
            UPDATE payment_methods 
            SET is_default = TRUE 
            WHERE id = %s AND user_id = %s
            RETURNING id
        ''', (payment_method_id, user_id))
        
        result = cur.fetchone()
        conn.commit()
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Default payment method updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Payment method not found'
            }), 404

    except Exception as e:
        print(f"Error setting default payment method: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

# Add debug logging
@flask_app.before_request
def log_request_info():
    print('Headers:', dict(request.headers))
    print('Body:', request.get_data())
    print('Method:', request.method)
    print('URL:', request.url)

@flask_app.after_request
def after_request(response):
    print('Response:', response.get_data())
    return response

@flask_app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Get all notifications for the user
        cur.execute('''
            SELECT id, title, message, type, is_read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
        ''', (user_id,))
        
        notifications = cur.fetchall()
        
        return jsonify({
            'success': True,
            'notifications': [{
                'id': n[0],
                'title': n[1],
                'message': n[2],
                'type': n[3],
                'is_read': n[4],
                'created_at': n[5].isoformat()
            } for n in notifications]
        })

    except Exception as e:
        print(f"Get notifications error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to get notifications'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()
        
        # Mark notification as read
        cur.execute('''
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = %s AND user_id = %s
            RETURNING id
        ''', (notification_id, user_id))
        
        if cur.rowcount == 0:
            return jsonify({'success': False, 'message': 'Notification not found'}), 404
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })

    except Exception as e:
        print(f"Mark notification read error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to mark notification as read'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                conn.close()

@flask_app.route('/api/profile/picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        if 'profile_picture' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
            
        file = request.files['profile_picture']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
            
        if file and allowed_file(file.filename):
            user_id = get_jwt_identity()
            filename = secure_filename(f"{user_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Store the file path in the database
            conn = get_db()
            if not conn:
                return jsonify({'success': False, 'message': 'Database error'}), 500
            cur = conn.cursor()
            try:
                cur.execute('''
                    UPDATE user_profiles 
                    SET profile_picture_url = %s 
                    WHERE user_id = %s
                ''', (f"/uploads/profile_pictures/{filename}", user_id))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'profile_picture_url': f"/uploads/profile_pictures/{filename}"
                })
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                cur.close()
                if 'conn' in locals() and conn:  # Ensure conn is valid before closing
                    conn.close()
                
        return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
    except Exception as e:
        print(f"Upload profile picture error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to upload profile picture: {str(e)}'}), 500

@flask_app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Example chat logic
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        user_message = data.get('message', '')
        response = process_chat_message(user_message)  # Replace with actual chat processing logic
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

def process_chat_message(user_message):
    """Process the chat message and return a response."""
    # Replace this with actual chat processing logic
    return f"Echo: {user_message}"

if __name__ == '__main__':
    flask_app.run(port=5000)