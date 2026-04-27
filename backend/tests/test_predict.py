import requests
import json

url = "http://localhost:8000/predict"
payload = {
    "Age": 45.0,
    "Gender": "Male",
    "BMI": 28.5,
    "eGFR": 85.0,
    "HbA1c": 6.2,
    "TSH": 2.1,
    "LDL_Cholesterol": 110.0,
    "Diabetes": 0,
    "Hypertension": 0,
    "Heart_Disease": 0
}

response = requests.post(url, json=payload)
print("Request Body:", json.dumps(payload, indent=2))
print("Status Code:", response.status_code)
try:
    print("Response JSON:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Response Text:", response.text)
