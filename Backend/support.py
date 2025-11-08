import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import logging
import datetime # Import the datetime module

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
        if not query:
            raise ValueError("Query cannot be None or empty")
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)

        normalized_op = (operation or '').lower()
        if normalized_op in ('search', 'select'):
            return cur.fetchall()
        elif normalized_op in ('insert', 'update', 'delete', 'create', 'alter'):
            conn.commit()
            # For INSERT ... RETURNING, UPDATE ... RETURNING, etc.
            if cur.description:
                row = cur.fetchone()
                if row is None:
                    return None
                # Return the first column if a single id is returned, else the whole row
                return row[0] if len(row) == 1 else row
            return None
        else:
            # Default: commit if it mutates, best-effort safe fallback
            try:
                conn.commit()
            except Exception:
                pass
            return None
    except Exception as e:
        if conn:
            conn.rollback()
        logging.error("Query failed: %s - Query: %s", str(e), query)
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# ================== SCHEMA HELPERS ==================
def ensure_last_login_column():
    """Ensure users.last_login exists (safe to call repeatedly)."""
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")
    try:
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;")
        conn.commit()
    finally:
        if cur: cur.close()
        if conn: conn.close()

# ================== USER OPERATIONS ==================
def create_user(email, password_hash, full_name=None, phone_number=None):
    """Create a new user account"""
    query = """
    INSERT INTO users (email, password_hash, full_name, phone_number)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (email, password_hash, full_name, phone_number))

def get_user_by_email(email):
    """Get user by email address"""
    query = "SELECT id, email, password_hash, full_name, phone_number, last_login FROM users WHERE email = %s"
    try:
        result = execute_query('search', query, (email,))
    except Exception as e:
        if 'last_login' in str(e):
            ensure_last_login_column()
            result = execute_query('search', query, (email,))
        else:
            raise
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name', 'phone_number', 'last_login']
        return dict(zip(columns, result[0]))
    return None

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        user_id = int(user_id)
    except Exception:
        return None
    query = "SELECT id, email, password_hash, full_name, phone_number, last_login FROM users WHERE id = %s"
    try:
        result = execute_query('search', query, (user_id,))
    except Exception as e:
        if 'last_login' in str(e):
            ensure_last_login_column()
            result = execute_query('search', query, (user_id,))
        else:
            raise
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name', 'phone_number', 'last_login']
        return dict(zip(columns, result[0]))
    return None

def get_user_by_email_or_id(identifier):
    """Try by id first, then by email"""
    user = get_user_by_id(identifier)
    if user:
        return user
    return get_user_by_email(identifier)

def update_user_by_id(user_id, email=None, full_name=None, phone_number=None):
    query = """
    UPDATE users 
    SET email = COALESCE(%s, email), 
        full_name = COALESCE(%s, full_name),
        phone_number = COALESCE(%s, phone_number)
    WHERE id = %s RETURNING id
    """
    params = (email, full_name, phone_number, user_id)
    return execute_query('search', query, params) is not None

def create_user_from_google(user_info):
    """Create user from Google OAuth info"""
    return create_user(
        email=user_info['email'],
        password_hash=None,
        full_name=user_info.get('name', '')
    )

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
    if not cur:
        raise Exception("Database connection failed. Cursor is None")
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
        

        if conn:
            conn.commit()
        else:
            raise Exception("Database connection failed. Connection is None")
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
    if result:
        return [dict(zip(columns, row)) for row in result]
    


def delete_event(event_id):
    """Delete an event by its ID."""
    query = "DELETE FROM events_calendar WHERE id = %s;"
    execute_query('insert', query, (event_id,))

def get_user_balance(user_id):
    """Fetch the current balance for a user."""
    query = "SELECT current_balance FROM topup_settings WHERE user_id = %s"
    result = execute_query('search', query, (user_id,))
    if result:
        return result[0][0]  # Return the balance
    return 0.0  # Default to 0.0 if no balance is found

def update_user_balance(user_id, amount):
    print(f"Updating balance for user_id={user_id}, amount={amount}")
    # First, try to update the balance
    query = """
    UPDATE topup_settings
    SET current_balance = current_balance + %s, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = %s
    RETURNING current_balance
    """
    result = execute_query('search', query, (amount, user_id))
    print(f"Update result: {result}")
    if result:
        return result[0][0]  # Return the updated balance

    # If no row was updated, insert a new row for this user
    print("No existing topup_settings row for user, inserting new row...")
    insert_query = """
    INSERT INTO topup_settings (user_id, current_balance)
    VALUES (%s, %s)
    RETURNING current_balance
    """
    insert_result = execute_query('search', insert_query, (user_id, amount))
    print(f"Insert result: {insert_result}")
    if insert_result:
        return insert_result[0][0]
    raise Exception("Failed to update or insert user balance")


def record_topup_transaction(user_id, amount, promo_code=None, voucher_code=None, transaction_type='topup'):
    """Persist a topup transaction and return the new id."""
    query = """
    INSERT INTO topup_transactions (user_id, amount, promo_code, voucher_code, transaction_type)
    VALUES (%s, %s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, amount, promo_code, voucher_code, transaction_type))


def create_expense(user_id, amount, category='Topup', status='Paid'):
    """Create an expense entry for the user and return the new id."""
    query = """
    INSERT INTO expenses (user_id, amount, category, status)
    VALUES (%s, %s, %s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, amount, category, status))


def create_notification(user_id, message):
    """Create a notification for the user and return the new id."""
    query = """
    INSERT INTO notifications (user_id, message)
    VALUES (%s, %s) RETURNING id
    """
    return execute_query('insert', query, (user_id, message))

def save_auto_topup_settings(user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency):
    query = """
    INSERT INTO topup_settings (user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency)
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (user_id) DO UPDATE SET
        is_auto_topup = EXCLUDED.is_auto_topup,
        min_balance = EXCLUDED.min_balance,
        auto_topup_amount = EXCLUDED.auto_topup_amount,
        auto_topup_frequency = EXCLUDED.auto_topup_frequency,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id
    """
    return execute_query('insert', query, (user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency))

# Placeholder for save_payment_method
def save_payment_method(user_id, payment_type, card_number, expiry_date, card_holder_name, is_default):
    """
    Placeholder for saving a payment method.
    TODO: Implement actual database logic for saving payment methods.
    """
    print(f"Placeholder: Saving payment method for user {user_id}: {payment_type}, {card_number}, {expiry_date}, {card_holder_name}, {is_default}")
    # Return a dummy ID for now
    return 1 

# Placeholder for fetch_user_payment_methods
def fetch_user_payment_methods(user_id):
    """
    Placeholder for fetching user payment methods.
    TODO: Implement actual database logic for fetching payment methods.
    """
    print(f"Placeholder: Fetching payment methods for user {user_id}")
    # Return dummy data for now
    return [
        {
            'id': 1,
            'payment_type': 'Credit Card',
            'card_number': '**** **** **** 1234',
            'expiry_date': '12/25',
            'card_holder_name': 'John Doe',
            'is_default': True,
            'created_at': datetime.datetime.now()
        }
    ]

# Initialize database tables when module loads
def initialize_db():
    conn, cur = connect_db()
    if not cur:
        raise Exception("Database connection failed. Cursor is None")
    try:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            full_name VARCHAR(100),
            phone_number VARCHAR(20)
        )""")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);") # Add phone_number column if it doesn't exist
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;") # Track last login
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

        cur.execute("""
        CREATE TABLE IF NOT EXISTS topup_transactions (
            id SERIAL PRIMARY KEY,                     
            user_id INTEGER NOT NULL,                  
            amount DECIMAL(10, 2) NOT NULL,            
            promo_code VARCHAR(50),                    
            voucher_code VARCHAR(50),                  
            transaction_type VARCHAR(50) NOT NULL,              
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
""")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS topup_settings (
            id SERIAL PRIMARY KEY,                     
            user_id INTEGER NOT NULL UNIQUE, 
            current_balance DECIMAL(10, 2) DEFAULT 0.0,          
            is_auto_topup BOOLEAN DEFAULT FALSE,      
            min_balance DECIMAL(10, 2),                
            auto_topup_amount DECIMAL(10, 2),          
            auto_topup_frequency VARCHAR(50),         
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            FOREIGN KEY (user_id) REFERENCES users(id) 
); 
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                amount NUMERIC(10, 2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'Paid'
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT FALSE
    );
""")

        if conn:
            conn.commit()
        print("✅ Database tables initialized")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"🚨 Database initialization failed: {e}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

# Initialize when imported
import os
if os.getenv('AUTO_INIT_DB', 'false').lower() in ('1', 'true', 'yes'):
    initialize_db()

# Test connection when run directly
if __name__ == "__main__":
    try:
        conn, cur = connect_db()
        if not conn or not cur:
            raise Exception("Database connection failed. Connection or cursor is None")
        print("✅ Database connection successful!")
        cur.execute("SELECT version()")
        result = cur.fetchone()
        if result:
            print("PostgreSQL version: ", result[0])
        else:
            print("🚨 Failed to get PosstgreSQl version.")

    except Exception as e:
        print("🚨 Database connection failed:", e)
    finally:
        if cur: cur.close()
        if conn: conn.close()
        