import os
import jwt
from flask import request, jsonify
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Make sure to use the same secret key as used for encoding the token
            data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
            # Assuming the user ID is stored as 'user_id' in the token payload
            request.user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'message': f'An error occurred: {str(e)}'}), 500

        return f(*args, **kwargs)

    return decorated
