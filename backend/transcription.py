import os
import cv2
import pytesseract
import speech_recognition as sr
from langdetect import detect, DetectorFactory
from pymongo import MongoClient
from pytube import YouTube
from moviepy.editor import VideoFileClip
import database  # Import database module

DetectorFactory.seed = 0  # Ensure consistent language detection

# Supported languages
SUPPORTED_LANGUAGES_STT = {"en": "English", "es": "Spanish", "fr": "French", "zh-CN": "Chinese", "ja": "Japanese"}
SUPPORTED_LANGUAGES_OCR = {"eng": "English", "spa": "Spanish", "fra": "French", "chi_sim": "Chinese (Simplified)", "jpn": "Japanese"}

# Detect language from text
def detect_language(text):
    """Detect language from given text"""
    try:
        detected_lang = detect(text)  # Detect language from text
        return detected_lang[:2]  # Return first two letters (e.g., 'en', 'es')
    except:
        return "unknown"  # If detection fails

# Download YouTube video
def download_youtube_video(url, upload_folder):
    """Download YouTube video and return file path."""
    yt = YouTube(url)
    stream = yt.streams.get_highest_resolution()
    video_path = os.path.join(upload_folder, "youtube_video.mp4")
    stream.download(filename=video_path)
    return video_path

# Extract audio from video
def extract_audio(video_path):
    """Extract audio from video and save as .wav"""
    audio_path = video_path.replace(".mp4", ".wav")
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)
    return audio_path

# Speech-to-text (STT) with automatic language detection
def perform_stt(audio_path, language=None):
    """Convert speech to text with optional auto language detection."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio = recognizer.record(source)

    try:
        if not language:  # Detect language automatically
            raw_text = recognizer.recognize_google(audio, language="en")  # Try English first
            language = detect_language(raw_text)
        
        if language not in SUPPORTED_LANGUAGES_STT:
            return f"Error: Unsupported language '{language}' detected."

        return recognizer.recognize_google(audio, language=language)
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError:
        return "Speech-to-Text service unavailable"

# Optical Character Recognition (OCR) with automatic language detection
def perform_ocr(video_path, language=None):
    """Extract text from video frames."""
    cap = cv2.VideoCapture(video_path)
    frame_count, extracted_text = 0, []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % 30 == 0:  # Process every 30th frame
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray)

            if text.strip():
                extracted_text.append(text.strip())

        frame_count += 1
    cap.release()

    final_text = "\n".join(extracted_text)

    # Detect language automatically if not provided
    if not language:
        language = detect_language(final_text)
    
    if language not in SUPPORTED_LANGUAGES_OCR:
        return f"Error: Unsupported language '{language}' detected."

    return final_text

# **Add these new functions below**
def process_video(file):
    """Process uploaded video, extract text, and save transcription."""
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    
    video_path = os.path.join(upload_folder, file.filename)
    file.save(video_path)

    # Extract audio & transcribe
    audio_path = extract_audio(video_path)
    stt_text = perform_stt(audio_path)

    # Extract text using OCR
    ocr_text = perform_ocr(video_path)

    # Combine results
    final_transcription = f"Speech-to-Text:\n{stt_text}\n\nOCR:\n{ocr_text}"
    
    # Save to MongoDB
    add_transcription(file.filename, final_transcription)

    return {"filename": file.filename, "transcription_text": final_transcription}

def process_youtube_video(url):
    """Download YouTube video, extract text, and save transcription."""
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    
    video_path = download_youtube_video(url, upload_folder)

    # Extract audio & transcribe
    audio_path = extract_audio(video_path)
    stt_text = perform_stt(audio_path)

    # Extract text using OCR
    ocr_text = perform_ocr(video_path)

    # Combine results
    final_transcription = f"Speech-to-Text:\n{stt_text}\n\nOCR:\n{ocr_text}"
    
    # Save to MongoDB
    add_transcription("youtube_video.mp4", final_transcription)

    return {"filename": "youtube_video.mp4", "transcription_text": final_transcription}

# Save transcription to MongoDB
def add_transcription(filename, transcription_text):
    """Save transcription into MongoDB."""
    db = database.database_connection()
    transcriptions = db["transcriptions"]
    transcription_data = {
        "filename": filename,
        "transcription_text": transcription_text
    }
    transcriptions.insert_one(transcription_data)
    return {"success": "Transcription saved successfully"}

# Retrieve all transcriptions
def get_all_transcriptions():
    """Retrieve all transcriptions from MongoDB."""
    db = database.database_connection()
    transcriptions = db["transcriptions"]
    return list(transcriptions.find({}, {"_id": 0}))

# Retrieve a transcription by filename
def get_transcription_by_filename(filename):
    """Retrieve a single transcription by filename."""
    db = database.database_connection()
    transcriptions = db["transcriptions"]
    result = transcriptions.find_one({"filename": filename}, {"_id": 0})
    return result if result else {"error": "Transcription not found!"}

# Update transcription data
def update_transcription(filename, new_transcription_text):
    """Update transcription text in MongoDB."""
    db = database.database_connection()
    transcriptions = db["transcriptions"]
    update_query = {"$set": {"transcription_text": new_transcription_text}}
    result = transcriptions.update_one({"filename": filename}, update_query)
    return {"success": "Transcription updated successfully"} if result.modified_count > 0 else {"error": "Update failed!"}

# Delete transcription by filename
def delete_transcription(filename):
    """Delete a transcription from MongoDB."""
    db = database.database_connection()
    transcriptions = db["transcriptions"]
    result = transcriptions.delete_one({"filename": filename})
    return {"success": f"Transcription {filename} deleted"} if result.deleted_count > 0 else {"error": "Deletion failed!"}