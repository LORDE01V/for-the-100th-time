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
    password = os.getenv('DB_PASSWORD')
    if not password:
        raise ValueError('DB_PASSWORD environment variable must be set.')
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
        print(f'🚨 Database connection failed: {e}')
        return None, None
 
# Add the get_db function here, right after the connect_db function
def get_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'your_password_here'),  # Ensure this is set in your .env
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
 
def get_user_balance(user_id):
    query = "SELECT balance FROM users WHERE id = %s;"  # Assuming a 'balance' column; adjust if needed
    result = execute_query('search', query, (user_id,))
    if result and len(result) > 0:
        return result[0]['balance']  # Return the balance value
    return 0.0  # Default to 0 if not found
 
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
 
def get_user_expenses(user_id):
    query = """
        SELECT id, amount, description, date FROM expenses
        WHERE user_id = %s ORDER BY date DESC;
    """
    result = execute_query('search', query, (user_id,))
    if result:
        return [dict(zip([column[0] for column in cur.description], row)) for row in result]  # Convert to dicts
    return []
 
def create_expense(user_id, amount, description):
    query = """
        INSERT INTO expenses (user_id, amount, description)
        VALUES (%s, %s, %s) RETURNING id;
    """
    try:
        result = execute_query('insert', query, (user_id, amount, description))
        return result  # Returns the new expense ID
    except Exception as e:
        return None  # Or handle error as needed
 
def process_top_up_transaction(user_id, amount):
    query = """
        UPDATE users SET balance = balance + %s WHERE id = %s RETURNING balance;  # Assuming a 'balance' column
    """
    try:
        result = execute_query('search', query, (amount, user_id))  # Use execute_query for consistency
        if result:
            return {'success': True, 'new_balance': result[0]['balance']}
        return {'success': False, 'message': 'Transaction failed'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
 
def get_user_auto_top_up_settings(user_id):
    query = "SELECT auto_top_up_amount, auto_top_up_threshold FROM users WHERE id = %s;"  # Assuming columns for auto top-up settings; adjust if needed
    result = execute_query('search', query, (user_id,))
    if result:
        return result[0]  # Return the settings as a dictionary
    return None

def save_user_auto_top_up_settings(user_id, auto_top_up_amount, auto_top_up_threshold):
    """Update auto-top-up settings for a user"""
    query = "UPDATE users SET auto_top_up_amount = %s, auto_top_up_threshold = %s WHERE id = %s;"  # Assuming columns for auto top-up settings; adjust if needed
    return execute_query('insert', query, (auto_top_up_amount, auto_top_up_threshold, user_id))

def toggle_auto_top_up(user_id):
    """Toggle auto-top-up settings for a user"""
    # First, get the current state
    settings = get_user_auto_top_up_settings(user_id)
    if settings:
        new_state = not settings.get('is_auto_top_up_enabled', False)  # Assuming a boolean column; adjust if needed
        query = "UPDATE users SET is_auto_top_up_enabled = %s WHERE id = %s;"
        return execute_query('insert', query, (new_state, user_id))
    return False  # Return False if user not found or settings don't exist

def create_support_ticket(user_id, issue_description):
    """Create a new support ticket for a user"""
    query = """
    INSERT INTO support_tickets (user_id, issue_description, status)
    VALUES (%s, %s, 'open') RETURNING id;  # Assuming a support_tickets table; adjust if needed
    """
    return execute_query('insert', query, (user_id, issue_description))
 
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