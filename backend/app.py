from flask import Flask
from flask_migrate import Migrate
from extensions import db, jwt

app = Flask(__name__) 

migrate = Migrate(app, db)

db.init_app(app)
jwt.init_app(app)

from app.auth import auth_bp
from app.market_data import market_bp

app.register_blueprint(auth_bp)
app.register_blueprint(market_bp)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(host="0.0.0.0", port=5000)