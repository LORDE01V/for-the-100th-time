import smtplib
from email.mime.text import MIMEText

def send_welcome_email(to_email, username):
    from_email = "gridx.noreply@gmail.com"
    subject = "Welcome to GridX!"
    body = f"Hello {username},\n\nWelcome to GridX! We're excited to have you on board.\n\nBest,\nThe GridX Team"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    # Use Gmail's SMTP server
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(from_email, "YOUR_APP_PASSWORD")  # Replace with your Gmail App Password
        server.sendmail(from_email, to_email, msg.as_string()) 