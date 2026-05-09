from flask import Flask
from flask_migrate import Migrate
import os
from extensions import db, jwt
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import timedelta

App = Flask(__name__) 
CORS(App, resources={r"/*": {"origins": "http://localhost:5173"}})

migrate = Migrate(App, db)
load_dotenv()

App.config['JWT_SECRET_KEY']=os.getenv('JWT_SECRET_KEY')
App.config['SQLALCHEMY_DATABASE_URI']="sqlite:///stock.db"
App.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7) # Token lasts a week
redis_host = os.environ.get('REDIS_HOST', 'redis') 
App.config['REDIS_URL'] = f"redis://{redis_host}:6379/0"

db.init_app(App)
jwt.init_app(App)

from models import User, Portfolio, Transaction
from app.auth import auth_bp
from app.market_data import market_bp
from app.trading import trading_bp
from app.ai_engine import ai_bp
from app.watchlist import watchlist_bp

App.register_blueprint(auth_bp, url_prefix='/auth')
App.register_blueprint(market_bp, url_prefix='/market')
App.register_blueprint(trading_bp, url_prefix='/trading')
App.register_blueprint(ai_bp, url_prefix='/ai')
App.register_blueprint(watchlist_bp, url_prefix='/watchlist')


if __name__ == '__main__':
    # with App.App_context():
    #     db.create_all()
    App.run(host="0.0.0.0", port=5000)