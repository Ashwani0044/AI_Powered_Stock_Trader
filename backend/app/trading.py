from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Portfolio, Transaction
import yfinance as yf

trading_bp = Blueprint('trading', __name__)

@trading_bp.route('/buy', methods=['POST'])
@jwt_required
def buy_stock():
    user_id = get_jwt_identity()
    data = request.get_json
    ticker = data.get('ticker').upper()
    quantity = int(data.get('quantity'))