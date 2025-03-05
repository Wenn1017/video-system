from pymongo import MongoClient

def database_connection():
    try:
        connection = "mongodb+srv://yiwen477:Wenwen477@cluster0.hk6qt.mongodb.net/"
        client = MongoClient(connection)
        db = client['overall']  # Database name

        # Create a 'users' collection if it doesn't exist by inserting a dummy document
        users = db["users"]
        if users.count_documents({}) == 0:
            users.insert_one({"check": "database created"})  # Insert a dummy record

        print("Database connected successfully!")
        return db
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

# Test connection
database_connection()