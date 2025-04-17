from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_jwt_extended import JWTManager
import user
import transcription
import summary
from translation import translate_text
from flask_cors import cross_origin
from cryptography.fernet import Fernet
import jwt as pyjwt

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

api = Api(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Generate a key 
CRYPT = 'djhdsa'

# _________________________ USER LOG IN & SIGN UP API ___________________________
class api_user(Resource):
    # Register a new user
    def post(self):
        user_data = request.get_json()
        return jsonify(user.add_user(user_data, bcrypt))
    
    # Retrieve all users
    def get(self):
        return jsonify(user.get_all_users())
    
    # Update user details
    def put(self):
        user_data = request.get_json()
        return jsonify(user.update_user(user_data))
    
    # Delete a user
    def delete(self):
        user_data = request.get_json()
        return jsonify(user.delete_user(user_data["email"]))

# Retrieve a single user by email
class api_get_user(Resource):
    def post(self):
        user_data = request.get_json()
        return jsonify(user.get_user(user_data))

# User login and authentication
class api_login(Resource):
    def post(self):
        user_data = request.get_json()
        response = user.login_user(user_data, bcrypt)
        if 'token' in response and response['token']:
            token = pyjwt.encode(response['token'], CRYPT, algorithm="HS256")
            response['token'] = token
        return jsonify(response)

# _________________________ TRANSCRIPTION API ___________________________

class UploadVideo(Resource):
    def post(self):
        """Upload video and process transcription."""
        encrypted_token = request.form.get("token") or request.json.get("token")
        email = ''
        if encrypted_token:
            try:
                decrypted = pyjwt.decode(encrypted_token, CRYPT, algorithms=["HS256"])
                email = decrypted['email']
            except pyjwt.ExpiredSignatureError:
                return {"error": "Token expired"}
            except pyjwt.InvalidTokenError:
                return {"error": "Invalid token"}
        
        if "file" in request.files:
            file = request.files["file"]
            transcript = transcription.process_video(file, email)
            return jsonify({'combined_transcription': transcript})

        elif "url" in request.form:
            url = request.form["url"]
            transcript = transcription.process_youtube_video(url)
            return jsonify({'combined_transcription': transcript})
        
        return jsonify({"error": "No video file or URL provided"}), 400

class GetAllTranscriptions(Resource):
    def post(self):
        """Retrieve all stored transcriptions."""
        data = request.get_json()
        token = data.get("token")
        if not token:
            return jsonify({"error": "No token provided"}), 400
        
        try:
            decrypted = pyjwt.decode(token, CRYPT, algorithms=["HS256"])
            email = decrypted['email']

            if not email:
                return jsonify({"error": "Email not found in token"}), 400

            transcriptions = transcription.get_all_transcriptions(email)
            return jsonify(transcriptions)

        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401
    
class GetTranscription(Resource):
    def get(self):
        filename = request.args.get("filename")
        if not filename:
            return jsonify({"error": "Filename is required"}), 400
        return jsonify(transcription.get_transcription_by_filename(filename))

class UpdateTranscription(Resource):
    def put(self):
        """Update an existing transcription."""
        data = request.get_json()
        filename = data.get("filename")
        new_text = data.get("transcription_text")
        if not filename or not new_text:
            return jsonify({"error": "Filename and new text are required"}), 400
        return jsonify(transcription.update_transcription(filename, new_text))

class DeleteTranscription(Resource):
    def delete(self):
        """Delete a transcription from MongoDB using the ID from the request body."""
        data = request.get_json()
        _id = data.get('id')

        if not _id:
            return jsonify({"error": "ID is required"}), 400

        # Now perform the deletion
        return jsonify(transcription.delete_transcription(_id))

# _________________________ NLP API ___________________________ 
class Summary(Resource):
    @cross_origin(origin='http://localhost:3000')
    def post(self):
        data = request.json

        # Extract and combine 'STT' fields into one passage
        transcript_list = data.get("transcript", [])
        if not transcript_list:
            return jsonify({"error": "No transcript data provided"}), 400

        full_text = " ".join([item.get("STT", "") for item in transcript_list])
        print(full_text)

        result = summary.generate_summary_and_keywords(full_text)
        return jsonify(result)

# _________________________ TRANSLATION API ___________________________
app.add_url_rule("/translate", view_func=translate_text, methods=["POST"])

# _________________________ REGISTER API ENDPOINTS ___________________________
api.add_resource(api_user, '/user')                       # Create, Update, Delete User
api.add_resource(api_get_user, '/get_user')               # Get a single user
api.add_resource(api_login, '/login')                     # Login

api.add_resource(UploadVideo, "/upload_video")

api.add_resource(GetAllTranscriptions, "/get_all_transcriptions")
api.add_resource(DeleteTranscription, "/delete_transcription")

api.add_resource(GetTranscription, "/get_transcription_by_filename")
api.add_resource(UpdateTranscription, "/update_transcription")

api.add_resource(Summary, "/get_summary")   

if __name__ == '__main__':
    app.run(debug=True)
