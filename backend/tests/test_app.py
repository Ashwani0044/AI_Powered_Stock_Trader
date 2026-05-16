import pytest
from App import App

@pytest.fixture
def client():
    app = App()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
    
def test_health_route(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json == {"json" : "healthy"}

def test_protected_route_requires_jwt(client):
    response = client.get('/trading/portfolio')
    assert response.status_code == 401
