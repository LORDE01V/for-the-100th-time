from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

voice_to_text_bp = Blueprint('voice_to_text_bp', __name__)

@voice_to_text_bp.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 404
    audio = request.files['audio']
    if audio.filename == '':
        return jsonify({'error': 'No selected file'}), 404
    # For now, just return a mock response
    return jsonify({"text": "Sorry, free voice-to-text isn't fully set up yet."}), 200 