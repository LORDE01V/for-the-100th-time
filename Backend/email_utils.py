import os
import smtplib
from email.message import EmailMessage

def send_email(recipient_email, subject, html_body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = os.getenv('EMAIL_USER', 'noreply@gridx.com')
    msg['To'] = recipient_email
    msg.set_content(html_body, subtype='html')

    with smtplib.SMTP_SSL('smtp.example.com', 465) as smtp:
        smtp.login(
            os.getenv('EMAIL_USER', ''),  # Default empty string
            os.getenv('EMAIL_PASS', '')   # Default empty string
        )
        smtp.send_message(msg)

def send_welcome_email(recipient_email, username):
    subject = "Welcome to GridX Energy Platform"  # Explicit string subject
    body = f"""
    <h1>Welcome {username}!</h1>
    <p>Thank you for joining GridX. Your account has been successfully created.</p>
    """
    send_email(recipient_email, subject, body)
