from google import genai
import os
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Portfolio

ai_bp = Blueprint('ai', __name__)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

@ai_bp.route('/diagnose', methods=['GET'])
@jwt_required()
def diagnose_portfolio():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    portfolio = Portfolio.query.filter_by(user_id=user_id).all()

    if not portfolio:
        return jsonify({"analysis": "Your portfolio is empty. Buy some stocks to get an AI diagnosis!"}), 200

  
    holdings_summary = ""
    for item in portfolio:
        holdings_summary += f"- {item.ticker}: {item.quantity} shares (Avg Price: ${item.avg_price})\n"


    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""
                You are a professional Financial Health Advisor. 
                The user has a current cash balance of ${user.balance:.2f}.
                Their current stock holdings are:
                {holdings_summary}

                Please provide:
                1. A 'Health Score' from 1-100.
                2. A brief analysis of their diversification.
                3. One 'Heal' suggestion (what should they do next to improve?).
                Keep the tone professional but encouraging for a student.
                """

        )
        return jsonify({
            "analysis": response.text,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": "Gemini was unable to process the request"}), 500