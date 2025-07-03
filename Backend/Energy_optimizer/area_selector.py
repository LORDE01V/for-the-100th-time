from flask import Flask, jsonify
import json
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AREA_JSON_PATH = os.path.join(BASE_DIR, "area_map.json")

@app.route("/", methods=["GET"])
def welcome():
    return jsonify({"message": "Welcome to the Area Selector API!"})

@app.route("/api/area-options", methods=["GET"])
def get_static_area_map():
    try:
        with open(AREA_JSON_PATH, "r") as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to load JSON: {str(e)}"}), 500

if __name__ == "__main__":
    print("Serving from:", AREA_JSON_PATH)
    app.run(debug=True, port=5000)
