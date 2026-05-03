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

@trading_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    tx_pagination = Transaction.query.filter_by(user_id=user_id)\
        .order_by(Transaction.timestamp.desc())\
        .paginate(page=page, per_page=per_page)

    results = []
    for tx in tx_pagination.items:
        results.append({
            "ticker": tx.ticker,
            "type": tx.type,
            "price": tx.price,
            "quantity": tx.quantity,
            "date": tx.timestamp.strftime('%Y-%m-%d %H:%M')
        })

    return jsonify({
        "transactions": results,
        "total_pages": tx_pagination.pages,
        "current_page": tx_pagination.page
    }), 200

@trading_bp.route('/sell', methods=['POST'])
@jwt_required
def sell_stock():
    user_id = get_jwt_identity()
    data = request.get_json()
    ticker = data.get('ticker').upper()
    quantity_to_sell = int(data.get('quantity'))

    holding = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()

    if not holding or holding.quantity < quantity_to_sell:
        return jsonify(message=f"You don't have enough shares of {ticker} to sell."), 400
    
    try:
        stock = yf.Ticker(ticker)
        current_price = stock.fast_info['last_price']

    except Exception:
        return jsonify(message="Error fetching current market price."), 500
    
    payout = current_price*quantity_to_sell
    user = User.query.get(user_id)

    user.balance += payout
    
    if holding.quantity == quantity_to_sell:
        # If selling everything, delete the record from portfolio
        db.session.delete(holding)
    else:
        holding.quantity -= quantity_to_sell

    new_tx = Transaction(
        user_id=user_id, 
        ticker=ticker, 
        type='SELL', 
        price=current_price, 
        quantity=quantity_to_sell
    )
    db.session.add(new_tx)

    db.session.commit()
    
    return jsonify({
        "message": f"Successfully sold {quantity_to_sell} shares of {ticker}",
        "payout": round(payout, 2),
        "new_balance": round(user.balance, 2)
    }), 200