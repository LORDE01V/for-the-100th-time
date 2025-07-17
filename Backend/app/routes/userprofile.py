from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db
#from ... import db_utils
from flask_jwt_extended import jwt_required, get_jwt_identity

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_profile(user_id):
    db = connect_db()
    user = db.execute(
        'SELECT full_name, surname, email, phone_number, address FROM users WHERE id = ?', (user_id,)
    ).fetchone()
    if user:
        return jsonify(dict(user)), 200
    return jsonify({'error': 'User not found'}), 404

@profile_bp.route('/profile/<int:user_id>', methods=['POST'])
@jwt_required()
def update_profile(user_id):
    data = request.json
    db = connect_db()
    db.execute(
        '''
        UPDATE users SET
            full_name = ?,
            surname = ?,
            email = ?,
            phone_number = ?,
            address = ?
        WHERE id = ?
        ''',
        (
            data.get('full_name'),
            data.get('surname'),
            data.get('email'),
            data.get('phone_number'),
            data.get('address'),
            user_id
        )
    )
    db.commit()
    return jsonify({'message': 'Profile updated'}), 200