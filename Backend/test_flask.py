from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

@app.route('/api/ai-agent', methods=['GET', 'POST', 'OPTIONS'])
def ai_agent_handler():
    print("=== AI AGENT HANDLER CALLED ===")
    if request.method == 'OPTIONS':
        response = make_response(jsonify({'status': 'ok'}), 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS,GET')
        return response
    elif request.method == 'GET':
        return make_response(jsonify({'status': 'ok', 'message': 'GET /api/ai-agent is working'}), 200)
    elif request.method == 'POST':
        print("POST /api/ai-agent data:", request.get_json())
        return make_response(jsonify({'response': 'It works!'}), 200)
    else:
        return make_response(jsonify({'error': 'Method not allowed'}), 405)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
