import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import pandas as pd
import plotly.express as px
import json
import datetime

# Load environment variables
load_dotenv()

# ================== DATABASE CONNECTION ==================
def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'Fintech_Solar'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn, conn.cursor()
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None, None

# ================== CORE FUNCTIONS ==================
def execute_query(query_type, query, params=None):
    """Execute a database query"""
    conn = None
    try:
        conn = connect_db()[0]
        if not conn:
            raise Exception("Database connection failed")
        
        cur = conn.cursor()
        
        if query_type == 'alter':
            # For ALTER TABLE commands, we need to execute them directly
            cur.execute(query)
        else:
            # For other query types, use parameterized queries
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
        
        if query_type in ['insert', 'update', 'delete']:
            conn.commit()
            result = cur.fetchone() if cur.description else None
        else:
            result = cur.fetchall() if cur.description else None
            
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"🚨 Query failed: {str(e)}")
        print(f"\nQuery:\n{query}")
        raise
    finally:
        if conn:
            cur.close()
            conn.close()

# ================== USER OPERATIONS ==================
def create_user(email, password_hash, full_name=None, phone=None, is_installer=False):
    """Create a new user account"""
    query = """
    INSERT INTO users (email, password_hash, full_name, phone)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (email, password_hash, full_name, phone))

def get_user_by_email(email):
    """Get user by email address"""
    query = "SELECT id, email, password_hash, full_name, phone FROM users WHERE email = %s"
    result = execute_query('search', query, (email,))
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name', 'phone']
        return dict(zip(columns, result[0]))
    return None

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

# Initialize database tables when module loads
def initialize_db():
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(20),
            is_installer BOOLEAN DEFAULT FALSE
        )""")
        
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
        CREATE TABLE IF NOT EXISTS payment_methods (
            id SERIAL PRIMARY KEY,
            method_name VARCHAR(50) NOT NULL UNIQUE,  -- e.g., 'credit_card', 'bank_transfer'
            description TEXT
        )
        """)
        
        conn.commit()
        print("✅ Database tables created successfully!")
        create_payment_methods_table()
    except Exception as e:
        conn.rollback()
        print(f"🚨 Error creating tables: {e}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def create_payment_methods_table():
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception('Database connection failed')
    
    try:
        cur.execute('''
        CREATE TABLE IF NOT EXISTS payment_methods (
            id SERIAL PRIMARY KEY,
            method_name VARCHAR(50) NOT NULL UNIQUE,
            description TEXT
        )
        ''')
        conn.commit()
        print('✅ Payment methods table created successfully!')
    except Exception as e:
        print(f'🚨 Failed to create payment methods table: {e}')
        if conn:
            conn.rollback()
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