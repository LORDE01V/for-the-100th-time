import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import logging
import sys
 

# Load environment variables
load_dotenv()
 
# ================== DATABASE CONNECTION ==================
def connect_db():
    """Connect to PostgreSQL database"""
    password = os.getenv('DB_PASSWORD')
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
        return conn
    except OperationalError as e:
        logging.error(f'Database connection failed: {str(e)}. Please verify your .env file settings.')
        raise

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
        elif operation == 'update':
            conn.commit()
            return True
        elif operation == 'delete':
            conn.commit()
            return True
    except Exception as e:
        if conn:
            conn.rollback()
        logging.error("Query failed: %s - Query: %s", str(e), query)
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()
 
# ================== USER OPERATIONS ==================
def create_user(email, password_hash, full_name=None, phone=None):
    """Create a new user account"""
    query = """
    INSERT INTO users (email, password_hash, full_name, phone)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (email, password_hash, full_name, phone))

def get_user_by_email(email):
    """Get user by email address"""
    query = "SELECT id, email, password_hash, full_name, phone, onboarded FROM users WHERE email = %s"
    result = execute_query('search', query, (email,))
    if result:
        # Map result to a dictionary with appropriate keys
        columns = [desc[0] for desc in cur.description] # Get column names from cursor description
        return dict(zip(columns, result[0])) if result else None
    return None

def update_user_by_id(user_id, full_name=None, password_hash=None, phone=None, onboarded=None):
    """Update user information by ID."""
    updates = []
    params = []
    
    if full_name is not None:
        updates.append("full_name = %s")
        params.append(full_name)
    if password_hash is not None:
        updates.append("password_hash = %s")
        params.append(password_hash)
    if phone is not None:
        updates.append("phone = %s")
        params.append(phone)
    if onboarded is not None:
        updates.append("onboarded = %s")
        params.append(onboarded)

    if not updates:
        return False # No updates to perform

    query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
    params.append(user_id)
    
    try:
        return execute_query('update', query, tuple(params))
    except Exception as e:
        logging.error(f"Error updating user {user_id}: {e}")
        return False

# ================== DB INITIALIZATION ==================
def initialize_db():
    conn = None
    cur = None
    try:
        conn, cur = connect_db()
        if not conn or not cur:
            raise Exception("Database connection not established.")

        # Create 'users' table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                phone VARCHAR(20),
                onboarded BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Add 'onboarded' column if it doesn't exist
        try:
            cur.execute("ALTER TABLE users ADD COLUMN onboarded BOOLEAN DEFAULT FALSE;")
            conn.commit()
            logging.info("Column 'onboarded' added to 'users' table.")
        except psycopg2.errors.DuplicateColumn:
            conn.rollback() # Rollback the failed ALTER TABLE if column already exists
            logging.info("Column 'onboarded' already exists in 'users' table.")
        except Exception as e:
            conn.rollback()
            logging.error(f"Error altering 'users' table: {e}")
            raise # Re-raise other exceptions for proper handling

        # Create 'transactions' table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                transaction_type VARCHAR(50) NOT NULL,
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Completed',
                promo_code VARCHAR(100),
                voucher_code VARCHAR(100),
                is_auto_topup BOOLEAN DEFAULT FALSE,
                min_balance DECIMAL(10, 2),
                auto_topup_amount DECIMAL(10, 2),
                auto_topup_frequency VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        """)

        conn.commit()
        logging.info("Database tables initialized/updated successfully.")
        return True
    except Exception as e:
        if conn:
            conn.rollback()
        logging.error(f"Database initialization failed: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# ================== TOP-UP AND TRANSACTION FUNCTIONS ==================

def record_transaction(user_id, amount, transaction_type, status='Completed', promo_code=None, voucher_code=None, is_auto_topup=False, min_balance=None, auto_topup_amount=None, auto_topup_frequency=None):
    """
    Records a new transaction in the database.
    """
    query = """
    INSERT INTO transactions (user_id, amount, transaction_type, transaction_date, status, promo_code, voucher_code, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency)
    VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    params = (user_id, amount, transaction_type, status, promo_code, voucher_code, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency)
    try:
        transaction_id = execute_query('insert', query, params)
        logging.info(f"Transaction recorded: ID {transaction_id} for user {user_id}, amount {amount}")
        return transaction_id
    except Exception as e:
        logging.error(f"Error recording transaction for user {user_id}: {e}")
        raise

def get_user_transactions(user_id):
    """
    Retrieves all transactions for a given user.
    """
    query = "SELECT * FROM transactions WHERE user_id = %s ORDER BY transaction_date DESC;"
    try:
        transactions_raw = execute_query('search', query, (user_id,))
        if transactions_raw:
            # Get column names from the cursor description to create dictionaries
            conn, cur = connect_db()
            cur.execute(query, (user_id,))
            column_names = [desc[0] for desc in cur.description]
            cur.close()
            conn.close()
            
            transactions = []
            for row in transactions_raw:
                transactions.append(dict(zip(column_names, row)))
            return transactions
        return []
    except Exception as e:
        logging.error(f"Error retrieving transactions for user {user_id}: {e}")
        return []

def get_all_transactions():
    """
    Retrieves all transactions from the database (for admin use or overview).
    """
    query = "SELECT * FROM transactions ORDER BY transaction_date DESC;"
    try:
        transactions_raw = execute_query('search', query)
        if transactions_raw:
            conn, cur = connect_db()
            cur.execute(query)
            column_names = [desc[0] for desc in cur.description]
            cur.close()
            conn.close()
            
            transactions = []
            for row in transactions_raw:
                transactions.append(dict(zip(column_names, row)))
            return transactions
        return []
    except Exception as e:
        logging.error(f"Error retrieving all transactions: {e}")
        return []