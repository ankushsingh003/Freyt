from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import our agents
from agents.orchestrator import OrchestratorAgent
from agents.weather_agent import WeatherAgent
from agents.rag_agent import DiagnosisAgent
from agents.routing_agent import RoutingAgent

# Load environment variables
load_dotenv()

app = FastAPI(title="RAG-Based Multi-Agent Logistics System")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
orchestrator = OrchestratorAgent()
weather_agent = WeatherAgent()
# Note: DiagnosisAgent might take a moment to initialize the vector DB on first run
diagnosis_agent = DiagnosisAgent(pdf_path="../data/freight-europe-general-terms-and-conditions-for-transport-services-en.pdf")
routing_agent = RoutingAgent()

class ShipmentRequest(BaseModel):
    tracking_id: str
    carrier_code: str = None  # Optional

@app.get("/")
async def root():
    return {"message": "Logistics Multi-Agent API is running"}

@app.post("/analyze-shipment")
async def analyze_shipment(request: ShipmentRequest):
    # 1. Orchestrator fetches shipment location
    shipment_info = orchestrator.get_shipment_status(request.tracking_id, request.carrier_code)
    if "error" in shipment_info:
        raise HTTPException(status_code=400, detail=shipment_info["error"])

    # 2. Extract coordinates dynamically using Geocoding
    # This replaces the hardcoded coordinate mapping
    geo_info = routing_agent.geocode_location(shipment_info["location"])
    
    if "error" in geo_info:
        # Fallback to a default or raise an error if needed
        # For now, let's use Mumbai as a fallback if geocoding fails
        lat, lon = 18.9500, 72.9500
    else:
        lat, lon = geo_info["lat"], geo_info["lon"]

    # 2. Weather Agent analyzes risks at that location
    weather_info = weather_agent.check_weather(lat, lon)
    if "error" in weather_info:
        raise HTTPException(status_code=500, detail=weather_info["error"])

    # 3. Diagnosis Agent (RAG) cross-references weather with PDF Handbook
    diagnosis_info = diagnosis_agent.diagnose_risk(
        weather_info["condition"], 
        weather_info["humidity"]
    )

    # 4. Action Agent calculates an alternate route if needed
    # (Simplified: always calculate a route for demo)
    test_waypoints = [f"{lat},{lon}", "18.5204,73.8567"] # Current to Pune (IN)
    routing_info = routing_agent.get_optimized_route(test_waypoints)

    return {
        "shipment": shipment_info,
        "weather": weather_info,
        "rag_diagnosis": diagnosis_info,
        "routing_optimization": routing_info
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
