from flask import Blueprint, request, jsonify
import os
from huggingface_agent import query_mistral
import requests
import json

ai_agent_bp = Blueprint('ai_agent', __name__)

@ai_agent_bp.route('/api/ai-agent', methods=['POST'])
def ai_agent_openrouter():
    data = request.get_json(force=True, silent=True)
    if not data or 'prompt' not in data or not data['prompt'].strip():
        return jsonify({'response': 'Prompt is required'}), 400
    prompt = data['prompt'].strip()

    # Guardrails: Only answer energy/solar/forecast/loadshedding/dashboard queries
    allowed_keywords = [
        'energy', 'solar', 'forecast', 'loadshedding', 'dashboard', 'usage', 'optimizer', 'battery', 'panel', 'grid', 'power', 'consumption', 'generation', 'saving', 'outage', 'electricity', 'renewable', 'weather', 'sunlight', 'pv', 'inverter', 'subscription', 'tariff', 'billing', 'alert', 'notification', 'report', 'trend', 'ai', 'suggestion', 'tip', 'support', 'device', 'area', 'location', 'status', 'schedule', 'time', 'history', 'performance', 'maintenance', 'capacity', 'storage', 'efficiency', 'cost', 'payment', 'topup', 'transaction', 'user', 'profile', 'account', 'login', 'register', 'plan', 'upgrade', 'downgrade', 'settings', 'help', 'faq', 'contact', 'feedback', 'optimizer', 'optimizer agent', 'optimizer model', 'optimizer suggestion', 'optimizer plan', 'optimizer forecast', 'optimizer dashboard', 'optimizer usage', 'optimizer report', 'optimizer tip', 'optimizer support', 'optimizer device', 'optimizer area', 'optimizer location', 'optimizer status', 'optimizer schedule', 'optimizer time', 'optimizer history', 'optimizer performance', 'optimizer maintenance', 'optimizer capacity', 'optimizer storage', 'optimizer efficiency', 'optimizer cost', 'optimizer payment', 'optimizer topup', 'optimizer transaction', 'optimizer user', 'optimizer profile', 'optimizer account', 'optimizer login', 'optimizer register', 'optimizer plan', 'optimizer upgrade', 'optimizer downgrade', 'optimizer settings', 'optimizer help', 'optimizer faq', 'optimizer contact', 'optimizer feedback'
    ]
    prompt_lower = prompt.lower()
    if not any(kw in prompt_lower for kw in allowed_keywords):
        return jsonify({'response': "I'm only trained to assist with Solar Optimizer App queries like energy usage, solar data, forecast, and loadshedding. Please ask something related to that."}), 200

    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    if not OPENROUTER_API_KEY:
        return jsonify({'response': 'OpenRouter API key not set in environment.'}), 500

    try:
        api_url = 'https://openrouter.ai/api/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'HTTP-Referer': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'mistralai/mistral-small-3.2-24b-instruct',
            'messages': [
                { 'role': 'user', 'content': prompt }
            ]
        }
        resp = requests.post(api_url, headers=headers, data=json.dumps(payload), timeout=60)
        if resp.status_code == 200:
            result = resp.json()
            # OpenRouter returns choices[0].message.content
            answer = None
            if 'choices' in result and result['choices'] and 'message' in result['choices'][0]:
                answer = result['choices'][0]['message'].get('content', '').strip()
            if answer:
                return jsonify({'response': answer}), 200
            else:
                return jsonify({'response': 'No answer found from OpenRouter.'}), 200
        else:
            return jsonify({'response': f'OpenRouter error: {resp.status_code} - {resp.text}'}), 500
    except Exception as e:
        return jsonify({'response': f'Error contacting OpenRouter: {str(e)}'}), 500