import mysql.connector
from app.config import Config

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def init_db(app):
    pass
