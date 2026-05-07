from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Portfolio, Transaction
import yfinance as yf
from app.utils.leaderboard import update_user_profit

trading_bp = Blueprint('trading', __name__)

@trading_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy_stock():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data.get('ticker') or not data.get('quantity'):
        return jsonify(message='Ticker and quantity are required'), 400
    
    ticker = data.get('ticker').upper()
    try:
        quantity = int(data.get('quantity'))
        if quantity <= 0:
            return jsonify(message='Quantity must be greater than 0'), 400
    except ValueError:
        return jsonify(message='Quantity must be a valid number'), 400

    # get current price
    try:
        stock = yf.Ticker(ticker)
        current_price = stock.fast_info['last_price']
        if current_price is None:
            return jsonify(message=f'Invalid ticker: {ticker}'), 400
    except Exception:
        return jsonify(message=f'Could not fetch price for {ticker}'), 400
    
    total_cost = current_price * quantity

    user = User.query.get(user_id)

    # checking if user have enough balance to buy
    if user.balance < total_cost:
        return jsonify(message=f'Insufficient balance! You need ${total_cost:.2f} but have ${user.balance:.2f}'), 400
    
    user.balance -= total_cost # updating balance

    # updating portfolio 
    holding = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()
    if holding:
        total_quantity = holding.quantity + quantity
        holding.avg_price = ((holding.avg_price * holding.quantity) + total_cost) / total_quantity
        holding.quantity = total_quantity
    else:
        new_holding = Portfolio(user_id=user_id, ticker=ticker, quantity=quantity, avg_price=current_price)
        db.session.add(new_holding)

    # recording transaction
    new_tx = Transaction(user_id=user_id, ticker=ticker, transaction_type='BUY', price=current_price, quantity=quantity)
    db.session.add(new_tx)

    db.session.commit()
    return jsonify({
        "message": f"Successfully bought {quantity} shares of {ticker}",
        "price": round(current_price, 2),
        "total_cost": round(total_cost, 2),
        "new_balance": round(user.balance, 2)
    }), 200

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
            "type": tx.transaction_type,
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
@jwt_required()
def sell_stock():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data.get('ticker') or not data.get('quantity'):
        return jsonify(message='Ticker and quantity are required'), 400
    
    ticker = data.get('ticker').upper()
    quantity_to_sell = int(data.get('quantity'))


    try:
        quantity_to_sell = int(data.get('quantity'))
        if quantity_to_sell <= 0:
            return jsonify(message='Quantity must be greater than 0'), 400
    except ValueError:
        return jsonify(message='Quantity must be a valid number'), 400

    holding = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()

    if not holding or holding.quantity < quantity_to_sell:
        available = holding.quantity if holding else 0
        return jsonify(message=f"You don't have enough shares of {ticker} to sell. Available: {available}"), 400
    
    try:
        stock = yf.Ticker(ticker)
        current_price = stock.fast_info['last_price']
        if current_price is None:
            return jsonify(message=f'Invalid ticker: {ticker}'), 400

    except Exception:
        return jsonify(message="Error fetching current market price."), 500
    
    realized_profit = (current_price - holding.avg_cost) * quantity_to_sell
    
    payout = current_price * quantity_to_sell
    user = User.query.get(user_id)

    try:
        update_user_profit(user_id, user.username, realized_profit)
    except Exception as e:
        print(f"Redis Leaderboard Update Failed: {e}")

    user.balance += payout
    
    if holding.quantity == quantity_to_sell:
        # If selling everything, delete the record from portfolio
        db.session.delete(holding)
    else:
        holding.quantity -= quantity_to_sell

    new_tx = Transaction(
        user_id=user_id, 
        ticker=ticker, 
        transaction_type='SELL', 
        price=current_price, 
        quantity=quantity_to_sell
    )
    db.session.add(new_tx)

    db.session.commit()
    
    return jsonify({
        "message": f"Successfully sold {quantity_to_sell} shares of {ticker}",
        "price": round(current_price, 2),
        "payout": round(payout, 2),
        "realized_profit": round(realized_profit, 2),
        "new_balance": round(user.balance, 2)
    }), 200


@trading_bp.route('/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    holdings = Portfolio.query.filter_by(user_id=user_id).all()
    
    portfolio_data = []
    total_stock_value = 0
    
    for h in holdings:
        try:
            stock = yf.Ticker(h.ticker)
            current_price = stock.fast_info['last_price']
        except:
            current_price = h.avg_price # Fallback
            
        current_val = current_price * h.quantity
        total_stock_value += current_val
        
        # Profit/Loss percentage
        pl_pct = ((current_price - h.avg_price) / h.avg_price) * 100
        
        portfolio_data.append({
            "ticker": h.ticker,
            "shares": h.quantity,
            "avg_cost": round(h.avg_price, 2),
            "current_price": round(current_price, 2),
            "pl": round(pl_pct, 2)
        })

    return jsonify({
        "balance": round(user.balance, 2),
        "portfolio_value": round(total_stock_value, 2),
        "holdings": portfolio_data
    }), 200

@trading_bp.route('/user-profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get user profile info"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "balance": round(user.balance, 2),
        "created_at": user.created_at.strftime('%Y-%m-%d')
    }), 200
