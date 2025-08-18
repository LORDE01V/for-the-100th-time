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
            u.phone,
            p.emergency_contact_name,
            p.emergency_contact_number,
            p.date_of_birth,
            p.national_id_number,
            p.gender,
            p.address_street,
            p.address_city,
            p.address_province,
            p.address_postal_code,
            p.employment_status,
            p.occupation,
            p.monthly_income,
            p.employer_name,
            p.bank_name,
            p.bank_account_number,
            p.bank_account_type,
            p.profile_picture_url
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
            "emergency_contact_name": user[3],
            "emergency_contact_number": user[4],
            "date_of_birth": user[5],
            "national_id_number": user[6],
            "gender": user[7],
            "address_street": user[8],
            "address_city": user[9],
            "address_province": user[10],
            "address_postal_code": user[11],
            "employment_status": user[12],
            "occupation": user[13],
            "monthly_income": user[14],
            "employer_name": user[15],
            "bank_name": user[16],
            "bank_account_number": user[17],
            "bank_account_type": user[18],
            "profile_picture_url": user[19]
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
                email = %s,
                phone = %s
            WHERE id = %s
            ''',
            (
                data.get('full_name'),
                data.get('email'),
                data.get('phone_number'),
                user_id
            )
        )
        # UPSERT into profile_details table
        # If a row with the user_id (which is also the id in profiledetails) already exists, update it.
        # Otherwise, insert a new row.
        cur.execute(
            '''
            INSERT INTO profiledetails (
                id,
                emergency_contact_name,
                emergency_contact_number,
                date_of_birth,
                national_id_number,
                gender,
                address_street,
                address_city,
                address_province,
                address_postal_code,
                employment_status,
                occupation,
                monthly_income,
                employer_name,
                bank_name,
                bank_account_number,
                bank_account_type,
                profile_picture_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                emergency_contact_name = EXCLUDED.emergency_contact_name,
                emergency_contact_number = EXCLUDED.emergency_contact_number,
                date_of_birth = EXCLUDED.date_of_birth,
                national_id_number = EXCLUDED.national_id_number,
                gender = EXCLUDED.gender,
                address_street = EXCLUDED.address_street,
                address_city = EXCLUDED.address_city,
                address_province = EXCLUDED.address_province,
                address_postal_code = EXCLUDED.address_postal_code,
                employment_status = EXCLUDED.employment_status,
                occupation = EXCLUDED.occupation,
                monthly_income = EXCLUDED.monthly_income,
                employer_name = EXCLUDED.employer_name,
                bank_name = EXCLUDED.bank_name,
                bank_account_number = EXCLUDED.bank_account_number,
                bank_account_type = EXCLUDED.bank_account_type,
                profile_picture_url = EXCLUDED.profile_picture_url
            ''',
            (   
                user_id, # The id for insert
                data.get('emergency_contact_name'),
                data.get('emergency_contact_number'),
                data.get('date_of_birth') if data.get('date_of_birth') else None,
                data.get('national_id_number'),
                data.get('gender'),
                data.get('address_street'),
                data.get('address_city'),
                data.get('address_province'),
                data.get('address_postal_code'),
                data.get('employment_status'),
                data.get('occupation'),
                data.get('monthly_income'),
                data.get('employer_name'),
                data.get('bank_name'),
                data.get('bank_account_number'),
                data.get('bank_account_type'),
                data.get('profile_picture_url') # Can be None if not sent by frontend
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