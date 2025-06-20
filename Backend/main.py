from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import timedelta, datetime
import secrets
import os
from dotenv import load_dotenv

# Load environment variables (same as support.py)
load_dotenv()

app = Flask(__name__)

# Configuration (use environment variables for secrets in production)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})
jwt = JWTManager(app)

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
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        if len(password) < 8:
            return jsonify({'success': False, 'message': 'Password must be at least 8 characters'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()

        # Check if email exists (now in PostgreSQL users table)
        cur.execute('SELECT * FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 400

        # Hash password and insert (using users table from support.py)
        hashed_password = generate_password_hash(password)
        cur.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id',
            (email, hashed_password, name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        # Generate token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'success': True,
            'token': access_token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({'success': False, 'message': 'Email and password required'}), 400

        conn = get_db()
        if not conn:
            return jsonify({'success': False, 'message': 'Database error'}), 500

        cur = conn.cursor()

        # Check credentials (PostgreSQL users table)
        cur.execute('SELECT id, email, password_hash, full_name FROM users WHERE email = %s', (email,))
        user = cur.fetchone()

        if user and check_password_hash(user[2], password):  # user[2] = password_hash
            access_token = create_access_token(identity=user[0])  # user[0] = id
            return jsonify({
                'success': True,
                'token': access_token,
                'user': {
                    'id': user[0],
                    'name': user[3],  # full_name
                    'email': user[1]
                }
            })

        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'}), 500
    finally:
        if 'conn' in locals():
            if 'cur' in locals(): cur.close()
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)