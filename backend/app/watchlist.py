from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Watchlist
import yfinance as yf

watchlist_bp = Blueprint('watchlist', __name__)

# This is the list of favorite stocks user added to list to buy or analyze later

@watchlist_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    user_id = get_jwt_identity()
    data = request.get_json()
    ticker = data.get('ticker', '').upper()

    if not ticker:
        return jsonify(message='Ticker is required!'), 400
    
    exists = Watchlist.query.filter_by(user_id=user_id, ticker=ticker).first()
    if exists:
        return jsonify(message='Already in the list!'), 400
    
    new_item = Watchlist(user_id=user_id, ticker=ticker)
    db.session.add(new_item)
    db.session.commit()

    return jsonify(message=f"Added {ticker} to watchlist"), 201

@watchlist_bp.route('/remove/<ticker>', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(ticker):
    user_id = get_jwt_identity()
    item = Watchlist.query.filter_by(user_id=user_id, ticker=ticker.upper()).first()

    if not item:
        return jsonify(message="Stock not found in watchlist"), 404

    db.session.delete(item)
    db.session.commit()
    
    return jsonify(message=f"Removed {ticker} from watchlist"), 200

@watchlist_bp.route('/', methods=['GET'])
@jwt_required()
def view_watchlist():
    user_id = get_jwt_identity()
    items = Watchlist.query.filter_by(user_id=user_id).all()
    
    results = []
    for item in items:
        try:
            # Fetch current price for each watched ticker
            stock = yf.Ticker(item.ticker)
            price = stock.fast_info['last_price']
            results.append({
                "ticker": item.ticker,
                "current_price": round(price, 2)
            })
        except:
            results.append({"ticker": item.ticker, "current_price": "N/A"})

    return jsonify(results), 200
    

