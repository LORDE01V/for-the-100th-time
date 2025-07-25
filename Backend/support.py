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
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        try:
            conn = psycopg2.connect(db_url)
            return conn, conn.cursor()
        except Exception as e:
            logging.error(f"🚨 Database connection failed using DATABASE_URL: {e}")
            return None, None
    else:
        try:
            db_host = os.getenv('DB_HOST', 'localhost')
            db_name = os.getenv('DB_NAME', 'Fintech_Solar')
            db_user = os.getenv('DB_USER', 'postgres')
            db_password = os.getenv('DB_PASSWORD', '')
            db_port = os.getenv('DB_PORT', '5432')
            
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
            return conn, conn.cursor()
        except OperationalError as e:
            logging.error(f'Database connection failed: {str(e)}. Please verify your .env file settings.')
            raise  # Re-raise for the caller to handle

def execute_query(query_type, query, params=None):
    """Execute a database query"""
    conn = None
    cur = None
    try:
        conn, cur = connect_db()
        if not conn or not cur:
            raise Exception("Database connection failed")
        
        if query_type == 'alter':
            cur.execute(query)
        else:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
        
        if query_type in ['insert', 'update', 'delete']:
            conn.commit()
            result = cur.fetchone()[0] if cur.description else None
        else:
            result = cur.fetchall() if cur.description else None
            
        return result
        
    except Exception as e:
        if conn:
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

def update_user_by_id(user_id, email=None, full_name=None, surname=None, phone_number=None, address=None, password_hash=None):
    updates = []
    params = []
    if email is not None: updates.append("email = %s"); params.append(email)
    if full_name is not None: updates.append("full_name = %s"); params.append(full_name)
    if surname is not None: updates.append("surname = %s"); params.append(surname)
    if phone_number is not None: updates.append("phone_number = %s"); params.append(phone_number)
    if address is not None: updates.append("address = %s"); params.append(address)
    if password_hash is not None: updates.append("password_hash = %s"); params.append(password_hash)
    
    if not updates:
        return False

    query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id"
    params.append(user_id)
    
    try:
        return execute_query('update', query, params) is not None
    except Exception as e:
        logging.error(f"Error updating user: {e}")
        return False

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

def create_topup_table():
    query = """
    CREATE TABLE IF NOT EXISTS topup_transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,  // References the user making the top-up
        amount DECIMAL(10, 2) NOT NULL,  // Top-up amount in ZAR
        promo_code VARCHAR(50),  // Optional promo code
        voucher_code VARCHAR(50),  // Optional voucher code
        transaction_type VARCHAR(50) NOT NULL,  // e.g., 'topup' or 'recharge'
        is_auto_topup BOOLEAN DEFAULT FALSE,  // Whether it's an auto-top-up
        min_balance DECIMAL(10, 2),  // Minimum balance threshold for auto-top-up
        auto_topup_amount DECIMAL(10, 2),  // Amount for auto-top-up
        auto_topup_frequency VARCHAR(50),  // e.g., 'weekly'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  // Timestamp of the transaction
    );
    """
    try:
        execute_query('alter', query)
        print("Top-up table created successfully.")
    except Exception as e:
        print(f"🚨 Failed to create top-up table: {str(e)}")

# Initialize database tables when module loads
def initialize_db():
    conn, cur = connect_db()[0:2] # Ensure both conn and cur are unpacked
    if conn is None or cur is None:
        print("Database connection failed.")
        return  # or raise an Exception if you want to stop execution

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