from flask import Flask
from flask_migrate import Migrate
import os
from extensions import db, jwt
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__) 
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

migrate = Migrate(app, db)
load_dotenv()

app.config['JWT_SECRET_KEY']=os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI']="sqlite:///stock.db"

db.init_app(app)
jwt.init_app(app)

from models import User, Portfolio, Transaction
from app.auth import auth_bp
from app.market_data import market_bp
from app.trading import trading_bp
from app.ai_engine import ai_bp
from app.watchlist import watchlist_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(market_bp, url_prefix='/market')
app.register_blueprint(trading_bp, url_prefix='/trading')
app.register_blueprint(ai_bp, url_prefix='/ai')
app.register_blueprint(watchlist_bp, url_prefix='/watchlist')


if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all()
    app.run(host="0.0.0.0", port=5000)