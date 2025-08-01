import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from support import initialize_db
import sys
from flask import current_app

load_dotenv()

if __name__ == '__main__':
    initialize_db()
