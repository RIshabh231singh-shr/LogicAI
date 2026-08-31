import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../ai-service')))

try:
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    response = client.get("/health")
    print("Python AI Service Health Response:", response.json())
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    print("[SUCCESS] Python AI Service Health Check Passed!")
except Exception as e:
    print(f"[FAILED] Python AI Service Health Check Failed: {e}")
    sys.exit(1)
