import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from support import connect_db
import sys

load_dotenv()

def init_db():
    conn, cur = connect_db()
    if conn is None:
        print("Failed to connect to the database in init_db.")
        return False

    try:
        # Create users table
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
        print("Table 'users' ensured.")

        # Add the 'onboarded' column if it doesn't exist
        # This is a safe way to add a column without dropping the table
        try:
            cur.execute("ALTER TABLE users ADD COLUMN onboarded BOOLEAN DEFAULT FALSE;")
            print("Column 'onboarded' added to 'users' table.")
        except psycopg2.errors.DuplicateColumn:
            conn.rollback() # Rollback the failed transaction if column already exists
            print("Column 'onboarded' already exists in 'users' table.")
        except Exception as e:
            conn.rollback()
            print(f"Error adding 'onboarded' column: {e}")
            raise

        # Create transactions table
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
        print("Table 'transactions' ensured.")

        conn.commit()
        print("Database initialization successful.")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Database initialization failed: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    if init_db():
        print("Database setup complete.")
    else:
        print("Database setup failed.")
