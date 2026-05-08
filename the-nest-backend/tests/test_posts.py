import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_feed_requires_auth():
    response = client.get("/api/posts/feed")
    assert response.status_code == 401


def test_create_post_requires_auth():
    response = client.post("/api/posts/", json={"content": "hello"})
    assert response.status_code == 401
