def generate_ai_suggestions(user_data):
    suggestions = []

    # Energy Optimization
    if user_data["energy_usage"]:
        avg_usage = sum(user_data["energy_usage"]) / len(user_data["energy_usage"])
        if avg_usage > 40:
            suggestions.append("Consider reducing energy usage during peak hours to save on costs.")

    # Cost-Saving Strategies
    if user_data["budget"] < 1000:
        suggestions.append("Switch to energy-efficient appliances to stay within your budget.")

    # Sustainability Insights
    suggestions.append("Installing solar panels can reduce your carbon footprint by 30%.")

    # Predictive Maintenance
    if user_data["devices"] > 3:
        suggestions.append("Schedule regular maintenance for your devices to prevent faults.")

    return suggestions