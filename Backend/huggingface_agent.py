# Backend/huggingface_agent.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("HUGGINGFACE_API_KEY")
API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def query_mistral(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {
            "temperature": 0.7,
            "max_new_tokens": 256,
            "return_full_text": False
        }
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            generated = response.json()
            # Hugging Face returns a list of dicts with 'generated_text'
            if isinstance(generated, list) and generated and 'generated_text' in generated[0]:
                return (generated[0]["generated_text"], 200)
            else:
                return ("No response from model.", 200)
        else:
            return (f"Error: {response.status_code} - {response.text}", response.status_code)
    except Exception as e:
        return (f"Exception: {str(e)}", 500)
