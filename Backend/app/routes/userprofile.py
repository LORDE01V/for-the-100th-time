from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db
from flask_jwt_extended import jwt_required, get_jwt_identity

user_profile_bp = Blueprint('profile', __name__)



@user_profile_bp.route('/profile/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    conn, cur = connect_db()
    # Join users and profile_details to get all info
    cur.execute(
        '''
        SELECT u.full_name, u.email, u.phone, p.address, p.surname
        FROM users u
        LEFT JOIN profiledetails p ON u.id = p.id
        WHERE u.id = %s
        ''', (user_id,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user:
        return jsonify({
            "full_name": user[0],
            "email": user[1],
            "phone_number": user[2],
            "address": user[3]
        }), 200
    return jsonify({'error': 'User not found'}), 404

import psycopg2

@user_profile_bp.route('/profile/me', methods=['POST', 'PUT'])
@jwt_required()
def update_my_profile():
    try:
        user_id = get_jwt_identity()
        data = request.json
        conn, cur = connect_db()
        # Update users table
        cur.execute(
            '''
            UPDATE users SET
                full_name = %s,
                surname = %s,
                email = %s,
                phone = %s
            WHERE id = %s
            ''',
            (
                data.get('full_name'),
                data.get('surname'),
                data.get('email'),
                data.get('phone_number'),
                user_id
            )
        )
        # Update profile_details table
        cur.execute(
            '''
            UPDATE profiledetails SET
                surname =%s,
                address = %s
            WHERE id = %s
            ''',
            (   
                data.get('surname'),
                data.get('address'),
               
                user_id
            )
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Profile updated'}), 200
    except psycopg2.errors.UniqueViolation:
        # Rollback the transaction to avoid locking the DB
        conn.rollback()
        return jsonify({'error': 'This email is already in use.'}), 400
    except Exception as e:
        print("Update error:", e)
        if conn:
            conn.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500