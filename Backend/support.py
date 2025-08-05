import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# New hardcoded database credentials
DB_HOST = 'dpg-d20ue6umcj7s73e6p9pg-a.oregon-postgres.render.com'
DB_NAME = 'fintech_solar'
DB_USER = 'fintech_solar_user'
DB_PASSWORD = 'qy0R5lHZJvIyVL6b9Be54BJ51kbrAEDR'
DB_PORT = '5432'


# ================== DATABASE CONNECTION ==================
def connect_db():
    """Connect to PostgreSQL database"""
    # Removed reliance on os.getenv for DB credentials
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            sslmode='prefer',  # Changed from 'require' to 'prefer'
            sslcert=None,
            sslkey=None,
            sslrootcert=None# Ensure SSL is required
        )
        return conn, conn.cursor()
    except OperationalError as e:
        print(f"🚨 Database connection failed: {e}")
        return None, None

def get_db():
    try:
        # Removed reliance on os.getenv for DB credentials
        # Removed DB_PASSWORD check as it's now hardcoded
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            sslmode='require' # Ensure SSL is required
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
 
        if operation == 'search':
            return cur.fetchall()
        elif operation == 'insert':
            conn.commit()
            result = cur.fetchone()
            return result[0] if result and cur.description else None
    except Exception as e:
        if conn:
            conn.rollback()
        logging.error("Query failed: %s - Query: %s", str(e), query)
        raise
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
    query = "SELECT id, email, password_hash, full_name, phone_number FROM users WHERE email = %s"
    result = execute_query('search', query, (email,))
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name', 'phone_number']
        return dict(zip(columns, result[0]))
    return None

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        user_id = int(user_id)
    except Exception:
        return None
    query = "SELECT id, email, password_hash, full_name, phone_number FROM users WHERE id = %s"
    result = execute_query('search', query, (user_id,))
    if result:
        columns = ['id', 'email', 'password_hash', 'full_name', 'phone_number']
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
    return execute_query('search', query)

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
    try:
        result = execute_query('search', query)
        columns = ['id', 'title', 'start', 'end', 'description', 'location', 'event_type']
        if result:
            return [dict(zip(columns, row)) for row in result]
        return []  # Return an empty list if no results
    except Exception as e:
        # Log the error for debugging
        print(f"Error retrieving events: {e}")
        return []
   
 
 
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

def save_payment_method(user_id, payment_type, card_number, expiry_date, card_holder_name, is_default=False):
    """Saves a new payment method for a user."""
    query = """
    INSERT INTO payment_methods (user_id, payment_type, card_number, expiry_date, card_holder_name, is_default)
    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
    """
    params = (user_id, payment_type, card_number, expiry_date, card_holder_name, is_default)
    return execute_query('insert', query, params)

def fetch_user_payment_methods(user_id):
    """Fetches all payment methods for a given user."""
    query = """
    SELECT id, payment_type, card_number, expiry_date, card_holder_name, is_default, created_at
    FROM payment_methods
    WHERE user_id = %s
    ORDER BY is_default DESC, created_at DESC
    """
    results = execute_query('search', query, (user_id,))
    if results:
        # Assuming execute_query returns a list of tuples, convert to list of dicts
        columns = ['id', 'payment_type', 'card_number', 'expiry_date', 'card_holder_name', 'is_default', 'created_at']
        return [dict(zip(columns, row)) for row in results]
    return []


def add_user_to_campaign(user_id, campaign_id):
    """
    Adds a user to a campaign in the user_campaigns table.
    """
    try:
        # Validate campaign exists
        campaign_query = "SELECT id FROM campaigns WHERE id = %s"
        campaign_result = execute_query('search', campaign_query, (campaign_id,))
        
        if not campaign_result:
            raise Exception("Campaign not found")
        
        # Insert with conflict handling
        query = """
        INSERT INTO user_campaigns (user_id, campaign_id, joined_at)
        VALUES (%s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, campaign_id) DO NOTHING
        """
        result = execute_query('insert', query, (user_id, campaign_id))
        
        # Check if insertion was successful
        if result is None:
            raise Exception("User is already part of this campaign")
            
        return True
    except Exception as e:
        print(f"Error adding user to campaign: {str(e)}")
        raise


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
        # Add payment_methods table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS payment_methods (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                payment_type VARCHAR(50) NOT NULL,
                card_number VARCHAR(255) NOT NULL,
                expiry_date VARCHAR(10) NOT NULL,
                card_holder_name VARCHAR(255) NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_campaigns (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                campaign_id INTEGER NOT NULL,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
        