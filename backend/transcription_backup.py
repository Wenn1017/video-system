from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import os
import cv2
import pytesseract

import speech_recognition as sr
from langdetect import detect, DetectorFactory
from flask import Flask, request, jsonify
from flask_jwt_extended import decode_token

from moviepy import VideoFileClip
import database  # Import database module
from pydub import AudioSegment
import datetime

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

# Extract audio from video
def extract_audio(video_path):
    """Extract audio from video and save as .wav"""
    base_name = os.path.splitext(video_path)[0]  # Get filename without extension
    audio_path = f"{base_name}.wav"  # Save as .wav
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)
    return audio_path

def split_audio(file_path, chunk_length_ms=60000):
    """Split an audio file into smaller chunks."""
    audio = AudioSegment.from_file(file_path)
    chunks = [audio[i:i + chunk_length_ms] for i in range(0, len(audio), chunk_length_ms)]
    chunk_paths = []

    for idx, chunk in enumerate(chunks):
        chunk_path = f"{file_path}_chunk_{idx}.wav"
        chunk.export(chunk_path, format="wav")
        chunk_paths.append(chunk_path)

    return chunk_paths

def seconds_to_hms(seconds):
    """Convert seconds to hh:mm:ss format."""
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h:02}:{m:02}:{s:02}" if h > 0 else f"{m:02}:{s:02}"

# Speech-to-text (STT)
def perform_stt(audio_path):
    """Convert speech to text with timestamps."""
    recognizer = sr.Recognizer()
    chunk_paths = split_audio(audio_path)  # Assuming split_audio() returns chunk file paths
    full_transcription = []

    chunk_duration = 60  # Assuming each chunk is 60 seconds long

    for idx, chunk_path in enumerate(chunk_paths):
        try:
            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                detected_lang = detect_language(text)  # Function to detect language
                
                if text.strip():
                    start_time = idx * chunk_duration  # Calculate start time in seconds
                    timestamp = seconds_to_hms(start_time)  # Convert to hh:mm:ss format
                    full_transcription.append({
                        "time": timestamp,
                        "type": "STT",
                        "text": text.strip(),
                        "language": detected_lang
                    })
                    print(f"[{timestamp}] {text} ({detected_lang})")
        except sr.UnknownValueError:
            print("Speech recognition could not understand the audio.")
        except Exception as e:
            print(f"Error transcribing {chunk_path}: {e}")
        finally:
            os.remove(chunk_path)  # Cleanup temp files

    return full_transcription if full_transcription else [{"time": "00:00", "type": "STT", "text": "No speech detected."}]

# Optical Character Recognition (OCR) with automatic language detection
def preprocess_image(frame):
    """Preprocess frame to enhance text detection."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)  # Remove noise
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)  # Adaptive threshold
    return thresh

def extract_text_from_frame(frame, language="eng"):
    """Extract text from a processed frame using OCR."""
    contours, _ = cv2.findContours(frame, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    extracted_text = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)

        # Ignore small noise regions
        if w > 20 and h > 10:
            roi = frame[y:y+h, x:x+w]  # Crop text region
            img = Image.fromarray(roi)  # Convert to PIL Image

            # OCR config: Extract only alphanumeric characters
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"'
            text = pytesseract.image_to_string(img, config=custom_config, lang=language)

            if text.strip():
                extracted_text.append(text.strip())

    return "\n".join(extracted_text)

def perform_ocr(video_path, language="eng"):
    """Extract text from video frames with timestamps using multi-threading."""
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    frames_to_process = []
    timestamps = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % 150 == 0:  # Process every 150th frame
            print(f'Extracting text from frame {frame_count}')
            processed_frame = preprocess_image(frame)
            frames_to_process.append(processed_frame)

            # Calculate timestamp (MM:SS)
            timestamp = f"{(frame_count // 30) // 60}:{(frame_count // 30) % 60}"
            timestamps.append(timestamp)
            print(f'Timestamp {timestamp}')

        frame_count += 1

    cap.release()

    # Use multi-threading for faster OCR processing
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(lambda f: extract_text_from_frame(f, language), frames_to_process))

    # Format the extracted text with timestamps
    extracted_texts = [
        {"time": timestamps[i], "type": "OCR", "text": text.strip()}
        for i, text in enumerate(results) if text.strip()
    ]

    return extracted_texts if extracted_texts else [{"time": "0:00", "type": "OCR", "text": "No text detected."}]

# Merge the OCR and STT result in the same timestamp
def merge_transcriptions(stt_transcription, ocr_transcription):
    """Merge STT and OCR results by timestamp."""
    merged_transcriptions = {}

    # Add STT transcriptions
    for entry in stt_transcription:
        time = entry["time"]
        if time not in merged_transcriptions:
            merged_transcriptions[time] = {"STT": [], "OCR": []}
        merged_transcriptions[time]["STT"].append(entry["text"])

    # Add OCR transcriptions
    for entry in ocr_transcription:
        time = entry["time"]
        if time not in merged_transcriptions:
            merged_transcriptions[time] = {"STT": [], "OCR": []}
        merged_transcriptions[time]["OCR"].append(entry["text"])

    # Format final transcript list
    final_transcript = []
    for time in sorted(merged_transcriptions.keys()):
        final_transcript.append({
            "time": time,
            "STT": " ".join(merged_transcriptions[time]["STT"]) if merged_transcriptions[time]["STT"] else "No speech detected.",
            "OCR": " ".join(merged_transcriptions[time]["OCR"]) if merged_transcriptions[time]["OCR"] else "No text detected."
        })

    return final_transcript

# **Add these new functions below**
def process_video(file):
    """Process uploaded video, extract text, and save structured transcription."""
    if not file:
        return {"error": "No file uploaded."}

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)
    
    video_path = os.path.join(upload_folder, file.filename)
    file.save(video_path)

    if not os.path.exists(video_path):
        return {"error": "File could not be saved!"}

    print(f"Processing video: {video_path}")

    # Extract audio & transcribe
    audio_path = extract_audio(video_path)
    if not os.path.exists(audio_path):
        return {"error": "Audio extraction failed!"}

    stt_text = perform_stt(audio_path)
    ocr_text = perform_ocr(video_path)
    print("testttttttttttttttttttttting")
    print(ocr_text)

    # Merge OCR and STT with timestamps
    final_transcription = merge_transcriptions(stt_text)

    # Save to MongoDB
    response = add_transcription(file.filename, final_transcription)

    return {"filename": file.filename, "transcription": final_transcription, "db_status": response}

# Save transcription to MongoDB
def add_transcription(filename, transcription_text):
    """Save transcription into MongoDB."""
    try:
        db = database.database_connection()
        if db is None:
            raise Exception("Database connection failed!")

        transcriptions = db["transcriptions"]
        transcription_data = {

            "filename": filename,
            "transcription_text": transcription_text,
            "created_at": datetime.datetime.utcnow()  # Add timestamp
        }

        transcriptions.insert_one(transcription_data)
        print(f"Saved transcription for {filename}")
        return {"success": "Transcription saved successfully"}
    except Exception as e:
        print(f"Error saving transcription: {e}")
        return {"error": f"Database error: {e}"}


# Retrieve all transcriptions
def get_all_transcriptions():
    """Retrieve all transcriptions from MongoDB."""
    db = database.database_connection()
    if db is None:
        return {"error": "Database connection failed"}
    
    transcriptions = db["transcriptions"]
    if transcriptions is None:
        return []
    
    result = []

    for doc in transcriptions.find():
        doc["_id"] = str(doc["_id"])
        result.append(doc)

    return result

# Retrieve a transcription by filename
def get_transcription_by_filename():
    filename = request.args.get('filename')
    
    if not filename:
        return jsonify({"error": "Filename parameter is required"}), 400

    db = database.database_connection()  # Ensure this returns a valid MongoDB connection
    transcriptions_collection = db["transcriptions"]
    
    transcription = transcriptions_collection.find_one({"filename": filename})

    if not transcription:
        return jsonify({"error": "Transcription not found!"}), 404

    return jsonify({
        "filename": transcription["filename"],
        "transcription_text": transcription.get("transcription_text", "No transcription available")
    })

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