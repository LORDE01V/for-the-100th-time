from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
@jwt_required()
def home_page():
    return jsonify({"status": "authenticated"})
