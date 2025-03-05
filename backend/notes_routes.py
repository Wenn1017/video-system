# notes_routes.py
from flask import Blueprint, request, jsonify
from db import database_connection

notes_routes = Blueprint('notes_routes', __name__)

db = database_connection()
notes_collection = db['notes']

# CRUD for notes
@notes_routes.route('/notes', methods=['POST'])
def create_notes():
    try:
        notes_data = request.json
        inserted_id = notes_collection.insert_one(notes_data).inserted_id
        return jsonify({"message": "Notes created successfully", "id": str(inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
