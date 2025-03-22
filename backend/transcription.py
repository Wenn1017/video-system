from PIL import Image
import os
import cv2
import pytesseract

import speech_recognition as sr
from langdetect import detect, DetectorFactory
from pymongo import MongoClient
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

# Speech-to-text (STT)
def perform_stt(audio_path, language=None):
    """Convert speech to text"""
    recognizer = sr.Recognizer()
    chunk_paths = split_audio(audio_path)
    full_transcription = ""

    for chunk_path in chunk_paths:
        try:
            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                if text.strip():  # Check if text is not empty
                    full_transcription += text + " "
                    print(text)
        except sr.UnknownValueError:
            print("Speech recognition could not understand the audio.")
        except Exception as e:
            print(f"Error transcribing {chunk_path}: {e}")
        finally:
            os.remove(chunk_path)

    return full_transcription if full_transcription.strip() else "No speech detected."

    # try:
    #     if not language:  # Detect language automatically
    #         raw_text = recognizer.recognize_google(audio, language="en")  # Try English first
    #         language = detect_language(raw_text)
        
    #     if language not in SUPPORTED_LANGUAGES_STT:
    #         return f"Error: Unsupported language '{language}' detected."

    #     return recognizer.recognize_google(audio, language=language)
    # except sr.UnknownValueError:
    #     return "Could not understand audio"
    # except sr.RequestError:
    #     return "Speech-to-Text service unavailable"

# Optical Character Recognition (OCR) with automatic language detection
def perform_ocr(video_path, language=None):
    """Extract text from video frames."""
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    extracted_text = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % 100 == 0:  # Process every 100th frame
            print(f'Extracting frame {frame_count}')

            # Convert frame (NumPy array) to PIL Image
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            # Perform OCR on the image
            text = pytesseract.image_to_string(img, lang=language)

            if text.strip():
                extracted_text.append(text.strip())

        frame_count += 1
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    final_text = "\n".join(extracted_text)
    print(final_text)
    return final_text if final_text.strip() else "No text detected."

# **Add these new functions below**
def process_video(file):
    """Process uploaded video, extract text, and save transcription."""
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

    # Structure the transcription data
    transcript_entries = []
    
    # Convert STT text into structured format
    if stt_text:
        for i, text in enumerate(stt_text.split('. ')):  # Assuming sentences are split by ". "
            transcript_entries.append({
                "time": f"{i*5}:00",  # Placeholder time (adjust based on actual timestamps)
                "type": "STT",
                "text": text.strip()
            })

    # Convert OCR text into structured format
    if ocr_text:
        for i, text in enumerate(ocr_text.split('\n')):  # Assuming OCR lines are separated by newlines
            transcript_entries.append({
                "time": f"{i*10}:00",  # Placeholder time (adjust based on actual timestamps)
                "type": "OCR",
                "text": text.strip()
            })

    # Save to MongoDB
    response = add_transcription(file.filename, transcript_entries)

    return {"filename": file.filename, "transcription": transcript_entries, "db_status": response}

    # # Combine results
    # final_transcription = f"Speech-to-Text:\n{stt_text}\n\nOCR:\n{ocr_text}"
    
    # # Save to MongoDB
    # response = add_transcription(file.filename, final_transcription)
    
    # return {"filename": file.filename, "transcription_text": final_transcription, "db_status": response}

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
    return list(transcriptions.find({}, {"_id": 0})) if transcriptions else []

# Retrieve a transcription by filename
@app.route('/get_transcription_by_filename', methods=['GET'])
def get_transcription_by_filename():
    filename = request.args.get('filename')
    transcription = db.transcriptions.find_one({"filename": filename})

    if not transcription:
        return jsonify({"error": "Transcription not found!"}), 404

    return jsonify({
        "filename": transcription["filename"],
        "transcription_text": transcription["transcription_text"]
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