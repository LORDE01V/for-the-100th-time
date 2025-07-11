import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import pandas as pd
import plotly.express as px
import json
import datetime
import logging
import sys

# Load environment variables
load_dotenv()

# ================== DATABASE CONNECTION ==================
def connect_db():
    """Connect to PostgreSQL database"""
    password = os.getenv('DB_PASSWORD', '')
    if not password:
        raise ValueError("DB_PASSWORD environment variable must be set.")
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=password,
            port=os.getenv('DB_PORT', '5432')
        )
        return conn, conn.cursor()
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None, None

def get_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),  # Ensure this is set in your .env
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None

# ================== CORE FUNCTIONS ==================
def execute_query(operation=None, query=None, params=None):
    """Execute a database query"""
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)

        if operation == 'search':
            return cur.fetchall()
        elif operation == 'insert':
            conn.commit()
            return cur.fetchone()[0] if cur.description else None
    except Exception as e:
        conn.rollback()
        logging.error("Query failed: %s - Query: %s", str(e), query)
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# ================== USER OPERATIONS ==================
def create_user(email, password_hash, full_name=None):
    """Create a new user account"""
    query = """
    INSERT INTO users (email, password_hash, full_name)
    VALUES (%s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (email, password_hash, full_name))

def get_user_by_email(email):
    """Get user by email address"""
    query = "SELECT id, email, password_hash, full_name FROM users WHERE email = %s"
    result = execute_query('search', query, (email,))
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name']
        return dict(zip(columns, result[0]))
    return None

def update_user_by_id(user_id, email=None, full_name=None, surname=None, phone_number=None, address=None):
    query = """
    UPDATE users 
    SET email = COALESCE(%s, email), 
        full_name = COALESCE(%s, full_name), 
        surname = COALESCE(%s, surname), 
        phone_number = COALESCE(%s, phone_number), 
        address = COALESCE(%s, address)
    WHERE id = %s RETURNING id
    """
    params = (email, full_name, surname, phone_number, address, user_id)
    return execute_query('search', query, params) is not None

# ================== SOLAR SYSTEM OPERATIONS ==================
def add_solar_system(installer_id, capacity_kw, components=None, installation_date=None):
    """Add a new solar system installation"""
    query = """
    INSERT INTO solar_systems (installer_id, capacity_kw, components, installation_date)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (installer_id, capacity_kw, components, installation_date))

# ================== CONTRACT OPERATIONS ==================
def create_contract(user_id, system_id, monthly_payment, total_cost, start_date, end_date=None):
    """Create a new solar contract"""
    query = """
    INSERT INTO environmental_impact (user_id, system_id, co2_saved, trees_equivalent, calculation_date)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """

    co2_saved = 0  # Replace with actual calculation or value
    trees_equivalent = 0  # Replace with actual calculation or value
    calculation_date = datetime.datetime.now()  # Example: current timestam
    return execute_query('insert', query, (user_id, system_id, co2_saved, trees_equivalent, calculation_date))

# ================== FINANCIAL OPERATIONS ==================
def create_expense(user_id, amount, description, date=None):
    """Create a new expense for a user"""
    query = """
    INSERT INTO expenses (user_id, amount, description, date)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, amount, description, date))

def save_payment_method(user_id, payment_type, card_number=None, expiry_date=None, card_holder_name=None, is_default=False, ewallet_provider=None, ewallet_identifier=None):
    """Save a new payment method"""
    try:
        print("=== Save Payment Method Debug ===")
        print(f"User ID: {user_id}")
        print(f"Payment Type: {payment_type}")
        
        if payment_type == 'ewallet':
            # Handle eWallet payment method
            query = """
            INSERT INTO payment_methods (
                user_id, 
                payment_type, 
                ewallet_provider, 
                ewallet_identifier, 
                is_default
            )
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id
            """
            result = execute_query('insert', query, (
                user_id, 
                payment_type, 
                ewallet_provider, 
                ewallet_identifier, 
                is_default
            ))
        else:
            # Handle card payment methods
            if not expiry_date:  # Ensure expiry_date is valid
                raise Exception("Expiry date is missing or invalid")
            month, year = expiry_date.split('/')
            expiry_date = f"20{year}-{month}-01"  # Convert to YYYY-MM-DD format

            query = """
            INSERT INTO payment_methods (
                user_id, 
                payment_type, 
                card_number, 
                expiry_date, 
                card_holder_name, 
                is_default
            )
            VALUES (%s, %s, %s, %s, %s, %s) 
            RETURNING id
            """
            result = execute_query('insert', query, (
                user_id, 
                payment_type, 
                card_number, 
                expiry_date, 
                card_holder_name, 
                is_default
            ))
        
        print(f"Query result: {result}")
        return result

    except Exception as e:
        print(f"Error in save_payment_method: {str(e)}")
        import traceback
        print("Traceback:", traceback.format_exc())
        raise

def fetch_user_payment_methods(user_id):
    """Fetch all payment methods for a user"""
    query = """
    SELECT id, payment_type, card_number, expiry_date, card_holder_name, ewallet_provider, ewallet_identifier, is_default
    FROM payment_methods
    WHERE user_id = %s
    """
    result = execute_query('search', query, (user_id,))
    if result:
        columns = ['id', 'payment_type', 'card_number', 'expiry_date', 'card_holder_name', 'ewallet_provider', 'ewallet_identifier', 'is_default']
        return [dict(zip(columns, row)) for row in result]
    return []

def remove_payment_method(payment_method_id):
    """Remove a payment method by its ID"""
    query = """
    DELETE FROM payment_methods
    WHERE id = %s
    RETURNING id
    """
    result = execute_query('delete', query, (payment_method_id,))
    if result:
        return {"message": f"Payment method with ID {result[0][0]} has been removed successfully."}
    return {"error": "Payment method not found or could not be removed."}

# ================== SUPPORT OPERATIONS ==================
def create_support_ticket(user_id, subject, description, priority, status="open"):
    """Create a new support ticket"""
    query = """
    INSERT INTO support_tickets (user_id, subject, description, priority, status, created_at)
    VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING id
    """
    return execute_query('insert', query, (user_id, subject, description, priority, status))

# ================== NOTIFICATION OPERATIONS ==================
def create_notification(user_id, title, message, type):
    """Create a new notification"""
    query = """
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    result = execute_query('insert', query, (user_id, title, message, type))
    if not result:  # Ensure the query returned a result
        raise Exception("Failed to create notification")
    notification_id = result[0]
    print(f"Notification created with ID: {notification_id}")
    return notification_id

def create_load_shedding_alert(user_id, stage, start_time, end_time, area):
    """Create a load shedding alert"""
    query = """
    INSERT INTO load_shedding_alerts (user_id, stage, start_time, end_time, area)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, stage, start_time, end_time, area))

# ================== REFERRAL & GROUP OPERATIONS ==================
def create_referral(referrer_id, referred_email):
    """Create a new referral"""
    query = """
    INSERT INTO referrals (referrer_id, referred_email)
    VALUES (%s, %s) RETURNING id
    """
    return execute_query('insert', query, (referrer_id, referred_email))

def create_group_campaign(creator_id, title, description, goal_participants, discount_percentage):
    """Create a new group buying campaign"""
    query = """
    INSERT INTO group_campaigns (creator_id, title, description, goal_participants, discount_percentage)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (creator_id, title, description, goal_participants, discount_percentage))

# Add this function BEFORE initialize_db()
def add_energy_motto_column():
    conn, cur = connect_db()
    try:
        connur = connect_db()
        if not conn or not cur:
            raise Exception("Database connection failed")
        cur.execute("BEGIN")
        
        # Record payment
        contract_id = 1  # Replace with the actual contract ID or logic to fetch it
        amount = 0  # Replace with the actual amount
        payment_method = "default"  # Replace with the actual payment method
        cur.execute("""
        INSERT INTO payments (contract_id, amount, payment_method)
        VALUES (%s, %s, %s)
        """, (contract_id, amount, payment_method))
        
        
        # Update contract balance
        cur.execute("""
        UPDATE solar_contracts 
        SET payments_made = payments_made + %s
        WHERE id = %s
        """, (amount, contract_id))
        
        conn.commit()
        return True
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"🚨 Payment failed: {e}")
        return False
    finally:
        if cur: cur.close()
        if conn: conn.close()

def add_story(username, email, story):
    """Add a new story to the database"""
    conn, cur = connect_db()
    try:
        if not conn or not cur:
            raise Exception("Database connection failed")
        
        cur.execute("""
        INSERT INTO stories (username, email, story)
        VALUES (%s, %s, %s) RETURNING id
        """, (username, email, story))
        
        result = cur.fetchone()
        if result is None:  # Check if no rows were returned
            raise Exception("Failed to insert story: No rows returned.")
        
        conn.commit()
        return result[0]  # Return the ID of the inserted story
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"🚨 Failed to add story: {e}")
        return None
    finally:
        if cur: cur.close()
        if conn: conn.close()       

# ... existing code ...

def fetch_all_events(conn):
    """
    Fetch all events from the database.
    """
    try:
        cur = conn.cursor()
        cur.execute("SELECT date, title, start, end, description, location, event_type FROM events")
        events = cur.fetchall()
        return {
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
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        raise

def save_event_to_db(conn, event_data):
    """
    Save or update an event in the database.
    """
    try:
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
            (
                event_data['date'],
                event_data['title'],
                event_data['start'],
                event_data['end'],
                event_data['description'],
                event_data['location'],
                event_data['eventType']
            )
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving event: {str(e)}")
        raise

def delete_event_from_db(conn, date):
    """
    Delete an event from the database by date.
    """
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM events WHERE date = %s", (date,))
        if cur.rowcount == 0:
            raise ValueError("Event not found")
        conn.commit()
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        raise





def get_payment_history(contract_id):
    """Get payment history for a contract"""
    query = """
    SELECT id, amount, payment_date, payment_method 
    FROM payments 
    WHERE contract_id = %s
    ORDER BY payment_date DESC
    """
    return execute_query('search', query, (contract_id,))


# Initialize database tables when module loads
def initialize_db():
    conn, cur = connect_db()
    try:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            surname VARCHAR(100),
            phone_number VARCHAR(20),
            address TEXT,
            is_installer BOOLEAN DEFAULT FALSE
        )""")
        
        # Add this to ensure the column is altered if it exists with the wrong type
        cur.execute("ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(255);")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS solar_systems (
            id SERIAL PRIMARY KEY,
            installer_id INTEGER REFERENCES users(id),
            capacity_kw DECIMAL(5,2) NOT NULL,
            components TEXT,
            installation_date DATE
        )""")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS solar_contracts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            system_id INTEGER REFERENCES solar_systems(id),
            monthly_payment DECIMAL(10,2) NOT NULL,
            total_cost DECIMAL(10,2) NOT NULL,
            payments_made DECIMAL(10,2) DEFAULT 0.0,
            start_date DATE NOT NULL,
            end_date DATE,
            is_active BOOLEAN DEFAULT TRUE,
            CONSTRAINT valid_payment CHECK (monthly_payment > 0 AND total_cost > monthly_payment)
        )""")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER REFERENCES solar_contracts(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_method VARCHAR(50)
        )""")
        
        conn.commit()
        print("✅ Database tables initialized")
    except Exception as e:
        conn.rollback()
        print(f"🚨 Database initialization failed: {e}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# Initialize when imported
initialize_db()

# Temporarily add this test to support.py
if __name__ == "__main__":
    try:
        conn, cur = connect_db()
        print("✅ Database connection successful!")
        cur.execute("SELECT version()")
        print("PostgreSQL version:", cur.fetchone()[0])
    except Exception as e:
        print("🚨 Database connection failed:", e)
    finally:
        if conn: conn.close()