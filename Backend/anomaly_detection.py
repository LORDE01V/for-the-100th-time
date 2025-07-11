import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Step 1: Simulate Appliance-Level Electricity Usage Data
def generate_appliance_data(days=30, samples_per_day=24):
    np.random.seed(42)  # For reproducibility
    total_samples = days * samples_per_day
    time = pd.date_range(start="2023-01-01", periods=total_samples, freq="H")
    
    # Simulate usage for individual appliances
    fridge = np.random.normal(0.2, 0.05, total_samples)  # Fridge: constant usage
    air_conditioner = np.sin(np.linspace(0, 2 * np.pi, samples_per_day)) * 0.5
    air_conditioner = np.tile(air_conditioner, days) + np.random.normal(0, 0.1, total_samples)
    lights = np.random.choice([0, 0.1], size=total_samples, p=[0.7, 0.3])  # Lights: on/off
    
    # Combine appliance data
    total_usage = fridge + air_conditioner + lights
    
    # Add anomalies to specific appliances
    anomaly_indices = np.random.choice(total_samples, size=5, replace=False)
    fridge[anomaly_indices] += np.random.uniform(1, 2, size=5)  # Fridge anomaly
    
    # Create a DataFrame
    data = pd.DataFrame({
        "timestamp": time,
        "fridge": fridge,
        "air_conditioner": air_conditioner,
        "lights": lights,
        "total_usage": total_usage
    })
    return data

# Step 2: Detect Anomalies Using Z-Score
def detect_appliance_anomalies(data, threshold=3):
    appliances = ["fridge", "air_conditioner", "lights"]
    anomaly_results = {}
    
    for appliance in appliances:
        # Calculate mean and standard deviation
        mean = data[appliance].mean()
        std = data[appliance].std()
        
        # Compute z-scores
        data[f"{appliance}_z_score"] = (data[appliance] - mean) / std
        
        # Flag anomalies
        data[f"{appliance}_anomaly"] = data[f"{appliance}_z_score"].apply(lambda x: abs(x) > threshold)
        
        # Store anomalies
        anomaly_results[appliance] = data[data[f"{appliance}_anomaly"]]
    
    return data, anomaly_results

# Step 3: Generate Alerts for Detected Anomalies
def generate_alerts(anomaly_results):
    for appliance, anomalies in anomaly_results.items():
        if anomalies.empty:
            print(f"No anomalies detected for {appliance}.")
        else:
            print(f"Anomalies Detected for {appliance}:")
            for _, row in anomalies.iterrows():
                timestamp = row["timestamp"]
                usage = row[appliance]
                z_score = row[f"{appliance}_z_score"]
                print(f"⚠️ Alert: Anomaly detected at {timestamp}")
                print(f"   - Usage: {usage:.2f} kWh")
                print(f"   - Z-Score: {z_score:.2f}")
                print(f"   - Possible Cause: Check {appliance} for unusual power consumption.\n")

# Step 4: Visualize Electricity Usage and Anomalies
def visualize_usage(data):
    plt.figure(figsize=(12, 6))
    
    # Plot electricity usage for each appliance
    appliances = ["fridge", "air_conditioner", "lights"]
    for appliance in appliances:
        plt.plot(data["timestamp"], data[appliance], label=f"{appliance.capitalize()} Usage")
    
    # Highlight anomalies
    for appliance in appliances:
        plt.scatter(
            data[data[f"{appliance}_anomaly"]]["timestamp"],
            data[data[f"{appliance}_anomaly"]][appliance],
            label=f"{appliance.capitalize()} Anomalies",
            marker="o",
        )
    
    # Add labels and title
    plt.xlabel("Time")
    plt.ylabel("Usage (kWh)")
    plt.title("Electricity Usage with Detected Anomalies")
    plt.legend()
    plt.grid(True)
    
    # Show the plot
    plt.show()

# Main Execution
if __name__ == "__main__":
    # Generate appliance-level data
    appliance_data = generate_appliance_data()
    
    # Detect anomalies
    appliance_data, appliance_anomalies = detect_appliance_anomalies(appliance_data)
    
    # Generate alerts
    generate_alerts(appliance_anomalies)
    
    # Visualize usage and anomalies
    visualize_usage(appliance_data)