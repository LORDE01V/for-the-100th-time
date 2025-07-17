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

# Add the get_db function here, right after the connect_db function
def get_db():
    try:
        db_host = os.getenv('DB_HOST', 'localhost')  # Default to 'localhost' if not set
        db_name = os.getenv('DB_NAME', 'Fintech_Solar')  # Default if not set
        db_user = os.getenv('DB_USER', 'postgres')  # Default if not set
        db_password = os.getenv('DB_PASSWORD', '')  # Check for password
        db_port = os.getenv('DB_PORT', '5432')  # Default port
        
        if not db_password:
            logging.error('DB_PASSWORD is not set in your .env file. Please add it and try again.')
            raise ValueError('DB_PASSWORD environment variable must be set.')
        
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port
        )
        logging.info('Database connection successful.')
        return conn
    except OperationalError as e:
        logging.error(f'Database connection failed: {str(e)}. Please verify your .env file settings.')
        raise  # Re-raise for the caller to handle

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
    INSERT INTO solar_contracts 
    (user_id, system_id, monthly_payment, total_cost, start_date, end_date)
    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, 
                       (user_id, system_id, monthly_payment, total_cost, start_date, end_date))

def get_user_contracts(user_id):
    """Get all contracts for a user"""
    query = """
    SELECT sc.*, ss.capacity_kw, ss.components 
    FROM solar_contracts sc
    JOIN solar_systems ss ON sc.system_id = ss.id
    WHERE sc.user_id = %s
    """
    return execute_query('search', query, (user_id,))

# ================== PAYMENT OPERATIONS ==================
def record_payment(contract_id, amount, payment_method):
    """Record a payment and update contract balance"""
    conn, cur = connect_db()
    try:
        cur.execute("BEGIN")
        
        # Record payment
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
        conn.rollback()
        print(f"🚨 Payment failed: {e}")
        return False
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_payment_history(contract_id):
    """Get payment history for a contract"""
    query = """
    SELECT id, amount, payment_date, payment_method 
    FROM payments 
    WHERE contract_id = %s
    ORDER BY payment_date DESC
    """
    return execute_query('search', query, (contract_id,))


def save_support_request(name, email, subject, message):
    query = """
    INSERT INTO support_requests (name, email, subject, message)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (name, email, subject, message))

def save_community_story(user_name, story_text, rating):
    query = """
    INSERT INTO community_stories (user_name, story_text, rating)
    VALUES (%s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_name, story_text, rating))


def get_all_community_stories():
    query = """
    SELECT id, user_name, story_text, rating, created_at
    FROM community_stories
    ORDER BY created_at DESC
    """
    return execute_query('select', query)

def save_profile_details(full_name, surname, email, phone_number, address):
    query = """
    INSERT INTO users (full_name, surname, email, phone_number, address)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (full_name, surname, email, phone_number, address))

def create_event(title, start, end, description, location, event_type):
    """Insert a new event into the events table."""
    query = """
    INSERT INTO events_calendar (title, start, "end", description, location, event_type)
    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
    """
    print(f"Creating event with: {title}, {start}, {end}, {description}, {location}, {event_type}")
    return execute_query('insert', query, (title, start, end, description, location, event_type))

def get_all_events():
    """Retrieve all events from the events table."""
    query = "SELECT id, title, start, \"end\", description, location, event_type FROM events_calendar;"
    result = execute_query('search', query)
    columns = ['id', 'title', 'start', 'end', 'description', 'location', 'event_type']
    return [dict(zip(columns, row)) for row in result]



def delete_event(event_id):
    """Delete an event by its ID."""
    query = "DELETE FROM events_calendar WHERE id = %s;"
    execute_query('insert', query, (event_id,))



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

        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS support_requests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS community_stories (
            id SERIAL PRIMARY KEY,
            user_name VARCHAR(100) NOT NULL,
            story_text TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS profiledetails (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT,
            phone_number TEXT,
            address TEXT
        )
    """)
 
        cur.execute("""
        CREATE TABLE IF NOT EXISTS notification_preference (
            user_id INTEGER PRIMARY KEY,
            receive_sms BOOLEAN NOT NULL DEFAULT TRUE,
            receive_email BOOLEAN NOT NULL DEFAULT TRUE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

        cur.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
""")

        cur.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'set_updated_at'
        ) THEN
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON notification_preference
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        END IF;
        END;
        $$;
    """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS events_calendar (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            start TIMESTAMP NOT NULL,
            "end" TIMESTAMP NOT NULL,
            description TEXT NOT NULL,
            location VARCHAR(255) NOT NULL,
            event_type VARCHAR(50) NOT NULL
        );
        """)


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