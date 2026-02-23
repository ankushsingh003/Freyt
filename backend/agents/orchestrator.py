import os
import requests
from dotenv import load_dotenv

load_dotenv()

class OrchestratorAgent:
    def __init__(self):
        self.api_key = os.getenv("TRACKINGMORE_API_KEY")
        self.base_url = "https://api.trackingmore.com/v3/trackings/get"

    def get_shipment_status(self, tracking_id, carrier_code=None):
        """
        Fetches the real-time status and location of a shipment using TrackingMore API.
        """
        # --- DYNAMIC DEMO MODE LOGIC ---
        if str(tracking_id).upper().startswith("DEMO"):
            demo_data = {
                "DEMO-MUMBAI-001": {"location": "JNPT, Mumbai (IN)", "carrier": "dhl"},
                "DEMO-DELHI-002": {"location": "IGI Cargo, Delhi (IN)", "carrier": "fedex"},
                "DEMO-BLR-003": {"location": "Kempegowda, Bengaluru (IN)", "carrier": "ups"}
            }
            
            # Default to Mumbai if ID is just "DEMO-123" or similar
            selected = demo_data.get(str(tracking_id).upper(), demo_data["DEMO-MUMBAI-001"])
            
            return {
                "tracking_id": tracking_id,
                "status": "in_transit",
                "location": selected["location"],
                "carrier": selected["carrier"],
                "raw_data": {"demo": True, "location_key": selected["location"]}
            }
        # -----------------------

        if not self.api_key:
            return {"error": "TrackingMore API key not found in .env. Use 'DEMO-123' to test without a key."}

        headers = {
            "Content-Type": "application/json",
            "Tracking-Api-Key": self.api_key
        }
        
        # TrackingMore API often requires a carrier code. 
        # If not provided, we might need to use their carrier detection API first.
        params = {
            "tracking_numbers": tracking_id,
        }
        if carrier_code:
            params["carrier_code"] = carrier_code

        try:
            # Note: This is an example request structure. 
            # In a real scenario, we'd handle carrier detection as well.
            response = requests.get(self.base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("meta", {}).get("code") == 200:
                # Extracting basic info for the demo
                trackings = data.get("data", [])
                if trackings:
                    shipment = trackings[0]
                    # Attempt to get a readable location string
                    # TrackingMore often provides city and province in separate fields or within 'last_event'
                    city = shipment.get("city", "")
                    province = shipment.get("province", "")
                    country = shipment.get("country_name", "")
                    
                    location = f"{city}, {province} ({country})" if city else shipment.get("last_event", "Location Unknown")
                    
                    return {
                        "tracking_id": tracking_id,
                        "status": shipment.get("delivery_status", "unknown"),
                        "location": location,
                        "carrier": shipment.get("carrier_code", "unknown"),
                        "raw_data": shipment
                    }
                else:
                    return {"error": "No tracking info found for this ID"}
            else:
                return {"error": data.get("meta", {}).get("message", "API Error")}

        except Exception as e:
            return {"error": f"Failed to connect to TrackingMore: {str(e)}"}

if __name__ == "__main__":
    # Test block
    agent = OrchestratorAgent()
    print(agent.get_shipment_status("TEST_ID_123"))
