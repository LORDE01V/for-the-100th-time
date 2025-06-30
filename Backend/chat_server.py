from flask import Flask, request, jsonify
from flask_cors import CORS
from hugging_services import HuggingFaceChatbot
import logging
import tempfile
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize chatbot
chatbot = HuggingFaceChatbot()

@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.get_json()
        message = data.get("message", "")
        # history = data.get("history", [])  # If you want to use history in the future
        logger.info(f"Received message: {message}")
        response = chatbot.get_response(message)  # Remove history parameter
        logger.info(f"Sending response: {response}")
        return jsonify({"response": response})
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({"detail": str(e)}), 500

@app.route("/api/voice-to-text", methods=["POST"])
def voice_to_text():
    try:
        if "audio" not in request.files:
            return jsonify({"detail": "No audio file provided"}), 400
        audio = request.files["audio"]
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio.save(temp_file)
            temp_file.flush()
            text = chatbot.process_voice_query(temp_file.name)
            os.unlink(temp_file.name)
            return jsonify({"text": text})
    except Exception as e:
        logger.error(f"Error processing voice: {str(e)}")
        return jsonify({"detail": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
