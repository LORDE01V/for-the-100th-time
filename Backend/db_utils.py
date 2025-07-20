import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

def execute_query(query_type, query, params=None):
    """Execute a database query"""
    conn = None
    try:
        conn = connect_db()[0]
        if not conn:
            raise Exception("Database connection failed")
        
        cur = conn.cursor()
        
        if query_type == 'alter':
            cur.execute(query)
        else:
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
