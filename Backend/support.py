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
        print(f"🚨 Query failed: {e}\nQuery: {query}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# ================== USER OPERATIONS ==================
def create_user(email, password_hash, full_name=None, phone=None, is_installer=False):
    """Create a new user account"""
    query = """
    INSERT INTO users (email, password_hash, full_name, phone, is_installer)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (email, password_hash, full_name, phone, is_installer))

def get_user_by_email(email):
    """Get user by email address"""
    query = "SELECT * FROM users WHERE email = %s"
    result = execute_query('search', query, (email,))
    return result[0] if result else None

# ================== PROFILE OPERATIONS ==================
def update_user_profile(user_id, full_name, email, phone, address, energy_motto):
    """Update or create user profile information"""
    query = """
    INSERT INTO user_profiles (user_id, full_name, email_address, phone_number, address, energy_motto)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email_address = EXCLUDED.email_address,
        phone_number = EXCLUDED.phone_number,
        address = EXCLUDED.address,
        energy_motto = EXCLUDED.energy_motto,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id
    """
    return execute_query('insert', query, (user_id, full_name, email, phone, address, energy_motto))

def update_social_links(user_id, facebook_url=None, twitter_url=None, instagram_url=None):
    """Update or create social media links"""
    query = """
    INSERT INTO social_links (user_id, facebook_profile_url, twitter_profile_url, instagram_profile_url)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (user_id) DO UPDATE
    SET facebook_profile_url = EXCLUDED.facebook_profile_url,
        twitter_profile_url = EXCLUDED.twitter_profile_url,
        instagram_profile_url = EXCLUDED.instagram_profile_url
    RETURNING id
    """
    return execute_query('insert', query, (user_id, facebook_url, twitter_url, instagram_url))

# ================== SOLAR SYSTEM OPERATIONS ==================
def add_solar_system(user_id, installer_id, capacity_kw, components=None, installation_date=None):
    """Add a new solar system installation"""
    query = """
    INSERT INTO solar_systems (user_id, installer_id, capacity_kw, components, installation_date)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, installer_id, capacity_kw, components, installation_date))

def record_energy_usage(user_id, system_id, reading_date, kwh_used):
    """Record energy usage"""
    query = """
    INSERT INTO energy_usage (user_id, system_id, reading_date, kwh_used)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, system_id, reading_date, kwh_used))

def record_environmental_impact(user_id, system_id, co2_saved, trees_equivalent, calculation_date):
    """Record environmental impact"""
    query = """
    INSERT INTO environmental_impact (user_id, system_id, co2_saved, trees_equivalent, calculation_date)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, system_id, co2_saved, trees_equivalent, calculation_date))

# ================== FINANCIAL OPERATIONS ==================
def save_payment_method(user_id, payment_type, card_number, expiry_date, card_holder_name, is_default=False):
    """Save a new payment method"""
    try:
        print("=== Save Payment Method Debug ===")
        print(f"User ID: {user_id}")
        print(f"Payment Type: {payment_type}")
        print(f"Card Number: {card_number}")
        print(f"Expiry Date: {expiry_date}")
        print(f"Card Holder Name: {card_holder_name}")
        print(f"Is Default: {is_default}")

        # Convert MM/YY to a proper date (first day of the month)
        try:
            month, year = expiry_date.split('/')
            expiry_date = f"20{year}-{month}-01"  # Convert to YYYY-MM-DD format
            print(f"Converted expiry date: {expiry_date}")
        except Exception as e:
            print(f"Error converting expiry date: {str(e)}")
            raise

        query = """
        INSERT INTO payment_methods (user_id, payment_type, card_number, expiry_date, card_holder_name, is_default)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
        """
        
        result = execute_query('insert', query, (user_id, payment_type, card_number, expiry_date, card_holder_name, is_default))
        print(f"Query result: {result}")
        return result

    except Exception as e:
        print(f"Error in save_payment_method: {str(e)}")
        import traceback
        print("Traceback:", traceback.format_exc())
        raise

def record_transaction(user_id, amount, transaction_type, status, payment_method_id):
    """Record a new transaction"""
    query = """
    INSERT INTO transactions (user_id, amount, transaction_type, status, payment_method_id)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, amount, transaction_type, status, payment_method_id))

def record_expense(user_id, amount, category, description, expense_date):
    """Record a new expense"""
    query = """
    INSERT INTO expenses (user_id, amount, category, description, expense_date)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, amount, category, description, expense_date))

# ================== COMMUNITY OPERATIONS ==================
def create_forum_topic(user_id, title, content):
    """Create a new forum topic"""
    query = """
    INSERT INTO forum_topics (user_id, title, content)
    VALUES (%s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, title, content))

def add_forum_reply(topic_id, user_id, content):
    """Add a reply to a forum topic"""
    query = """
    INSERT INTO forum_replies (topic_id, user_id, content)
    VALUES (%s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (topic_id, user_id, content))

def create_support_ticket(user_id, subject, message):
    """
    Create a new support ticket in the database
    
    Args:
        user_id (int): The ID of the user creating the ticket
        subject (str): The subject of the support ticket
        message (str): The message content of the support ticket
        
    Returns:
        int: The ID of the newly created ticket
    """
    query = """
        INSERT INTO support_tickets (user_id, subject, message, status)
        VALUES (%s, %s, %s, 'open')
        RETURNING id
    """
    return execute_query('insert', query, (user_id, subject, message))

# ================== NOTIFICATION OPERATIONS ==================
def create_notification(user_id, title, message, type):
    """Create a new notification"""
    query = """
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, title, message, type))

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
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        # Add energy_motto column if it doesn't exist
        cur.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'user_profiles' 
                    AND column_name = 'energy_motto'
                ) THEN
                    ALTER TABLE user_profiles 
                    ADD COLUMN energy_motto TEXT;
                END IF;
            END $$;
        """)
        conn.commit()
    except Exception as e:
        print(f"Error adding energy_motto column: {str(e)}")
        conn.rollback()
        raise e
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# Then the initialize_db function
def initialize_db():
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        # 1. User Management & Authentication
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(20),
            is_installer BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            full_name VARCHAR(100) NOT NULL,
            email_address VARCHAR(255) NOT NULL,
            phone_number VARCHAR(20),
            address TEXT,
            energy_motto TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id)
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS social_links (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            facebook_profile_url VARCHAR(255),
            twitter_profile_url VARCHAR(255),
            instagram_profile_url VARCHAR(255),
            UNIQUE(user_id)
        )""")

        # 2. Solar System & Energy Management
        cur.execute("""
        CREATE TABLE IF NOT EXISTS solar_systems (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            installer_id INTEGER REFERENCES users(id),
            capacity_kw DECIMAL(5,2) NOT NULL,
            components TEXT,
            installation_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS energy_usage (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            system_id INTEGER REFERENCES solar_systems(id),
            reading_date DATE NOT NULL,
            kwh_used DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS environmental_impact (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            system_id INTEGER REFERENCES solar_systems(id),
            co2_saved DECIMAL(10,2),
            trees_equivalent INTEGER,
            calculation_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        # 3. Financial Management
        cur.execute("""
        CREATE TABLE IF NOT EXISTS payment_methods (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            payment_type VARCHAR(50) NOT NULL,
            card_number VARCHAR(20),
            expiry_date DATE,
            card_holder_name VARCHAR(100),
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            transaction_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) NOT NULL,
            payment_method_id INTEGER REFERENCES payment_methods(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        # Drop the existing expenses table if it exists
        cur.execute("DROP TABLE IF EXISTS expenses CASCADE")
        
        # Create expenses table with the correct schema
        cur.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            amount DECIMAL(10,2) NOT NULL,
            purpose VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 4. Community & Support
        cur.execute("""
        CREATE TABLE IF NOT EXISTS forum_topics (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS forum_replies (
            id SERIAL PRIMARY KEY,
            topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS support_tickets (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        # 5. Notifications & Alerts
        cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS load_shedding_alerts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            stage INTEGER NOT NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            area VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        # 6. Referral & Group Buying
        cur.execute("""
        CREATE TABLE IF NOT EXISTS referrals (
            id SERIAL PRIMARY KEY,
            referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            referred_email VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            reward_amount DECIMAL(10,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS group_campaigns (
            id SERIAL PRIMARY KEY,
            creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            goal_participants INTEGER NOT NULL,
            current_participants INTEGER DEFAULT 0,
            discount_percentage DECIMAL(5,2),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS user_settings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            receive_sms BOOLEAN DEFAULT true,
            receive_email BOOLEAN DEFAULT true,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id)
        )""")

        # Create top_ups table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS top_ups (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            amount DECIMAL(10,2) NOT NULL,
            type VARCHAR(50) NOT NULL,
            promo_code VARCHAR(50),
            voucher_code VARCHAR(50),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Create user_balances table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS user_balances (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            balance DECIMAL(10,2) DEFAULT 0.00,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Create auto_top_up_settings table
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

        # Add energy_motto column if it doesn't exist
        add_energy_motto_column()

        conn.commit()
        print("✅ Database tables created successfully!")
    except Exception as e:
        conn.rollback()
        print(f"🚨 Error creating tables: {e}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# Initialize when imported
initialize_db()

# Add these new functions to support.py

def create_expense(user_id, amount, purpose, type):
    """Create a new expense record"""
    print(f"=== Creating expense ===")
    print(f"User ID: {user_id}, Amount: {amount}, Purpose: {purpose}, Type: {type}")
    
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

        # Insert expense record
        cur.execute("""
        INSERT INTO expenses (user_id, amount, purpose, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, amount, purpose, type))
        expense_id = cur.fetchone()[0]
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
        top_up_id = cur.fetchone()[0]
        print(f"Top-up record created with ID: {top_up_id}")

        # Create expense record
        cur.execute("""
        INSERT INTO expenses (user_id, amount, purpose, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, amount, f"{type} - Energy Credit", 'Spend'))
        expense_id = cur.fetchone()[0]
        print(f"Expense record created with ID: {expense_id}")

        # Create notification
        notification_title = f"{type.title()} Successful"
        notification_message = f"Your {type} of R{amount:.2f} was successful. Your new balance is R{amount:.2f}."
        cur.execute("""
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """, (user_id, notification_title, notification_message, 'success'))
        notification_id = cur.fetchone()[0]
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
        new_balance = cur.fetchone()[0]
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
        table_exists = cur.fetchone()[0]
        
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
        
        return {
            'id': result[0],
            'min_balance': float(result[1]),
            'top_up_amount': float(result[2]),
            'frequency': result[3],
            'is_enabled': result[4]
        }

    except Exception as e:
        print(f"Error saving auto top-up settings: {str(e)}")
        conn.rollback()
        raise
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
        table_exists = cur.fetchone()[0]
        
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
        
        if result:
            return {
                'id': result[0],
                'min_balance': float(result[1]),
                'top_up_amount': float(result[2]),
                'frequency': result[3],
                'is_enabled': result[4]
            }
        return None

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
        conn.rollback()
        print(f"Error toggling auto top-up: {str(e)}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

def get_payment_methods(user_id):
    """Get all payment methods for a user"""
    query = """
    SELECT id, payment_type, card_number, expiry_date, card_holder_name, is_default
    FROM payment_methods
    WHERE user_id = %s
    ORDER BY is_default DESC, created_at DESC
    """
    return execute_query('select', query, (user_id,))

def delete_payment_method(payment_method_id, user_id):
    """Delete a payment method"""
    query = """
    DELETE FROM payment_methods
    WHERE id = %s AND user_id = %s
    RETURNING id
    """
    return execute_query('delete', query, (payment_method_id, user_id))