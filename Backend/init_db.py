import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from support import initialize_db
import sys

load_dotenv()

def init_db():
    """Initialize PostgreSQL database with required tables"""
    conn, cur = connect_db()
    if not conn or not cur:
        raise Exception("Database connection failed")

    try:
        # Example table creation logic
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
