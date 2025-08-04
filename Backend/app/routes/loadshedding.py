from flask import Blueprint, jsonify, request
from loadshedding_api import get_national_loadshedding_status, get_area_loadshedding_schedule

loadshedding_bp = Blueprint('loadshedding', __name__)

@loadshedding_bp.route("/api/loadshedding/national-status", methods=["GET"])
def national_status():
    status = get_national_loadshedding_status()
    if status:
        return jsonify(status)
    return jsonify({"error": "Could not retrieve national loadshedding status"}), 500

@loadshedding_bp.route("/api/loadshedding", methods=["GET"])
def area_loadshedding():
    area_id = request.args.get("areaId")
    if not area_id:
        return jsonify({"error": "Area ID is required"}), 400

    schedule = get_area_loadshedding_schedule(area_id)
    if schedule:
        return jsonify(schedule)
    return jsonify({"error": "Could not retrieve loadshedding schedule for the specified area"}), 500
