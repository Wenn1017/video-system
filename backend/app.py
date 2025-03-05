# app.py
from flask import Flask
from video_routes import video_routes
from transcription_routes import transcription_routes
from notes_routes import notes_routes

app = Flask(__name__)

# Register the blueprints
app.register_blueprint(video_routes)
app.register_blueprint(transcription_routes)
app.register_blueprint(notes_routes)

if __name__ == '__main__':
    app.run(debug=True)
