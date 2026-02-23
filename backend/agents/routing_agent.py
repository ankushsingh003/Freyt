import os
import requests
from dotenv import load_dotenv

load_dotenv()

class RoutingAgent:
    def __init__(self):
        self.api_key = os.getenv("GEOAPIFY_API_KEY")
        self.base_url = "https://api.geoapify.com/v1/routing"

    def get_optimized_route(self, waypoints, mode="drive"):
        """
        Calculates a route between waypoints using Geoapify Routing API.
        waypoints should be a list of strings: ["lat,lon", "lat,lon"]
        """
        if not self.api_key:
            return {"error": "Geoapify API key not found in .env"}

        if len(waypoints) < 2:
            return {"error": "At least two waypoints (start and end) are required."}

        # Geoapify format: "lat,lon|lat,lon"
        waypoints_str = "|".join(waypoints)
        
        params = {
            "waypoints": waypoints_str,
            "mode": mode,
            "apiKey": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()

            # Extracting basic route info
            if "features" in data and len(data["features"]) > 0:
                route = data["features"][0]
                properties = route.get("properties", {})
                
                return {
                    "distance_km": properties.get("distance") / 1000 if properties.get("distance") else 0,
                    "time_min": properties.get("time") / 60 if properties.get("time") else 0,
                    "geometry": route.get("geometry", {}),
                    "summary": f"Route of {properties.get('distance', 0)/1000:.2f}km calculated.",
                    "raw_data": data
                }
            else:
                return {"error": "No route found for these waypoints."}

        except Exception as e:
            return {"error": f"Failed to connect to Geoapify: {str(e)}"}

if __name__ == "__main__":
    # Test block (London to Manchester)
    agent = RoutingAgent()
    test_waypoints = ["51.5074,-0.1278", "53.4808,-2.2426"]
    print(agent.get_optimized_route(test_waypoints))
