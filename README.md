# AI-Based Medical Recommendation System

An AI-powered medical recommendation web app with a Next.js frontend and a FastAPI machine learning backend.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Languages](https://img.shields.io/badge/languages-JavaScript%20%7C%20Python-orange)

> Disclaimer: This project is for educational and research purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [Folder Structure](#folder-structure)
- [Folder Organization Recommendations](#folder-organization-recommendations)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Features

- Patient-facing prediction interface built with Next.js.
- FastAPI backend with `/predict` and `/drugs` endpoints.
- Machine learning recommendation pipeline using scikit-learn.
- Drug information catalog for recommended medications.
- Basic and advanced patient input fields, including vitals, labs, lifestyle, and genetic markers.
- Local model artifact loading from trained `.pkl` files.
- Backend test script for validating prediction requests.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion, Lucide React
- Backend: Python, FastAPI, Uvicorn
- Machine Learning: scikit-learn, pandas, NumPy
- Package Managers: npm, pip

## Installation & Setup

### Prerequisites

- Node.js 20 or later
- Python 3.10 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd AI-Based-Medical-Recommendation
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd app
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

## Usage Examples

### Check the backend health endpoint

```bash
curl http://127.0.0.1:8000/
```

### Fetch the drug catalog

```bash
curl http://127.0.0.1:8000/drugs
```

### Send a prediction request with curl

```bash
curl -X POST http://127.0.0.1:8000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"Age\":45,\"Gender\":\"Male\",\"BMI\":28.5,\"eGFR\":85,\"HbA1c\":6.2,\"TSH\":2.1,\"LDL_Cholesterol\":110,\"Diabetes\":0,\"Hypertension\":0,\"Heart_Disease\":0}"
```

### Send a prediction request with Python

```python
import requests

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
    "Heart_Disease": 0,
}

response = requests.post("http://127.0.0.1:8000/predict", json=payload)
print(response.status_code)
print(response.json())
```

## Folder Structure

```text
.
|-- app/
|   |-- public/
|   |-- src/
|   |   `-- app/
|   |       |-- components/
|   |       |-- prediction/
|   |       |-- globals.css
|   |       |-- layout.js
|   |       `-- page.js
|   |-- package.json
|   `-- next.config.mjs
|-- backend/
|   |-- data/
|   |-- ml_pipeline/
|   |-- models/
|   |-- tests/
|   |-- main.py
|   `-- requirements.txt
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Folder Organization Recommendations

- Keep frontend application code in `app/src`.
- Keep backend source code in `backend`.
- Keep reusable backend logic in `backend/src` if the API grows beyond `main.py`.
- Keep tests in `backend/tests` and add `app` tests under `app/src` or `app/tests`.
- Keep documentation in `docs`, such as screenshots, architecture notes, API examples, or model reports.
- Keep utility scripts in `scripts`, such as setup, lint, formatting, data validation, or deployment helpers.
- Keep public frontend assets in `app/public`.
- Keep large datasets, trained model binaries, private notebooks, secrets, and generated outputs out of Git.

Suggested clean structure:

```text
.
|-- app/
|-- backend/
|   |-- src/
|   |-- data/
|   |-- models/
|   |-- ml_pipeline/
|   `-- tests/
|-- docs/
|-- scripts/
|-- .env.example
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Make your changes with clear commit messages.
4. Run relevant checks for the frontend and backend.
5. Open a pull request with a concise description of your changes.

Please do not commit secrets, local virtual environments, dependency folders, large datasets, or generated model binaries.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

- Name: Shivam Indore
- GitHub: [Add your GitHub profile]
- Email: [Add your email]
- LinkedIn: [Add your LinkedIn profile]
