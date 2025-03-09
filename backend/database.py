from pymongo import MongoClient

def database_connection():
    
    connection = "mongodb+srv://yiwen477:Wenwen477@cluster0.hk6qt.mongodb.net/"
    client = MongoClient(connection)
    db = client['project']  # Database name
    return db