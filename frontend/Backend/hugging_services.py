import os
import requests
from dotenv import load_dotenv
from transformers import pipeline

load_dotenv()

class HuggingFaceChatbot:
    def __init__(self):
        # Initialize the pipeline with the model
        self.pipe = pipeline(
            "zero-shot-classification", 
            model="facebook/bart-large-mnli",
            token=os.getenv("HUGGINGFACE_TOKEN")
        )
        
        # Define specific intents for our solar app
        self.intents = {
            "top_up": ["top up", "recharge", "add money", "payment"],
            "balance": ["balance", "amount", "credit", "remaining"],
            "payment_methods": ["payment method", "how to pay", "bank transfer", "card"],
            "system_status": ["status", "working", "performance", "efficiency"],
            "support": ["help", "support", "assistance", "contact"],
            "error": ["error", "problem", "issue", "not working"]
        }

        # Define specific responses for each intent
        self.responses = {
            "top_up": [
                "To top up your account:\n1. Click 'Top Up' in the dashboard\n2. Enter the amount\n3. Choose payment method\n4. Complete the transaction",
                "You can top up through the dashboard using the 'Top Up' button. Would you like to know about payment methods?"
            ],
            "balance": [
                "Your current balance is shown at the top of your dashboard. You can also click 'Balance' for a detailed view.",
                "Check your balance in the dashboard's main screen or under the 'Balance' section."
            ],
            "payment_methods": [
                "We accept:\n1. Credit/Debit Cards\n2. Direct Bank Transfer\n3. Mobile Money\nWhich would you like to learn more about?",
                "You can pay using cards, bank transfers, or mobile money. Need details about any specific method?"
            ],
            "system_status": [
                "Check your system status in the dashboard under 'System Health'. It shows:\n- Current Performance\n- Energy Production\n- Any Active Alerts",
                "Your system status is available in real-time on the dashboard. Look for the 'System Health' indicator."
            ],
            "support": [
                "Need help? You can:\n1. Chat with me\n2. Call support at 0800-SOLAR\n3. Email help@solar.com",
                "Our support team is available 24/7. Would you like their contact details?"
            ],
            "error": [
                "If you're experiencing issues:\n1. Check your system status\n2. Note any error codes\n3. Contact our support team",
                "Let's troubleshoot the issue. Can you describe what's not working?"
            ],
            "default": [
                "I can help with:\n- Account top-ups\n- Balance checks\n- Payment methods\n- System status\n- Technical support\nWhat do you need?",
                "I'm here to assist! Could you be more specific about what you need help with?"
            ]
        }

    def get_response(self, query: str) -> str:
        try:
            # Convert query to lowercase for better matching
            query_lower = query.lower()
            
            # Find matching intent
            matched_intent = None
            for intent, keywords in self.intents.items():
                if any(keyword in query_lower for keyword in keywords):
                    matched_intent = intent
                    break
            
            if matched_intent:
                # Get responses for the matched intent
                possible_responses = self.responses[matched_intent]
                # Return a response
                return possible_responses[0]
            
            # If no intent matches, use default response
            return self.responses["default"][0]
                
        except Exception as e:
            print(f"Error in get_response: {e}")
            return "I'm having trouble understanding. Could you rephrase your question?"

    def get_confidence_scores(self, query: str) -> dict:
        try:
            result = self.pipe(query, candidate_labels=list(self.intents.keys()))
            return dict(zip(result['labels'], result['scores']))
        except Exception as e:
            print(f"Error getting confidence scores: {e}")
            return {}

    def process_voice_query(self, audio_file_path: str) -> str:
        """Transcribe audio using AssemblyAI and get AI response."""
        ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
        headers = {'authorization': ASSEMBLYAI_API_KEY}
        upload_url = "https://api.assemblyai.com/v2/upload"
        transcript_url = "https://api.assemblyai.com/v2/transcript"

        print("Uploading audio to AssemblyAI...")
        with open(audio_file_path, 'rb') as f:
            upload_response = requests.post(upload_url, headers=headers, files={'file': f})
        print("Upload response status:", upload_response.status_code)
        print("Upload response text:", upload_response.text)
        if upload_response.status_code != 200:
            return "Voice upload failed."
        audio_url = upload_response.json()['upload_url']

        print("Requesting transcription...")
        transcript_response = requests.post(
            transcript_url,
            headers=headers,
            json={"audio_url": audio_url}
        )
        print("Transcript response status:", transcript_response.status_code)
        print("Transcript response text:", transcript_response.text)
        if transcript_response.status_code != 200:
            return "Transcription request failed."
        transcript_id = transcript_response.json()['id']

        print("Polling for transcription result...")
        import time
        while True:
            poll_response = requests.get(f"{transcript_url}/{transcript_id}", headers=headers)
            status = poll_response.json()['status']
            print("Polling status:", status)
            if status == 'completed':
                text = poll_response.json()['text']
                print("Transcription completed:", text)
                break
            elif status == 'failed' or status == 'error':
                print("Transcription failed:", poll_response.text)
                return f"Transcription failed: {poll_response.text}"
            time.sleep(1)

        # 2. Get AI response
        return self.get_response(text) 