from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import database
import user  # Your module for user login/signup
# import video_processing  # Your module for video analysis

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

api = Api(app)
CORS(app)

# # _________________________ USER AUTHENTICATION API ___________________________

# class UserSignup(Resource):
#     def post(self):
#         data = request.get_json()
#         return jsonify(user.signup(data, bcrypt))

# class UserLogin(Resource):
#     def post(self):
#         data = request.get_json()
#         return jsonify(user.login(data, bcrypt))

# class GetUserDetails(Resource):
#     @jwt_required()
#     def get(self):
#         current_user = get_jwt_identity()
#         return jsonify({"email": current_user})

# Resource class to handle user-related operations
class api_user(Resource):
    # Register a new user
    def post(self):
        user_data = request.get_json()
        return jsonify(user.add_user(user_data, bcrypt))
    
    # Retrieve all users
    @jwt_required()
    def get(self):
        return jsonify(user.get_all_users())
    
    # Update user details
    @jwt_required()
    def put(self):
        user_data = request.get_json()
        return jsonify(user.update_user(user_data))
    
    # Delete a user
    @jwt_required()
    def delete(self):
        user_data = request.get_json()
        return jsonify(user.delete_user(user_data["email"]))

# Retrieve a single user by email
class api_get_user(Resource):
    @jwt_required()
    def post(self):
        user_data = request.get_json()
        return jsonify(user.get_user(user_data))

# User login and authentication
class api_login(Resource):
    def post(self):
        user_data = request.get_json()
        return jsonify(user.login_user(user_data, bcrypt))

# # _________________________ VIDEO PROCESSING API ___________________________

# class UploadVideo(Resource):
#     @jwt_required()
#     def post(self):
#         if 'video' not in request.files:
#             return jsonify({"error": "No video file uploaded"})
        
#         video = request.files['video']
#         return jsonify(video_processing.process_video(video))

# class GetVideoTranscript(Resource):
#     @jwt_required()
#     def get(self):
#         video_id = request.args.get("video_id")
#         if not video_id:
#             return jsonify({"error": "Missing video ID"})
        
#         return jsonify(video_processing.get_transcript(video_id))

# class GetVideoSummary(Resource):
#     @jwt_required()
#     def get(self):
#         video_id = request.args.get("video_id")
#         if not video_id:
#             return jsonify({"error": "Missing video ID"})
        
#         return jsonify(video_processing.get_summary(video_id))


# _________________________ REGISTER API ENDPOINTS ___________________________

# api.add_resource(api_signup, '/signup')   # User Signup
# api.add_resource(api_login, '/login')     # User Login
# api.add_resource(api_user, '/user')                    # Get user details
# api.add_resource(UploadVideo, '/upload_video')               # Upload video for processing
# api.add_resource(GetVideoTranscript, '/get_transcript')      # Retrieve transcript of a video
# api.add_resource(GetVideoSummary, '/get_summary')            # Get summarized notes from a video
api.add_resource(api_user, '/user')                       # Create, Update, Delete User
api.add_resource(api_get_user, '/get_user')               # Get a single user
api.add_resource(api_login, '/login')                     # Login

if __name__ == '__main__':
    app.run(debug=True)


# # app.py
# from flask import Flask
# from video_routes import video_routes
# from transcription_routes import transcription_routes
# from notes_routes import notes_routes

# app = Flask(__name__)

# # Register the blueprints
# app.register_blueprint(video_routes)
# app.register_blueprint(transcription_routes)
# app.register_blueprint(notes_routes)

# if __name__ == '__main__':
#     app.run(debug=True)
