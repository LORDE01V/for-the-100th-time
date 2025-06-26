import os
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def get_gmail_service(access_token):
    creds = Credentials(token=access_token)
    return build('gmail', 'v1', credentials=creds)

def get_user_emails(access_token, max_results=10):
    service = get_gmail_service(access_token)
    results = service.users().messages().list(
        userId='me',
        maxResults=max_results
    ).execute()
    return results.get('messages', []) 