import psycopg2
import os

# Database credentials (replace with your actual credentials or environment variables)
DB_HOST = "dpg-d22bjj3e5dus739fk9gg-a.oregon-postgres.render.com"
DB_NAME = "griddb"
DB_USER = "griddb"
DB_PASSWORD = "GycGE7M140H9RbUj5skLbOAS9kD8o8qf"
DB_PORT = "5432"

def check_db_connection():
    conn = None
    try:
        print("Attempting to connect to the database...")
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            sslmode='require' # Ensure SSL is required
        )
        print("✅ Database connection successful!")
        # Optional: Print database version
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            db_version = cur.fetchone()[0]
            print(f"PostgreSQL version: {db_version}")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    check_db_connection() 