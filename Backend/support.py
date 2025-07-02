import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import pandas as pd
import plotly.express as px
import json
import datetime
import logging

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
            password=os.getenv('DB_PASSWORD', 'your_password_here'),  # Ensure this is set in your .env
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None

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
        logging.error("Query failed: %s - Query: %s", str(e), query)
        raise
    finally:
        if conn:
            cur.close()
            conn.close()

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
            surname VARCHAR(100),
            phone_number VARCHAR(20),
            address TEXT,
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

# ... existing code ...

def create_payment_methods_table():
    conn, cur = connect_db()
    if not conn or not cur:
        print("Database connection failed")
        raise Exception("Database connection failed")

    try:
        # Initialize user_id (replace with actual logic to fetch user_id)
        user_id = 1  # Example: Replace with dynamic user ID retrieval logic

        # Start transaction
        cur.execute("BEGIN")
        print("Transaction started")

        # Validate user exists
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            print(f"User {user_id} not found")
            raise Exception(f"User {user_id} not found")

        # Insert expense record
        cur.execute("""
        INSERT INTO expenses (user_id, amount, purpose, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, 100, "Example Purpose", "Example Type"))
        result = cur.fetchone()
        if result is None:
            raise Exception("Failed to create expense record: No rows returned.")
        expense_id = result[0]
        print(f"Expense record created with ID: {expense_id}")

        # Commit transaction
        conn.commit()
        print("Transaction committed successfully")
        
        return expense_id

    except Exception as e:
        print(f"Error creating expense: {str(e)}")
        conn.rollback()
        print("Transaction rolled back")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()
        print("Database connection closed")



def get_user_expenses(user_id):
    """Get all expenses for a user"""
    print(f"=== Fetching expenses for user {user_id} ===")
    
    conn, cur = connect_db()
    if not conn or not cur:
        print("Database connection failed")
        raise Exception("Database connection failed")

    try:
        # Get expenses with proper date formatting
        cur.execute("""
        SELECT 
            id,
            amount,
            purpose,
            type,
            date,
            created_at
        FROM expenses 
        WHERE user_id = %s 
        ORDER BY date DESC
        """, (user_id,))
        
        expenses = cur.fetchall()
        print(f"Found {len(expenses)} expenses")
        
        # Convert to list of dictionaries with proper formatting
        formatted_expenses = [{
            'id': exp[0],
            'amount': float(exp[1]),  # Convert Decimal to float
            'purpose': exp[2],
            'type': exp[3],
            'date': exp[4].isoformat() if exp[4] else None,
            'created_at': exp[5].isoformat() if exp[5] else None
        } for exp in expenses]
        
        return formatted_expenses

    except Exception as e:
        print(f"Error fetching expenses: {str(e)}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def process_top_up_transaction(user_id, amount, type, promo_code=None, voucher_code=None):
    """Process a top-up transaction"""
    print(f"=== Starting process_top_up_transaction ===")
    print(f"User ID: {user_id}, Amount: {amount}, Type: {type}")
    
    conn, cur = connect_db()
    if not conn or not cur:
        print("Database connection failed")
        raise Exception("Database connection failed")

    try:
        # Start transaction
        cur.execute("BEGIN")
        print("Transaction started")

        # Validate user exists
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            print(f"User {user_id} not found")
            raise Exception(f"User {user_id} not found")
        print(f"User {user_id} validated")

        # Insert top-up record
        cur.execute("""
        INSERT INTO top_ups (user_id, amount, type, promo_code, voucher_code)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """, (user_id, amount, type, promo_code, voucher_code))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            raise Exception("Failed to create top-up record")
        top_up_id = result[0]
        print(f"Top-up record created with ID: {top_up_id}")

        # Create expense record
        cur.execute("""
        INSERT INTO expenses (user_id, amount, purpose, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, amount, f"{type} - Energy Credit", 'Spend'))
        result = cur.fetchone()
        if result is None:
            raise Exception("Failed to create expense record: No rows returned.")
        expense_id = result[0]
        print(f"Expense record created with ID: {expense_id}")

        # Create notification
        notification_title = f"{type.title()} Successful"
        notification_message = f"Your {type} of R{amount:.2f} was successful. Your new balance is R{amount:.2f}."
        cur.execute("""
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, notification_title, notification_message, 'success'))
        result = cur.fetchone()
        if not result:  # Ensure the query returned a result
            raise Exception("Failed to create notification")
        notification_id = result[0]
        print(f"Notification created with ID: {notification_id}")

        # Update user balance
        cur.execute("""
        INSERT INTO user_balances (user_id, balance)
        VALUES (%s, %s)
        ON CONFLICT (user_id) DO UPDATE
        SET balance = user_balances.balance + EXCLUDED.balance,
            updated_at = CURRENT_TIMESTAMP
        RETURNING balance
        """, (user_id, amount))
        result = cur.fetchone()
        if result is None:
            raise Exception("Failed to update balance: No rows returned.")
        new_balance = result[0]
        print(f"Balance updated to: {new_balance}")

        # Commit transaction
        conn.commit()
        print("Transaction committed successfully")
        
        # Ensure we return the correct data structure
        return {
            'top_up_id': top_up_id,
            'expense_id': expense_id,
            'notification_id': notification_id,
            'new_balance': float(new_balance)  # Convert to float to ensure JSON serialization
        }

    except Exception as e:
        print(f"Error in process_top_up_transaction: {str(e)}")
        conn.rollback()
        print("Transaction rolled back")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()
        print("Database connection closed")

def get_user_balance(user_id):
    """Get current balance for a user"""
    query = """
    SELECT balance
    FROM user_balances
    WHERE user_id = %s
    """
    result = execute_query('search', query, (user_id,))
    return result[0][0] if result else 0.00

def save_user_auto_top_up_settings(user_id, min_balance, top_up_amount, frequency):
    """Save or update auto top-up settings for a user"""
    print(f"=== Saving auto top-up settings for user {user_id} ===")
    print(f"Settings: min_balance={min_balance}, top_up_amount={top_up_amount}, frequency={frequency}")
    
    conn, cur = connect_db()
    if not conn or not cur:
        print("Database connection failed")
        raise Exception("Database connection failed")

    try:
        # First check if the table exists
        cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'auto_top_up_settings'
        )
        """)
        table_exists_result = cur.fetchone()
        if not table_exists_result:  # Ensure the query returned a result
            raise Exception("Failed to check if table exists")
        table_exists = table_exists_result[0]
        
        if not table_exists:
            print("Creating auto_top_up_settings table")
            cur.execute("""
            CREATE TABLE IF NOT EXISTS auto_top_up_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                min_balance DECIMAL(10,2) NOT NULL,
                top_up_amount DECIMAL(10,2) NOT NULL,
                frequency VARCHAR(20) NOT NULL,
                is_enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
            """)
            conn.commit()

        # Insert or update settings
        cur.execute("""
        INSERT INTO auto_top_up_settings 
            (user_id, min_balance, top_up_amount, frequency, is_enabled)
        VALUES (%s, %s, %s, %s, true)
        ON CONFLICT (user_id) DO UPDATE
        SET min_balance = EXCLUDED.min_balance,
            top_up_amount = EXCLUDED.top_up_amount,
            frequency = EXCLUDED.frequency,
            is_enabled = true,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, min_balance, top_up_amount, frequency, is_enabled
        """, (user_id, min_balance, top_up_amount, frequency))
        
        result = cur.fetchone()
        conn.commit()
        
        print(f"Settings saved successfully: {result}")
        
        if not result:  # Ensure the query returned a result
            return None
        return {
            'id': result[0],
            'min_balance': float(result[1]),
            'top_up_amount': float(result[2]),
            'frequency': result[3],
            'is_enabled': result[4]
        }

    except Exception as e:
        print(f'🚨 Failed to create payment methods table: {e}')
        if conn:
            conn.rollback()
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_user_auto_top_up_settings(user_id):
    """Get auto top-up settings for a user"""
    print(f"=== Getting auto top-up settings for user {user_id} ===")
    
    conn, cur = connect_db()
    if not conn or not cur:
        print("Database connection failed")
        raise Exception("Database connection failed")

    try:
        # First check if the table exists
        cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'auto_top_up_settings'
        )
        """)
        table_exists_result = cur.fetchone()
        if not table_exists_result:  # Ensure the query returned a result
            raise Exception("Failed to check if table exists")
        table_exists = table_exists_result[0]
        
        if not table_exists:
            print("Auto top-up settings table does not exist")
            return None

        # Get settings
        cur.execute("""
        SELECT id, min_balance, top_up_amount, frequency, is_enabled
        FROM auto_top_up_settings
        WHERE user_id = %s
        """, (user_id,))
        
        result = cur.fetchone()
        print(f"Query result: {result}")
        
        if not result:  # Ensure the query returned a result
            return None
        return {
            'id': result[0],
            'min_balance': float(result[1]),
            'top_up_amount': float(result[2]),
            'frequency': result[3],
            'is_enabled': result[4]
        }

    except Exception as e:
        print(f"Error getting auto top-up settings: {str(e)}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def toggle_auto_top_up(user_id, is_enabled):
    """Enable or disable auto top-up for a user"""
    print(f"=== Toggling auto top-up for user {user_id} to {is_enabled} ===")
    
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        cur.execute("""
        UPDATE auto_top_up_settings
        SET is_enabled = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = %s
        RETURNING id
        """, (is_enabled, user_id))
        
        result = cur.fetchone()
        conn.commit()
        
        return result is not None

    except Exception as e:
        print("🚨 Database connection failed:", e)
    finally:
        if conn: conn.close()