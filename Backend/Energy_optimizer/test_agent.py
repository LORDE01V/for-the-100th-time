from agent import EnergyUsageOptimizerAgent

agent = EnergyUsageOptimizerAgent()
analysis = agent.analyze_usage()
print("📊 Energy Usage Analysis:")
for key, value in analysis.items():
    print(f"{key}: {value}")