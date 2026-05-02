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

    # get current price
    stock = yf.Ticker(ticker)
    current_price = stock.fast_info['last_price']
    total_cost = current_price*quantity

    user = User.query.get(user_id)

    # checking if user have enough balance to buy
    if user.balance < total_cost:
        return jsonify(message='Insignificant fund! Reduce the quantity..'), 400
    
    user.balance -= total_cost # updating balance

    # updating portfolio 
    holding = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()
    if holding:
        total_quantity = holding.quantity + quantity
        holding.avg_price = ((holding.avg_price * holding.quantity) + total_cost) / total_quantity
    else:
        new_holding = Portfolio(user_id=user_id, ticker=ticker, quantity=quantity, avg_price=current_price)
        db.session.add(new_holding)

    # recording transaction
    new_tx = Transaction(user_id=user_id, ticker=ticker, transaction_type='BUY', price=current_price, quantity=quantity)
    db.session.add(new_tx)

    db.session.commit()
    return jsonify(message=f"Successfully bought {quantity} shares of {ticker}"), 200