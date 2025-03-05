from flask import Blueprint, request, jsonify
from db import database_connection

video_routes = Blueprint('video_routes', __name__)

db = database_connection()
videos_collection = db['videos']

# 🔹 CREATE (Upload Video)
@video_routes.route('/upload_video', methods=['POST'])
def upload_video():
    try:
        video_data = request.json
        required_fields = ["title", "description", "url", "uploaded_by"]
        
        if not all(field in video_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        inserted_id = videos_collection.insert_one(video_data).inserted_id
        return jsonify({"message": "Video uploaded successfully", "id": str(inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 READ (Get Video by ID)
@video_routes.route('/video/<video_id>', methods=['GET'])
def get_video(video_id):
    video = videos_collection.find_one({"_id": video_id})
    if video:
        return jsonify(video), 200
    return jsonify({"error": "Video not found"}), 404

# 🔹 UPDATE (Update Video Details)
@video_routes.route('/update_video/<video_id>', methods=['PUT'])
def update_video(video_id):
    update_data = request.json
    videos_collection.update_one({"_id": video_id}, {"$set": update_data})
    return jsonify({"message": "Video updated successfully"}), 200

# 🔹 DELETE (Remove Video)
@video_routes.route('/delete_video/<video_id>', methods=['DELETE'])
def delete_video(video_id):
    videos_collection.delete_one({"_id": video_id})
    return jsonify({"message": "Video deleted successfully"}), 200