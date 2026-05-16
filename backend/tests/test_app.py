import pytest
from run import App  

@pytest.fixture
def client():
    
    App.config['TESTING'] = True
    
    # Create the test client context
    with App.test_client() as client:
        yield client

def test_health_route(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json == {"status": "healthy"}


def test_protected_route_requires_jwt(client):
    response = client.get('/trading/portfolio')
    assert response.status_code == 401  # Unauthorized
