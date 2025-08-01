import os
import requests
import re

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_LIST_ID = os.getenv('SENDGRID_LIST_ID')

SENDGRID_CONTACTS_URL = 'https://api.sendgrid.com/v3/marketing/contacts'

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def is_valid_email(email):
    return bool(EMAIL_REGEX.match(email))

def add_email_to_sendgrid_list(email):
    if not is_valid_email(email):
        return False, 'Invalid email address.'
    if not SENDGRID_API_KEY or not SENDGRID_LIST_ID:
        return False, 'SendGrid API key or List ID not configured.'
    headers = {
        "Authorization": f"Bearer {SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "list_ids": [SENDGRID_LIST_ID],
        "contacts": [{"email": email}]
    }
    try:
        resp = requests.put(SENDGRID_CONTACTS_URL, json=payload, headers=headers)
        if resp.status_code in (200, 202):
            print(f"[SendGrid] Successfully added {email} to list {SENDGRID_LIST_ID}.")
            return True, 'Subscribed successfully.'
        else:
            print(f"[SendGrid] Failed to add {email}: {resp.text}")
            # Check for already existing email
            if resp.status_code == 202 and 'already exists' in resp.text:
                return True, 'Email already subscribed.'
            return False, resp.text
    except Exception as e:
        print(f"[SendGrid] Exception: {e}")
        return False, str(e) 