from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import database
import user  # Your module for user login/signup
import backend.transcription as transcription

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

# _________________________ USER LOG IN & SIGN UP API ___________________________
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

# _________________________ TRANSCRIPTION API ___________________________

class UploadVideo(Resource):
    @jwt_required()
    def post(self):
        """Upload video and process transcription."""
        if "file" in request.files:
            file = request.files["file"]
            return jsonify(transcription.process_video(file))
        elif "url" in request.form:
            url = request.form["url"]
            return jsonify(transcription.process_youtube_video(url))
        return jsonify({"error": "No video file or URL provided"}), 400

class GetTranscription(Resource):
    @jwt_required()
    def get(self):
        """Retrieve a transcription from MongoDB by filename."""
        filename = request.args.get("filename")
        if not filename:
            return jsonify({"error": "Filename is required"}), 400
        return jsonify(transcription.get_transcription_by_filename(filename))

class GetAllTranscriptions(Resource):
    @jwt_required()
    def get(self):
        """Retrieve all stored transcriptions."""
        return jsonify(transcription.get_all_transcriptions())

class UpdateTranscription(Resource):
    @jwt_required()
    def put(self):
        """Update an existing transcription."""
        data = request.get_json()
        filename = data.get("filename")
        new_text = data.get("transcription_text")
        if not filename or not new_text:
            return jsonify({"error": "Filename and new text are required"}), 400
        return jsonify(transcription.update_transcription(filename, new_text))

class DeleteTranscription(Resource):
    @jwt_required()
    def delete(self):
        """Delete a transcription from MongoDB."""
        data = request.get_json()
        filename = data.get("filename")
        if not filename:
            return jsonify({"error": "Filename is required"}), 400
        return jsonify(transcription.delete_transcription(filename))

# _________________________ REGISTER API ENDPOINTS ___________________________
api.add_resource(api_user, '/user')                       # Create, Update, Delete User
api.add_resource(api_get_user, '/get_user')               # Get a single user
api.add_resource(api_login, '/login')                     # Login

api.add_resource(UploadVideo, "/upload_video")
api.add_resource(GetTranscription, "/get_transcription")
api.add_resource(GetAllTranscriptions, "/get_all_transcriptions")
api.add_resource(UpdateTranscription, "/update_transcription")
api.add_resource(DeleteTranscription, "/delete_transcription")

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
