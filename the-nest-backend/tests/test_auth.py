import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_endpoint_exists():
    response = client.post("/api/auth/register", json={})
    assert response.status_code in (400, 422)


def test_login_endpoint_exists():
    response = client.post("/api/auth/login", json={})
    assert response.status_code in (400, 422)
