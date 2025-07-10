import os
import psycopg2
from psycopg2 import sql, OperationalError, extras
from dotenv import load_dotenv

load_dotenv()

def get_db():
    """Get a new database connection."""
    try:
        if not os.getenv('DB_PASSWORD'):
            raise ValueError("DB_PASSWORD environment variable is not set")
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None
    except ValueError as e:
        print(f"🚨 Configuration error: {e}")
        return None

def initialize_db():
    """Create tables if they don't exist."""
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            # Example users table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                phone_number TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            # Expenses table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                amount NUMERIC NOT NULL,
                description TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            # Payment methods table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS payment_methods (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                method_name TEXT NOT NULL,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            # Auto top-up settings table (example)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS auto_top_up_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                enabled BOOLEAN DEFAULT FALSE,
                threshold NUMERIC DEFAULT 0,
                amount NUMERIC DEFAULT 0
            );
            """)
            conn.commit()
        return True
    except Exception as e:
        print(f"Error initializing DB: {e}")
        return False
    finally:
        conn.close()

def create_user(email, password_hash, full_name=None, phone_number=None):
    existing_user = get_user_by_email(email)
    if existing_user:
        print(f"User with email {email} already exists")
        return None  # Or handle as needed, e.g., return the existing user ID
    conn = get_db()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (email, password_hash, full_name, phone_number)
                VALUES (%s, %s, %s, %s) RETURNING id;
                """,
                (email, password_hash, full_name, phone_number)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            return user_id
    except Exception as e:
        print(f"Error creating user: {e}")
        return None
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=extras.DictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s;", (email,))
            user = cur.fetchone()
            return dict(user) if user else None
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None
    finally:
        conn.close()

def update_user_by_id(user_id, full_name=None, phone_number=None):
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            updates = []
            params = []
            if full_name is not None:
                updates.append("full_name = %s")
                params.append(full_name)
            if phone_number is not None:
                updates.append("phone_number = %s")
                params.append(phone_number)
            if not updates:
                return False
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
            cur.execute(query, params)
            conn.commit()
            return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()

def get_user_balance(user_id):
    # Placeholder example returning fixed value
    # Replace with your real balance query
    return 100.0

def get_user_expenses(user_id):
    conn = get_db()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=extras.DictCursor) as cur:
            cur.execute("""
                SELECT id, amount, description, date FROM expenses
                WHERE user_id = %s ORDER BY date DESC;
            """, (user_id,))
            expenses = cur.fetchall()
            return [dict(expense) for expense in expenses]
    except Exception as e:
        print(f"Error fetching expenses: {e}")
        return []
    finally:
        conn.close()

def create_expense(user_id, amount, description):
    conn = get_db()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO expenses (user_id, amount, description)
                VALUES (%s, %s, %s) RETURNING id;
            """, (user_id, amount, description))
            expense_id = cur.fetchone()[0]
            conn.commit()
            return expense_id
    except Exception as e:
        print(f"Error creating expense: {e}")
        return None
    finally:
        conn.close()

def process_top_up_transaction(user_id, amount):
    # Placeholder: process top-up logic
    # Should update user's balance or create top-up record
    print(f"Processing top-up for user {user_id} amount {amount}")
    return True

def get_user_auto_top_up_settings(user_id):
    conn = get_db()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=extras.DictCursor) as cur:
            cur.execute("""
                SELECT * FROM auto_top_up_settings WHERE user_id = %s;
            """, (user_id,))
            settings = cur.fetchone()
            return dict(settings) if settings else None
    except Exception as e:
        print(f"Error fetching auto top-up settings: {e}")
        return None
    finally:
        conn.close()

def save_user_auto_top_up_settings(user_id, enabled, threshold, amount):
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            # Upsert style: update if exists else insert
            cur.execute("""
                INSERT INTO auto_top_up_settings (user_id, enabled, threshold, amount)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET enabled = EXCLUDED.enabled,
                    threshold = EXCLUDED.threshold,
                    amount = EXCLUDED.amount;
            """, (user_id, enabled, threshold, amount))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error saving auto top-up settings: {e}")
        return False
    finally:
        conn.close()

def toggle_auto_top_up(user_id, enable):
    return save_user_auto_top_up_settings(user_id, enable, 0, 0)

def create_support_ticket(user_id, subject, description):
    # Placeholder for support ticket creation
    print(f"Support ticket created for user {user_id}: {subject}")
    return True

def add_energy_motto_column():
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS energy_motto TEXT;
            """)
            conn.commit()
            return True
    except Exception as e:
        print(f"Error adding energy_motto column: {e}")
        return False
    finally:
        conn.close()

def save_payment_method(user_id, method_name, details):
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO payment_methods (user_id, method_name, details)
                VALUES (%s, %s, %s);
            """, (user_id, method_name, psycopg2.extras.Json(details)))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error saving payment method: {e}")
        return False
    finally:
        conn.close()

def fetch_user_payment_methods(user_id):
    conn = get_db()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=extras.DictCursor) as cur:
            cur.execute("""
                SELECT id, method_name, details, created_at FROM payment_methods
                WHERE user_id = %s;
            """, (user_id,))
            methods = cur.fetchall()
            return [dict(method) for method in methods]
    except Exception as e:
        print(f"Error fetching payment methods: {e}")
        return []
    finally:
        conn.close()

def remove_payment_method(user_id, method_id):
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                DELETE FROM payment_methods WHERE id = %s AND user_id = %s;
            """, (method_id, user_id))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error removing payment method: {e}")
        return False
    finally:
        conn.close()

def create_payment_methods_table():
    conn = get_db()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS payment_methods (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    method_name TEXT NOT NULL,
                    details JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            return True
    except Exception as e:
        print(f"Error creating payment_methods table: {e}")
        return False
    finally:
        conn.close()

def add_story(user_id, story_text):
    # Placeholder for adding story (e.g., user testimonial)
    print(f"User {user_id} added story: {story_text}")
    return True
