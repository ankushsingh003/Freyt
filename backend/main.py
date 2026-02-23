from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import OrchestratorAgent
from agents.weather_agent import WeatherAgent
from agents.rag_agent import DiagnosisAgent
from agents.routing_agent import RoutingAgent

load_dotenv()

app = FastAPI(title="RAG-Based Multi-Agent Logistics System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = OrchestratorAgent()
weather_agent = WeatherAgent()
diagnosis_agent = DiagnosisAgent(pdf_path="../data/freight-europe-general-terms-and-conditions-for-transport-services-en.pdf")
routing_agent = RoutingAgent()

class ShipmentRequest(BaseModel):
    tracking_id: str
    carrier_code: str = None

@app.get("/")
async def root():
    return {"message": "Logistics Multi-Agent API is running"}

@app.post("/analyze-shipment")
async def analyze_shipment(request: ShipmentRequest):
    shipment_info = orchestrator.get_shipment_status(request.tracking_id, request.carrier_code)
    if "error" in shipment_info:
        raise HTTPException(status_code=400, detail=shipment_info["error"])

    geo_info = routing_agent.geocode_location(shipment_info["location"])
    
    if "error" in geo_info:
        lat, lon = 18.9500, 72.9500
    else:
        lat, lon = geo_info["lat"], geo_info["lon"]

    weather_info = weather_agent.check_weather(lat, lon)
    if "error" in weather_info:
        raise HTTPException(status_code=500, detail=weather_info["error"])

    diagnosis_info = diagnosis_agent.diagnose_risk(
        weather_info["condition"], 
        weather_info["humidity"]
    )

    test_waypoints = [f"{lat},{lon}", "18.5204,73.8567"]
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
