from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route("/translate", methods=["POST"])
def translate_text():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debugging print statement

        original_text = data.get("text", "").strip()
        src_lang = data.get("source_language", "auto")  # Auto-detect if not provided
        target_lang = data.get("target_language", "zh-CN")  # Default to Simplified Chinese

        if not original_text:
            return jsonify({"error": "No text provided"}), 400

        translator = GoogleTranslator(source=src_lang, target=target_lang)
        translated_text = translator.translate(original_text)

        return jsonify({
            "original_text": original_text,
            "translated_text": translated_text,
            "source_language": src_lang,
            "target_language": target_lang
        })
    except Exception as e:
        print("Error:", str(e))  # Debugging print statement
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)