import os
import requests
from dotenv import load_dotenv

load_dotenv()

class WeatherAgent:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def check_weather(self, lat, lon):
        if not self.api_key:
            return {"error": "OpenWeather API key not found in .env"}

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }

        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()

            weather_main = data.get("weather", [{}])[0].get("main", "Clear")
            temp = data.get("main", {}).get("temp")
            humidity = data.get("main", {}).get("humidity")
            wind_speed = data.get("wind", {}).get("speed")

            return {
                "condition": weather_main,
                "temperature": f"{temp}°C",
                "humidity": f"{humidity}%",
                "wind_speed": f"{wind_speed} m/s",
                "risk_level": self._calculate_risk(weather_main, humidity, wind_speed),
                "raw_data": data
            }

        except Exception as e:
            return {"error": f"Failed to connect to OpenWeather: {str(e)}"}

    def _calculate_risk(self, condition, humidity, wind_speed):
        if condition in ["Storm", "Extreme", "Tornado", "Hurricane"]:
            return "HIGH"
        if condition in ["Rain", "Snow", "Drizzle"] or humidity > 85 or wind_speed > 15:
            return "MEDIUM"
        return "LOW"

if __name__ == "__main__":
    agent = WeatherAgent()
    print(agent.check_weather(18.9500, 72.9500))
