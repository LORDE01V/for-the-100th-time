import pandas as pd
import plotly.graph_objects as go

class EnergyUsageOptimizerAgent:
    def __init__(self, data_path="energy_data.csv"):
        self.df = pd.read_csv(data_path, parse_dates=["timestamp"])
        self.df["hour"] = self.df["timestamp"].dt.hour
        self.df["day"] = self.df["timestamp"].dt.day_name()  # Added day column
        self.df["weekday"] = self.df["timestamp"].dt.weekday  # Added weekday column

    def analyze_usage(self):
        usage_by_hour = self.df.groupby("hour")["usage_kwh"].mean().sort_values(ascending=False)
        peak_hour = usage_by_hour.idxmax()
        low_hour = usage_by_hour.idxmin()

        return {
            "peak_usage_hour": int(peak_hour),
            "low_usage_hour": int(low_hour),
            "recommendation": f"Consider using power around {low_hour}:00 when demand is lowest."
        }

    def plot_graph(self):
        usage_by_hour = self.df.groupby("hour")["usage_kwh"].mean()

        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=usage_by_hour.index,
            y=usage_by_hour.values,
            marker_color='lightgreen',
            name="Avg kWh"
        ))
        fig.update_layout(
            title="Energy Usage by Hour",
            xaxis_title="Hour",
            yaxis_title="kWh Used",
            template="plotly_dark"
        )
        return fig