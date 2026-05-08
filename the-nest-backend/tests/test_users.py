import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_profile_requires_auth():
    response = client.get("/api/users/someuser")
    assert response.status_code == 401


def test_search_requires_auth():
    response = client.get("/api/users/search?q=test")
    assert response.status_code == 401
