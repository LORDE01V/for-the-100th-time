from flask import Blueprint, request, jsonify, session
from Backend.support import get_user_balance, update_user_balance

topup_bp = Blueprint('topup', __name__)

# Existing routes for top-up functionality
@topup_bp.route('/user/balance', methods=['GET'])
def get_balance():
    user_id = request.args.get('user_id')  # Assume user_id is passed as a query param
    balance = get_user_balance(user_id)  # Fetch balance from the database
    return jsonify({'balance': balance})

from Backend.support import get_user_balance, update_user_balance, execute_query

@topup_bp.route('/user/topup', methods=['POST'])
def top_up():
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400
    user_id = data.get('user_id')
    amount = data.get('amount')
    promo_code = data.get('promo_code')
    voucher_code = data.get('voucher_code')
    transaction_type = data.get('transaction_type')
    # is_auto_topup = data.get('is_auto_topup', False)
    # min_balance = data.get('min_balance')
    # auto_topup_amount = data.get('auto_topup_amount')
    # auto_topup_frequency = data.get('auto_topup_frequency')

    if not user_id or not amount or not transaction_type:
        return jsonify({"error": "Missing required fields"}), 400

    # 1. Insert into topup_transactions
    insert_query = """
        INSERT INTO topup_transactions (
            user_id,amount, promo_code, voucher_code, transaction_type
        ) VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
    """
    params = (
        user_id, amount, promo_code, voucher_code,
        transaction_type
    )
    result = execute_query('insert', insert_query, params)
    if not result:
        return jsonify({"error": "Top-up failed"}), 500

    # 2. Update user balance
    new_balance = update_user_balance(user_id, amount)

    transaction_id = result[0] if isinstance(result, (list, tuple)) else result
    return jsonify({"message": "Top-up successful", "transaction_id": transaction_id, "newBalance": new_balance, "success": True}), 200


# New route for fetching the current user
@topup_bp.route('/api/current-user', methods=['GET'])
def get_current_user():
    # Example logic to retrieve the current user from the session
    user = session.get('user')  # Replace with your session management logic
    if user:
        return jsonify({
            'id': user.get('id'),
            'email': user.get('email'),
            'name': user.get('name')
        })
    return jsonify({'error': 'User not logged in'}), 401