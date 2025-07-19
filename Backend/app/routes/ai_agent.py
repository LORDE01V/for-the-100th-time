from flask import Blueprint, request, jsonify
import requests
import os

ai_agent_bp = Blueprint('ai_agent_bp', __name__)

# List of greeting/empty/vague triggers
GREETINGS = [
    '', 'hi', 'hello', 'hey', 'how are you', 'good morning', 'good afternoon', 'good evening', 'greetings', 'yo', 'sup', 'hola', 'bonjour', 'hallo', 'help', 'start', 'menu', 'test', 'ping', 'who are you', 'what can you do', 'assist', 'assistance', 'support'
]

FAREWELLS = [
    'bye', 'goodbye', 'ciao', 'see you', 'see ya', 'later', 'farewell', 'thanks, bye', 'thank you, bye', 'talk to you later', 'see you later', 'see you soon', 'catch you later', 'adios', 'cheers', 'peace out', 'take care', 'until next time'
]

def is_greeting_or_empty(msg):
    msg = (msg or '').strip().lower()
    # Only treat as greeting if the message is exactly a greeting (not if it contains a greeting word)
    return msg in GREETINGS

def is_farewell(msg):
    msg = (msg or '').strip().lower()
    return any(f in msg for f in FAREWELLS)

@ai_agent_bp.route('/api/ai-agent', methods=['POST'])
def handle_ai_agent():
    try:
        data = request.get_json(force=True)
        message = data.get("message", "").strip() if data else ""

        if is_greeting_or_empty(message):
            return jsonify({
                "reply": "Hello! You can ask about your solar system, energy usage, loadshedding alerts, forecasts, billing, or account settings. How can I assist you today?"
            }), 200

        if is_farewell(message):
            return jsonify({
                "reply": "Glad I could assist you, feel free to come back if you need help."
            }), 200

        system_prompt = (
            "You are a helpful AI assistant specialized exclusively in the Solar Optimizer app.\n"
            "Answer only questions related to:\n"
            "- Energy usage and optimization\n"
            "- Solar panel systems and installations\n"
            "- Solar power generation, battery storage, and inverters\n"
            "- Weather and sunlight forecasts relevant to solar output\n"
            "- Loadshedding schedules and alerts\n"
            "- Dashboard analytics, reports, and performance trends\n"
            "- Billing, payments, and subscription plans\n"
            "- Device status, maintenance, and troubleshooting\n"
            "- User account management including login and registration\n"
            "- Tips, recommendations, and support related solely to the Solar Optimizer app\n\n"
            "If a user asks about anything outside these topics, politely respond:\n"
            "I'm here to help with Solar Optimizer app related questions only. Please ask about energy, solar, loadshedding, billing, or dashboard features.\n\n"
            "If the user input is empty, vague, or just a greeting, respond with a welcoming message suggesting what can be asked:\n"
            "Hello! You can ask about your solar system, energy usage, loadshedding alerts, forecasts, billing, or account settings. How can I assist you today?\n\n"
            "Do not read markdown syntax such as **, __, or backticks aloud. Instead, provide clear, natural language responses without mentioning formatting symbols.\n\n"
            "Keep all answers concise, informative, and user-friendly.\n\n"
            "Never answer questions unrelated to the Solar Optimizer app."
        )

        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json"
        }
        body = {
            "model": "mistralai/mistral-small-3.2-24b-instruct:free",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=body)
        response.raise_for_status()
        response_data = response.json()
        reply = response_data["choices"][0]["message"]["content"]
        return jsonify({ "reply": reply }), 200

    except Exception as e:
        return jsonify({ "error": str(e) }), 500