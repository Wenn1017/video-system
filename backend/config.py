import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ApplicationConfig:
    JSONIFY_MIMETYPE = 'application/json'
    SECRET_KEY= os.environ['SECRET_KEY']  # Load secret key
    MONGO_URI = os.getenv("MONGO_URI")  # Load MongoDB URI
    JWT_SECRET_KEY = '123abc.'