import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from db_utils import connect_db, execute_query  # Import shared utilities

load_dotenv()

def initialize_db():
    """Initialize PostgreSQL database with required tables"""
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        # Example table creation logic
        cur.execute("""
        CREATE TABLE IF NOT EXISTS example_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )
        """)
        conn.commit()
        print("✅ PostgreSQL tables initialized successfully!")
    except Exception as e:
        conn.rollback()
        print(f"🚨 Initialization failed: {e}")
        raise
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == '__main__':
    initialize_db()
