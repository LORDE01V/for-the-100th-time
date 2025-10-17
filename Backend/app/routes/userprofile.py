from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db
from flask_jwt_extended import jwt_required, get_jwt_identity

profile_bp = Blueprint('profile', __name__)



@profile_bp.route('/profile/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    conn, cur = connect_db()
    # Join users and profile_details to get all info
    cur.execute(
        '''
        SELECT
            u.full_name,
            u.email,
            u.phone_number,
            p.surname,
            p.address
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
            "surname": user[3],
            "address": user[4]
        }), 200
    return jsonify({'error': 'User not found'}), 404

import psycopg2

@profile_bp.route('/profile/me', methods=['POST', 'PUT'])
@jwt_required()
def update_my_profile():
    try:
        user_id = get_jwt_identity()
        data = request.json
        conn, cur = connect_db()
        # Update users table (note: column is phone_number, not phone)
        cur.execute(
            '''
            UPDATE users SET
                full_name = %s,
                email = %s,
                phone_number = %s
            WHERE id = %s
            ''',
            (
                data.get('full_name'),
                data.get('email'),
                data.get('phone_number'),
                user_id
            )
        )
        # Upsert into profiledetails with columns that exist
        cur.execute(
            '''
            INSERT INTO profiledetails (
                id,
                surname,
                email,
                phone_number,
                address
            ) VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                surname = EXCLUDED.surname,
                email = EXCLUDED.email,
                phone_number = EXCLUDED.phone_number,
                address = EXCLUDED.address
            ''',
            (
                user_id,
                data.get('surname'),
                data.get('email'),
                data.get('phone_number'),
                data.get('address')
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