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

@profile_bp.route('/profile/me', methods=['POST', 'PUT'])
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

@profile_bp.route('/user/balance', methods=['GET'])
@jwt_required()
def get_user_balance():
    user_id = get_jwt_identity()
    conn, cur = connect_db()
    try:
        cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
        balance = cur.fetchone()
        if balance:
            return jsonify({'balance': balance[0]}), 200
        return jsonify({'error': 'User not found or balance not available'}), 404
    except Exception as e:
        print(f"Error fetching balance: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()

@profile_bp.route('/user/auto-topup-settings', methods=['GET'])
@jwt_required()
def get_auto_topup_settings():
    user_id = get_jwt_identity()
    conn, cur = connect_db()
    try:
        cur.execute("SELECT is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency FROM auto_topup_settings WHERE user_id = %s", (user_id,))
        settings = cur.fetchone()
        if settings:
            return jsonify({
                'is_auto_topup': settings[0],
                'min_balance': settings[1],
                'auto_topup_amount': settings[2],
                'auto_topup_frequency': settings[3]
            }), 200
        return jsonify({'error': 'Settings not found'}), 404
    except Exception as e:
        print(f"Error fetching auto-topup settings: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()

@profile_bp.route('/user/auto-topup-settings', methods=['POST'])
@jwt_required()
def update_auto_topup_settings():
    user_id = get_jwt_identity()
    data = request.json
    is_auto_topup = data.get('is_auto_topup', False)
    min_balance = data.get('min_balance')
    auto_topup_amount = data.get('auto_topup_amount')
    auto_topup_frequency = data.get('auto_topup_frequency')

    conn, cur = connect_db()
    try:
        # Check if settings exist for the user
        cur.execute("SELECT user_id FROM auto_topup_settings WHERE user_id = %s", (user_id,))
        if cur.fetchone():
            # Update existing settings
            cur.execute(
                """UPDATE auto_topup_settings SET is_auto_topup = %s, min_balance = %s, auto_topup_amount = %s, auto_topup_frequency = %s WHERE user_id = %s""",
                (is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency, user_id)
            )
        else:
            # Insert new settings
            cur.execute(
                """INSERT INTO auto_topup_settings (user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency) VALUES (%s, %s, %s, %s, %s)""",
                (user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency)
            )
        conn.commit()
        return jsonify({'message': 'Auto top-up settings updated successfully'}), 200
    except Exception as e:
        print(f"Error updating auto-topup settings: {e}")
        conn.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()