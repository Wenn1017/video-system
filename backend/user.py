from flask import request
from pymongo import ASCENDING
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, decode_token
from werkzeug.security import generate_password_hash, check_password_hash
import database as database

# Function to register a new user
def register_user():
    try:
        user_data = request.json
        required_fields = ["username", "email", "password"]

        # Check if required fields are provided
        if not all(field in user_data for field in required_fields):
            return {"error": "Missing required fields"}

        # Check if user already exists
        db = database.database_connection()
        users = db["users"]
        existing_user = users.find_one({"email": user_data["email"]})
        if existing_user:
            return {"error": "Email already registered"}

        # Hash password before storing
        hashed_password = generate_password_hash(user_data["password"])
        user_data["password"] = hashed_password

        # Insert into database
        inserted_id = users.insert_one(user_data).inserted_id
        return {"success": "User registered successfully", "id": str(inserted_id)}

    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}
    
# Function to add a new user to the database
def add_user(user, bcrypt):
    try:
        # Create database connection and connection object
        db = database.database_connection()
        users = db["users"]
        
        # Check if the user already exists in the database
        existing_user = users.find_one({"email": user['email']})
        
        if existing_user:
            return {"error": "User already exists."}
        
        # Hash the password for security purposes
        hashed_password = bcrypt.generate_password_hash(user["password"]).decode('utf-8')
        user["password"] = hashed_password
        
        # Insert new user into the database
        users.insert_one(user)
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}
    
    return {"success": "User added successfully"}

# Function to retrieve all users from the database
def get_all_users():
    user_list = []
    try:
        # Create database connection and connection object
        db = database.database_connection()
        # Retrieve and sort users by email
        users = db["users"].find().sort("email", ASCENDING)
        
        # Extract relevant user information
        for u in users:
            user_list.append({
                "username": u["username"],
                "email": u["email"]
            })
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}
    
    return user_list

# Function to retrieve a specific user based on email
def get_user(email):
    try:
        db = database.database_connection()
        user = db["users"].find_one({"email": email})
        
        if user:
            return {
                "username": user["username"],
                "email": user["email"],
            }
        else:
            return {"error": "User not found"}
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Function to update a user's information
def update_user(user):
    try:
        db = database.database_connection()
        users = db["users"]
        
        # Define query and update parameters
        filter_query = {"email": user['email']}
        update_query = {"$set": {"username": user['username']}}
        
        result = users.update_one(filter_query, update_query)
        
        if result.modified_count > 0:
            return {"success": "User profile updated successfully"}
        else:
            return {"error": "No changes made or user not found"}
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Function to delete a user from the database
def delete_user(email):
    try:
        db = database.database_connection()
        users = db["users"]
        
        # Attempt to delete the user
        result = users.delete_one({"email": email})
        
        if result.deleted_count > 0:
            return {"success": "User deleted successfully"}
        else:
            return {"error": "User not found"}
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Function to handle user login and authentication
def login_user(login_data, bcrypt):
    try:
        db = database.database_connection()
        users = db["users"]
        
        # Check if the provided email exists in the database
        user = users.find_one({"email": login_data['email']})
        
        # Verify password and generate JWT token if successful
        if user and bcrypt.check_password_hash(user['password'], login_data['password']):
            identity = {
                'username': user['username'],
                'email': user['email']
            }
            token = create_access_token(identity=identity)
            return {"success": f"Welcome back, {user['username']}!", "token": token}
        else:
            return {"error": "Invalid email or password"}
    except Exception as e:
        return {"error": f"Exception error: {str(e)}"}