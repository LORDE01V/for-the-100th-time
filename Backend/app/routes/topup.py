from flask import Blueprint, request, jsonify, session
from Backend.support import get_user_balance, update_user_balance, save_auto_topup_settings, execute_query
from flask_cors import cross_origin # Import cross_origin


topup_bp = Blueprint('topup', __name__)

@topup_bp.route('/user/balance', methods=['GET'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def get_balance():
    user_id = request.args.get('user_id')  # Assume user_id is passed as a query param
    balance = get_user_balance(user_id)  # Fetch balance from the database
    return jsonify({'balance': balance})

@topup_bp.route('/user/topup', methods=['POST'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def top_up():
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400
    user_id = data.get('user_id')
    amount = data.get('amount')
    promo_code = data.get('promo_code')
    voucher_code = data.get('voucher_code')
    transaction_type = data.get('transaction_type')
    
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

    transaction_id = result[0] if isinstance(result, (list, tuple)) and result else result

    # Insert into expenses table
    try:
        expense_query = """
            INSERT INTO expenses (user_id, amount, category, status)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """
        expense_category = "Recharge" if transaction_type == "recharge" else "Top-Up"
        execute_query('insert', expense_query, (user_id, amount, expense_category, 'Paid'))

        notification_query = """
            INSERT INTO notifications (user_id, message)
            VALUES (%s, %s)
            RETURNING id;
        """
        notification_message = f"New expense recorded: {expense_category} of R{float(amount):.2f}"
        execute_query('insert', notification_query, (user_id, notification_message))

    except Exception as e:
        # Log the error for debugging and return a specific message
        print(f"Error inserting into expenses table: {e}")
        # Even if expense/notification fails, top-up should still be successful
        # Consider if you want to revert top-up or just log and continue
        # For now, we will just log and continue, as the top-up itself succeeded.
        pass # Do not return an error here, as the top-up was successful

    # 2. Update user balance
    new_balance = update_user_balance(user_id, amount)

    return jsonify({"message": "Top-up successful", "transaction_id": transaction_id, "newBalance": new_balance, "success": True}), 200

@topup_bp.route('/user/latest-topup', methods=['GET'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def get_latest_topup():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    query = """
        SELECT id, amount, promo_code, voucher_code, transaction_type, created_at
        FROM topup_transactions
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1
    """
    result = execute_query('search', query, (user_id,))
    if result and len(result) > 0:
        row = result[0]
        transaction = {
            'id': row[0],
            'amount': row[1],
            'promo_code': row[2],
            'voucher_code': row[3],
            'transaction_type': row[4],
            'created_at': row[5]
        }
        return jsonify({'transaction': transaction}), 200
    else:
        return jsonify({'transaction': None}), 200

@topup_bp.route('/user/topup-history', methods=['GET'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def get_topup_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    query = """
        SELECT id, amount, promo_code, voucher_code, transaction_type, created_at
        FROM topup_transactions
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 2
    """
    results = execute_query('search', query, (user_id,))
    
    transactions = []
    if results:
        for row in results:
            transactions.append({
                'id': row[0],
                'amount': row[1],
                'promo_code': row[2],
                'voucher_code': row[3],
                'transaction_type': row[4],
                'created_at': row[5].isoformat() if row[5] else None
    
        })
    return jsonify({'transactions': transactions}), 200


# New route for fetching the current user
@topup_bp.route('/api/current-user', methods=['GET'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
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



@topup_bp.route('/user/auto-topup-settings', methods=['POST'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def set_auto_topup_settings():
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400
    user_id = data.get('user_id')
    is_auto_topup = data.get('is_auto_topup', False)
    min_balance = data.get('min_balance')
    auto_topup_amount = data.get('auto_topup_amount')
    auto_topup_frequency = data.get('auto_topup_frequency')

    if not user_id or min_balance is None or auto_topup_amount is None or not auto_topup_frequency:
        return jsonify({"error": "Missing required fields"}), 400

    result = save_auto_topup_settings(user_id, is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency)
    if result:
        return jsonify({"message": "Auto Top-Up settings saved", "id": result}), 200
    else:
        return jsonify({"error": "Failed to save settings"}), 500


@topup_bp.route('/user/auto-topup-settings', methods=['GET'])
@cross_origin(origins=['http://localhost:3000', 'https://frontend-sabs.onrender.com'], supports_credentials=True)
def get_auto_topup_settings():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    query = """
        SELECT is_auto_topup, min_balance, auto_topup_amount, auto_topup_frequency
        FROM topup_settings WHERE user_id = %s
    """
    result = execute_query('search', query, (user_id,))
    if result:
        row = result[0]
        return jsonify({
            'is_auto_topup': row[0],
            'min_balance': row[1],
            'auto_topup_amount': row[2],
            'auto_topup_frequency': row[3]
        }), 200
    else:
        return jsonify({'is_auto_topup': False}), 200