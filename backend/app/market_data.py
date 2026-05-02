import yfinance as yf
from flask import Blueprint, jsonify, request
import google.generativeai as genai
import os

market_bp = Blueprint('market', __name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

@market_bp.route('/price/<ticker>', methods=['GET'])
def get_stock_price(ticker):
    """to fetch real-time price for a single ticker"""
    try:
        stock = yf.Ticker(ticker)

        price = stock.fast_info['last_price']
        return jsonify({"ticker": ticker, "price": round(price, 2)}), 200
    
    except Exception as e:
        return jsonify({"error": f"Could not fetch data for {ticker}"}), 400

