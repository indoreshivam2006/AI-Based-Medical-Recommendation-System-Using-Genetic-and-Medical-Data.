import requests
r = requests.get(
    'https://api.ai.kodekloud.com/v1/models',
    headers={'Authorization': 'Bearer sk-9M54vEjUmotL6g0irEXVCA'}
)
print("Status:", r.status_code)
print("Response:", r.text[:2000])
