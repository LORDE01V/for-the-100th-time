from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

BASE_ESKOM_URL = "http://loadshedding.eskom.co.za"

@app.route("/api/status", methods=["GET"])
def get_stage():
    try:
        res = requests.get(f"{BASE_ESKOM_URL}/LoadShedding/GetStatus")
        stage = int(res.text)
        return jsonify({"stage": stage})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/municipalities/<province_id>", methods=["GET"])
def get_municipalities(province_id):
    try:
        res = requests.get(f"{BASE_ESKOM_URL}/LoadShedding/GetMunicipalities/?Id={province_id}")
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/suburbs", methods=["GET"])
def get_suburbs():
    muni_id = request.args.get("municipality_id")
    search = request.args.get("search", "")
    try:
        res = requests.get(f"{BASE_ESKOM_URL}/LoadShedding/GetSurburbData/?MunicipalityId={muni_id}&SearchText={search}")
        return res.text, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/schedule", methods=["GET"])
def get_schedule():
    suburb_id = request.args.get("suburb_id")
    stage = request.args.get("stage")
    province_id = request.args.get("province_id", "4")  # default to Gauteng
    muni_count = request.args.get("municipality_count", "10")
    try:
        url = f"{BASE_ESKOM_URL}/LoadShedding/GetScheduleM/{suburb_id}/{stage}/{province_id}/{muni_count}"
        res = requests.get(url)
        return res.text, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
