import psycopg2
from psycopg2 import OperationalError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# New hardcoded database credentials
DB_HOST = 'dpg-d1vjt13e5dus739rq030-a.oregon-postgres.render.com'
DB_NAME = 'nathi_db_ricx'
DB_USER = 'nathi_db'
DB_PASSWORD = 'QNzk4QVE3MgSvkrTTqOhAAddKyRgZiV6'
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


        try:
            execute_query('alter', query)
            print("Top-up table created successfully.")
        except Exception as e:
            print(f"🚨 Failed to create top-up table: {str(e)}")
