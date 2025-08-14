from flask import Blueprint, request, jsonify
from Backend.db_utils import connect_db
from flask_jwt_extended import jwt_required, get_jwt_identity
import psycopg2
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    conn, cur = connect_db()
    cur.execute(
        '''
        SELECT u.full_name, u.email, u.phone, u.date_of_birth, u.national_id_number, u.gender,
               u.address, p.emergency_contact_name, p.emergency_contact_number,
               p.city, p.province, p.postal_code, p.employment_status, p.occupation,
               p.monthly_income_range, p.employer_name, p.bank_name, p.account_number,
               p.account_type, p.profile_picture_url
        FROM users u
        LEFT JOIN profiledetails p ON u.id = p.id
        WHERE u.id = %s
        ''', (user_id,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user:
        # Fill with None if any field is missing
        keys = [
            "full_name", "email", "phone_number", "date_of_birth", "national_id_number", "gender",
            "address_street", "emergency_contact_name", "emergency_contact_number",
            "address_city", "address_province", "address_postal_code", "employment_status",
            "occupation", "monthly_income", "employer_name", "bank_name", "bank_account_number",
            "bank_account_type", "profile_picture_url"
        ]
        # Pad user tuple to length if needed
        user = list(user) + [None] * (len(keys) - len(user))
        return jsonify(dict(zip(keys, user))), 200
    return jsonify({'error': 'User not found'}), 404

@profile_bp.route('/profile/me', methods=['POST', 'PUT'])
@jwt_required()
def update_my_profile():
    conn, cur = None, None
    try:
        user_id = get_jwt_identity()
        data = request.form
        file = request.files.get('profile_picture')
        profile_picture_url = None

        if file:
            filename = secure_filename(file.filename)
            UPLOAD_FOLDER = 'uploads/profile_pictures'
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            profile_picture_url = f"/uploads/profile_pictures/{filename}"

        conn, cur = connect_db()
        # Start transaction
        cur.execute("BEGIN;")

        # Ensure profiledetails row exists
        cur.execute("SELECT 1 FROM profiledetails WHERE id = %s", (user_id,))
        if not cur.fetchone():
            cur.execute(
                '''INSERT INTO profiledetails (id) VALUES (%s)''',
                (user_id,)
            )

        # Update users table
        cur.execute(
            '''
            UPDATE users SET
                full_name = %s,
                email = %s,
                phone = %s,
                date_of_birth = %s,
                national_id_number = %s,
                gender = %s
            WHERE id = %s
            ''',
            (
                data.get('full_name'),
                data.get('email'),
                data.get('phone_number'),
                data.get('date_of_birth'),
                data.get('national_id_number'),
                data.get('gender'),
                user_id
            )
        )

        # Update profiledetails table
        cur.execute(
            '''
            UPDATE profiledetails SET
                address = %s,
                city = %s,
                province = %s,
                postal_code = %s,
                employment_status = %s,
                occupation = %s,
                monthly_income_range = %s,
                employer_name = %s,
                bank_name = %s,
                account_number = %s,
                account_type = %s,
                profile_picture_url = %s,
                emergency_contact_name = %s,
                emergency_contact_number = %s
            WHERE id = %s
            ''',
            (
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
                profile_picture_url or data.get('profile_picture_url'),
                data.get('emergency_contact_name'),
                data.get('emergency_contact_number'),
                user_id
            )
        )

        conn.commit()
        return jsonify({'message': 'Profile updated'}), 200
    except psycopg2.errors.UniqueViolation:
        if conn:
            conn.rollback()
        return jsonify({'error': 'This email is already in use.'}), 400
    except Exception as e:
        print("Update error:", e)
        if conn:
            conn.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()

def create_profile_for_user(user_id):
    conn, cur = connect_db()
    cur.execute(
        "INSERT INTO profiledetails (id) VALUES (%s) ON CONFLICT (id) DO NOTHING",
        (user_id,)
    )
    conn.commit()
    cur.close()
    conn.close()