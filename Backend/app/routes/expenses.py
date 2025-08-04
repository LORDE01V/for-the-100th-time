from flask import Blueprint, request, jsonify
from Backend.support import execute_query

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/user/expenses', methods=['GET'])
def get_user_expenses():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    query = """
        SELECT id, date, amount, category, status
        FROM expenses
        WHERE user_id = %s
        ORDER BY date DESC
    """
    results = execute_query('search', query, (user_id,))
    
    expenses = []
    if results:
        for row in results:
            expenses.append({
                'id': row[0],
                'date': row[1].isoformat(),
                'amount': float(row[2]),
                'category': row[3],
                'status': row[4]
            })
            
    return jsonify({'expenses': expenses}), 200