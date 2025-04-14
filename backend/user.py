from flask_jwt_extended import create_access_token
from pymongo import ASCENDING
import database as database

# Add user into the database
def add_user(user_data, bcrypt):
    try:
        # Create database connection and collection object
        db = database.database_connection()
        users = db["user"]

        # Check if the email already exists (email must be unique)
        existing_user = users.find_one({"email": user_data["email"]})

        if not existing_user:
            hashed_password = bcrypt.generate_password_hash(user_data["password"]).decode("utf-8")
            user_data["password"] = hashed_password
            users.insert_one(user_data)

            return {"success": "User registered successfully"}
        else:
            return {"error": "Email already exists!"}
    
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Get all users
def get_all_users():

    user_list = []

    try:
        # Create database connection and connection object
        db = database.database_connection()
        users = db["user"]

        # Search all employee and return the one result
        result = users.find().sort([("email", ASCENDING)])

        if result:
            for i in result:
                user_record = {
                    "email": i["email"],
                    "username": i["username"],
                }
                user_list.append(user_record)
        else:
            return {"info": "No users found."}
    
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}
    
    return user_list

# Retrieve a single user
def get_user(user_data):
    try:
        db = database.database_connection()
        users = db["user"]

        user_record = users.find_one({"email": user_data["email"]})

        if user_record:
            return {
                "email": user_record["email"],
                "username": user_record["username"],
            }
        else:
            return {"error": "User does not exist!"}
    
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Update user data
def update_user(user_data):
    try:
        db = database.database_connection()
        users = db["user"]

        existing_user = users.find_one({"email": user_data["email"]})

        if existing_user:
            update_query = {"$set": {"username": user_data["username"]}}
            result = users.update_one({"email": user_data["email"]}, update_query)

            if result.modified_count > 0:
                updated_user = users.find_one({"email": user_data["email"]})

                identity = {
                    "email": updated_user["email"],
                    "username": updated_user["username"],
                }
                access_token = create_access_token(identity=identity)

                return {"success": "User profile updated successfully", "token": access_token}
            else:
                return {"error": "Failed to update the user profile!"}
    
    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# Delete user
def delete_user(email):
    try:
        db = database.database_connection()
        users = db["user"]

        existing_user = users.find_one({"email": email})  # Find user first

        if existing_user:
            users.delete_one({"email": email})  # Now delete
            return {"success": f"User {existing_user['username']} deleted successfully"}
        else:
            return {"error": "User not found!"}

    except Exception as e:
        return {"warning": f"Exception error: {str(e)}"}

# User login (using email & password)
def login_user(user_login, bcrypt):
    try:
        db = database.database_connection()
        users = db["user"]

        user_record = users.find_one({"email": user_login["email"]})

        if user_record and bcrypt.check_password_hash(user_record["password"], user_login["password"]):
            identity = {
                "email": user_record["email"],
                "username": user_record["username"],
            }

            return {"success": f"Welcome back, {user_record['username']}!", "token": identity}
        else:
            return {"error": "Login failed! Incorrect email or password."}

    except KeyError:
        return {"error": "Invalid key in user_login"}
    except TypeError:
        return {"error": "Invalid data type in user_login"}
    except Exception as e:
        return {"error": str(e)}