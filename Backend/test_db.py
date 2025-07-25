import psycopg2

try:
    conn = psycopg2.connect(
        dbname="griddx_db_29ft",
        user="griddx_db_29ft_user",
        password="5QHsYmYZl2e4bUiZVsa5QgerGlrkxVGm",
        host="dpg-d21ggdngi27c73dsuu6g-a.oregon-postgres.render.com",
        port=5432
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print("Connection failed:", e)