import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from support import initialize_db
import sys
from flask import current_app

load_dotenv()

def get_db():
    """Get the database connection."""
    return current_app.config['db']

def init_db_tables():
    conn = get_db()
    with conn.cursor() as cur:
        # Drop existing table if --reset flag is used
        if '--reset' in sys.argv:
            cur.execute("DROP TABLE IF EXISTS users CASCADE")
            
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,  -- Ensure this is set to 255 to handle hashed passwords
                full_name VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Always attempt to alter the column to ensure the type is updated
        cur.execute("""
            ALTER TABLE users 
            ALTER COLUMN password_hash TYPE VARCHAR(255);  -- Explicitly set to 255
            ALTER COLUMN email TYPE CITEXT;  -- This is from your original script, kept for completeness
        """)
    conn.commit()

def init_db():
    """Initialize PostgreSQL database with required tables"""
    try:
        initialize_db()  # Use the existing function from support.py
        print("✅ PostgreSQL tables initialized successfully!")
    except Exception as e:
        print(f"🚨 Initialization failed: {e}")

if __name__ == '__main__':
    init_db()
