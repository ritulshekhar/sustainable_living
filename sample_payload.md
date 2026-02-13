### Simplified API Review - Sample Payload

#### POST `/activities/log`

**Request Body:**
```json
{
  "user_id": 123,
  "travel_km": 50.5,
  "electricity_kwh": 12.2,
  "food_type": "meat"
}
```

**Response Body:**
```json
{
  "user_id": 123,
  "emissions": {
    "travel": 10.1,
    "electricity": 5.49,
    "food": 7.2,
    "total": 22.79
  },
  "recommendation": "Your daily footprint is high. Try using public transport and reducing meat consumption."
}
```

#### GET `/health`

**Response Body:**
```json
{
  "status": "healthy",
  "service": "Sustainability Tracker"
}
```
