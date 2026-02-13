import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("--- Starting API Verification ---")
    
    # 1. Health Check
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Server not running? {e}")
        return

    # 2. Register User
    user_data = {
        "username": "green_warrior",
        "email": "warrior@example.com",
        "password": "securepassword123"
    }
    response = requests.post(f"{BASE_URL}/register", json=user_data)
    print(f"Register User: {response.status_code} - {response.json()}")

    # 3. Login / Get Token
    login_data = {
        "username": "green_warrior",
        "password": "securepassword123"
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    token = response.json().get("access_token")
    print(f"Login/Token: {response.status_code}")

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Log Activities
    activities = [
        {"category": "travel", "activity_type": "car", "value": 100, "unit": "km"},
        {"category": "electricity", "activity_type": "grid", "value": 50, "unit": "kWh"},
        {"category": "food", "activity_type": "meat", "value": 5, "unit": "kg"}
    ]
    
    for activity in activities:
        response = requests.post(f"{BASE_URL}/activities", json=activity, headers=headers)
        print(f"Log Activity ({activity['activity_type']}): {response.status_code}")

    # 5. Fetch History
    response = requests.get(f"{BASE_URL}/history", headers=headers)
    history = response.json()
    print(f"History Fetch: {response.status_code}")
    print(f"Total CO2: {history['total_co2']} kg")

    # 6. Get Recommendations
    response = requests.get(f"{BASE_URL}/recommendations", headers=headers)
    recommendations = response.json()
    print(f"Recommendations: {len(recommendations)} found")
    for rec in recommendations:
        print(f"- [{rec['category'].upper()}] {rec['tip']} (Impact: {rec['impact_level']})")

    print("--- Verification Complete ---")

if __name__ == "__main__":
    test_api()
