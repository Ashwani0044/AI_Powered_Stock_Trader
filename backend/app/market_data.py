import yfinance as yf
from flask import Blueprint, jsonify, request
from google import genai
import os
from dotenv import load_dotenv
import redis
import json

market_bp = Blueprint('market', __name__)
load_dotenv()
r = redis.Redis(host='localhost', post=6379, db=0, decode_responses=True)
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel('gemini-pro')

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

@market_bp.route('/price/<ticker>', methods=['GET'])
def get_stock_price(ticker):
    """to fetch real-time price for a single ticker"""
    try:
        stock = yf.Ticker(ticker)

        price = stock.fast_info['last_price'] # using .fast_info which is faster than the .info
        return jsonify({"ticker": ticker, "price": round(price, 2)}), 200
    
    except Exception as e:
        return jsonify({"error": f"Could not fetch data for {ticker}"}), 400

@market_bp.route('/history/<ticker>', methods=['GET'])
def get_stock_history(ticker):
    '''to fetch history of the stock for the charts in frontend'''
    period = request.args.get('period', '1mo') #default to 1 month
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)

        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime('%Y-%m-%d'),
                "price": round(row['Close'], 2)
            })
        return jsonify(data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@market_bp.route('/analyze/<ticker>', methods=['GET'])
def analyze_stock(ticker):
    '''Adding AI : gemini to analyze recent news about the stock'''
    
    ticker = ticker.upper()
    
    # Check Redis Cache First
    cached_data = get_cached_analysis(ticker)
    if cached_data:
        return jsonify({"ticker": ticker, "analysis": cached_data, "source": "cache"}), 200


    try:
        stock = yf.Ticker(ticker)
        news = stock.news[:5] # top 5 news at a time

        if not news:
            return jsonify({"analysis": "No recent news found for this ticker."}), 200
        
        # prompt for gemini
        new_titles = [item['title'] for item in news]

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"Analyze the following news headlines for {ticker} and provide a brief summary(bullish, neutral or bearish) and why: {new_titles}"
        )

        analysis_text = response.text;

        set_cached_analysis(ticker, analysis_text)

        return jsonify({"ticker": ticker, "analysis": response.text}), 200
    
    except Exception.ResourceExhausted as e:
        return jsonify({"error": "AI Rate Limit reached. Please try again in a minute."}), 429
    except Exception as e:
        return jsonify({"error": "AI analysis failed"}), 500
    


@market_bp.route('/info/<ticker>', methods=['GET'])
def get_stock_info(ticker):
    """Combined route for Price, Company Name, and 7-day Chart Data"""
    try:
        stock = yf.Ticker(ticker)
        
        # Get Live Price
        current_price = stock.fast_info['last_price']
        
        # Get Company Name (fallback to Ticker if not found)
        name = stock.info.get('longName', ticker.upper())
        
        # Get History for Chart (7 days, 1-hour intervals)
        hist = stock.history(period="7d", interval="1h")
        chart_data = []
        for index, row in hist.iterrows():
            chart_data.append({
                "time": index.strftime('%m/%d %H:%M'),
                "price": round(row['Close'], 2)
            })

        return jsonify({
            "symbol": ticker.upper(),
            "name": name,
            "currentPrice": round(current_price, 2),
            "chart": chart_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Could not fetch data for {ticker}"}), 400
    

def get_cached_analysis(ticker):
    return r.get(f"analysis:{ticker}")

def set_cached_analysis(ticker, analysis_text):
    r.setex(f"analysis:{ticker}", 3600, analysis_text) # cache for 1 hour (3600 sec)