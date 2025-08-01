import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# New hardcoded database credentials
DB_HOST = 'dpg-d22bjj3e5dus739fk9gg-a.oregon-postgres.render.com'
DB_NAME = 'griddb'
DB_USER = 'griddb'
DB_PASSWORD = 'GycGE7M140H9RbUj5skLbOAS9kD8o8qf'
DB_PORT = '5432'

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            sslmode='require' # Ensure SSL is required
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

# Backend/db_utils.py

def create_topup_table():
    # Logic to create the topup table
    print("Topup table created!")  # Example implementation
