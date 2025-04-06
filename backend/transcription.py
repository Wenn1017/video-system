from flask import request, jsonify
from flask_jwt_extended import decode_token
import database
import datetime

import cv2
import os
from datetime import timedelta

import speech_recognition as sr
from pydub import AudioSegment
from moviepy import VideoFileClip
import pytesseract
from langdetect import detect, DetectorFactory

# Ensure consistent language detection
DetectorFactory.seed = 0

# Detect language from text
def detect_language(text):
    """Detect language from given text"""
    try:
        detected_lang = detect(text)  # Detect language from text
        return detected_lang[:2]  # Return first two letters (e.g., 'en', 'es')
    except:
        return "unknown"  # If detection fails

### STEP 1: Extract Frames from Video ###
def extract_frames(video_path, interval=3):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_interval = fps * interval  # Capture a frame every 'interval' seconds

    frame_data = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Stop if no more frames are read

        if frame_count % frame_interval == 0:
            timestamp = str(timedelta(seconds=int(frame_count / fps)))  # Convert to timestamp
            frame_data.append({"timestamp": timestamp, "frame": frame})

        frame_count += 1

    cap.release()
    return frame_data

### STEP 2: Extract Audio from Video ###
def extract_audio(video_path):
    """Extract audio from video and save as .wav"""
    base_name = os.path.splitext(video_path)[0]  # Get filename without extension
    audio_path = f"{base_name}.wav"  # Save as .wav
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)
    return audio_path


### STEP 3: Transcribe Audio Using speech_recognition ###
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
    """Convert seconds to [hh:mm:ss] or [mm:ss] depending on value."""
    h, rem = divmod(int(seconds), 3600)
    m, s = divmod(rem, 60)

    if h > 0:
        return f"[{h:02}:{m:02}:{s:02}]"
    else:
        return f"[{m:02}:{s:02}]"

# Speech-to-text (STT)
def perform_stt(audio_path, video_duration):
    """Convert speech to text with timestamps using chunked audio and Google STT."""
    recognizer = sr.Recognizer()
    chunk_paths = split_audio(audio_path)
    full_transcription = []

    chunk_duration = 60  # Seconds (matches the 60000ms chunks)

    for idx, chunk_path in enumerate(chunk_paths):
        try:
            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                detected_lang = detect_language(text)
                
                if text.strip():
                    start_time = idx * chunk_duration
                    end_time = start_time + chunk_duration
                    full_transcription.append({
                        "start": start_time,
                        "end": end_time,
                        "text": text.strip(),
                        "language": detected_lang
                    })
                    
        except sr.UnknownValueError:
            print(f"[Chunk {idx}] Could not understand the audio.")
        except Exception as e:
            print(f"[Chunk {idx}] Error: {e}")
        finally:
            os.remove(chunk_path)

    if full_transcription:
        # Adjust the last end_time to match video duration
        full_transcription[-1]["end"] = int(video_duration)

    return full_transcription if full_transcription else [{"time": "[00:00]", "type": "STT", "text": "No speech detected."}]

### STEP 4: Match Frames with Transcriptions and extract text from frames###
def match_frames_with_text(frame_data, transcribed_segments):
    content_summary = []

    for segment in transcribed_segments:
        start_time = float(segment["start"])
        end_time = float(segment["end"])
        stt_text = segment["text"]
        language = segment["language"]

        # Get all frames within this segment
        matched_frames = []
        for frame in frame_data:
            timestamp_sec = timedelta_to_seconds(frame["timestamp"])

            if start_time <= timestamp_sec <= end_time:
                matched_frames.append(frame)

        # Extract OCR text from all matching frames
        ocr_results = set()
        for frame in matched_frames:
            ocr_text = extract_text_from_frame(frame, language)
            if ocr_text.strip() and ocr_text != "No text found in this frame.":
                ocr_results.add(ocr_text.strip())

        combined_ocr = " | ".join(ocr_results) if ocr_results else "No text found in this time range."

        content_summary.append({
            "time": f"{seconds_to_hms(start_time)} - {seconds_to_hms(end_time)}",
            "STT": stt_text,
            "OCR": combined_ocr
        })

    return content_summary


def extract_text_from_frame(closest_frame, language="eng"):
    """Extract text from a processed frame using OCR."""
    frame = closest_frame["frame"]
    if frame is None:
        print("Error: Frame is None!")
        return "No text found in this frame."
    
    # Resize the frame for better OCR performance
    frame_resized = cv2.resize(frame, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Convert the resized frame to grayscale
    gray_frame = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2GRAY)

    # Remove noise
    blurred = cv2.GaussianBlur(gray_frame, (5, 5), 0)

    # Apply adaptive threshold
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    _, threshold_frame = cv2.threshold(thresh, 150, 255, cv2.THRESH_BINARY)

    # Find contours in the thresholded image
    contours, _ = cv2.findContours(threshold_frame, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    lang_map = {
        "en": "eng",
        "es": "spa",
        "fr": "fra",
        "zh": "chi_sim",
        "ja": "jpn"
    }

    tess_lang = lang_map.get(language, "eng")
    custom_config = r'--oem 3 --psm 6'

    ocr_text = ""
    
    if contours:
        text = pytesseract.image_to_string(threshold_frame, lang=tess_lang, config=custom_config)
        if text.strip():  # Only add non-empty text
            ocr_text += text.strip() + " | "

    if ocr_text:
        return ocr_text.strip()  # Return the combined text from all contours
    else:
        return "No text found in this frame."

def timedelta_to_seconds(timestamp):
    """Convert timestamp like '00:01:05' to seconds"""
    parts = list(map(int, timestamp.split(":")))
    if len(parts) == 3:
        h, m, s = parts
        return h * 3600 + m * 60 + s
    elif len(parts) == 2:
        m, s = parts
        return m * 60 + s
    return int(parts[0])


### MAIN FUNCTION ###
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
    print("Extracting frames from video...")
    video_duration = VideoFileClip(video_path).duration
    frame_data = extract_frames(video_path)

    # Extract audio & transcribe
    print("Extracting audio from video...")
    audio_path = extract_audio(video_path)
    if not os.path.exists(audio_path):
        return {"error": "Audio extraction failed!"}

    print("Transcribing audio...")
    stt_text = perform_stt(audio_path, video_duration)

    print("Matching frames with transcriptions...")
    final_transcription = match_frames_with_text(frame_data, stt_text)

    print("Saving final summary to text file...")
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