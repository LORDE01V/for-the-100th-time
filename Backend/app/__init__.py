# __init__.py
from flask import Flask
from authlib.integrations.flask_client import OAuth
import os
from datetime import timedelta
from dotenv import load_dotenv
from flask_cors import CORS
from app.routes.topup import topup_bp
from app.routes.notification_preference import notifications_bp

# Load environment variables
load_dotenv()

# Initialize OAuth
oauth = OAuth()

def create_app():
    app = Flask(__name__,
                template_folder='templates')
    
    # Enhanced CORS configuration
    CORS(app, resources={r"/*": {  # Apply to all routes
        "origins": [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://127.0.0.1:3000",
            "http://localhost:4200",
            "https://backend-b45o.onrender.com",
            "https://frontend-1scu.onrender.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }})
    
    # Configuration
    app.config.update(
        GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID'),
        GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET'),
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY'),
        SESSION_COOKIE_NAME='session',
        SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_TYPE='filesystem'
    )
    
    # Initialize OAuth
    oauth.init_app(app)
    
    # Configure Google OAuth
    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'verify_ssl': False  # Only for development
        }
    )
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.home import home_bp
    from app.routes.userprofile import user_profile_bp
    from app.routes.ai_suggestions import ai_suggestions_bp
    from app.routes.expenses import expenses_bp
    from app.routes.loadshedding import loadshedding_bp
    from app.routes.topup import topup_bp
    from app.routes.support import support_bp
    from app.routes.notification_preference import notifications_bp
    from app.routes.community_stories import community_stories_bp
    from app.routes.events_calendar import events_calendar_bp
    from app.routes.email_subscription import email_subscription_bp
    from app.routes.expensenotifications import expensenotifications_bp
    from app.routes.email import email_bp
    from app.routes.ai_agent import ai_agent_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(home_bp, url_prefix='/api/home')
    app.register_blueprint(user_profile_bp, url_prefix='/profile')
    app.register_blueprint(ai_suggestions_bp, url_prefix='/api/ai-suggestions')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(loadshedding_bp, url_prefix='/api/loadshedding')
    app.register_blueprint(topup_bp, url_prefix='/api/topup')
    app.register_blueprint(support_bp, url_prefix='/api/support')
    app.register_blueprint(notifications_bp, url_prefix='/api/notification-preference')
    app.register_blueprint(community_stories_bp, url_prefix='/api/community-stories')
    app.register_blueprint(events_calendar_bp, url_prefix='/api/events-calendar')
    app.register_blueprint(email_subscription_bp, url_prefix='/api/email-subscription')
    app.register_blueprint(expensenotifications_bp, url_prefix='/api/expensenotifications')
    app.register_blueprint(email_bp, url_prefix='/api/email')
    app.register_blueprint(ai_agent_bp, url_prefix='/api/ai-agent')
    
    
    return app 