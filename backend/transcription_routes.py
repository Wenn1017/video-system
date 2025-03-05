# transcription_routes.py
from flask import Blueprint, request, jsonify
from db import database_connection

transcription_routes = Blueprint('transcription_routes', __name__)

db = database_connection()
transcriptions_collection = db['transcriptions']

# CRUD for transcriptions
@transcription_routes.route('/transcription', methods=['POST'])
def create_transcription():
    try:
        transcription_data = request.json
        inserted_id = transcriptions_collection.insert_one(transcription_data).inserted_id
        return jsonify({"message": "Transcription created successfully", "id": str(inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
