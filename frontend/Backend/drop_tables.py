from support import connect_db

def drop_tables():
    conn, cur = connect_db()
    try:
        cur.execute("DROP TABLE IF EXISTS payments, solar_contracts, solar_systems, users CASCADE")
        conn.commit()
        print("✅ Tables dropped successfully")
    except Exception as e:
        print(f"🚨 Error dropping tables: {e}")
        conn.rollback()
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == "__main__":
    drop_tables()
