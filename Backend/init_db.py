import os
from dotenv import load_dotenv
from support import initialize_db
import sys

load_dotenv()

def init_db():
    """Initialize PostgreSQL database with required tables"""
    try:
        initialize_db()  # Use the existing function from support.py
        print("✅ PostgreSQL tables initialized successfully!")
    except Exception as e:
        print(f"🚨 Initialization failed: {e}")

if __name__ == '__main__':
    init_db()
