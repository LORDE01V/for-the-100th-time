import json

with open("area_map.json", "r") as f:
    data = json.load(f)
    print(json.dumps(data, indent=2))
