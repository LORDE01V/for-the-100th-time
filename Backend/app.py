from dotenv import load_dotenv
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from hugging_services import HuggingFaceChatbot
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  # Load .env variables

app = Flask(__name__)
CORS(app)

chatbot = HuggingFaceChatbot()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        logger.info(f"Received message: {message}")
        response = chatbot.get_response(message)
        logger.info(f"Sending response: {response}")
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    try:
        logger.info("Received voice-to-text request")
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        logger.info(f"Processing audio file: {audio_file.filename}")
        
        # Save the .webm file (no ffmpeg conversion)
        temp_path = 'temp_audio.webm'
        audio_file.save(temp_path)
        logger.info(f"Saved audio file to {temp_path}")
        
        # Pass .webm file directly to the chatbot
        text = chatbot.process_voice_query(temp_path)
        logger.info(f"Processed text: {text}")
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info("Cleaned up temporary audio file")
            
        return jsonify({'text': text})
    except Exception as e:
        logger.error(f"Error in voice-to-text endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)