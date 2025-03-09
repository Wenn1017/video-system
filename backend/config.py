import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.getenv("SECRET_KEY")  # Load secret key
    MONGO_URI = os.getenv("MONGO_URI")  # Load MongoDB URI