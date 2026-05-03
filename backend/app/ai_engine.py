from google import genai
import os
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Portfolio, Message
from extensions import db


ai_bp = Blueprint('ai', __name__)
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

MODEL_ID = "gemini-2.0-flash"

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
            model=MODEL_ID,
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

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_with_ai():
    user_id = get_jwt_identity()
    data = request.get_json()
    user_message = data.get('message')

    past_messages = Message.query.filter_by(user_id=user_id)\
        .order_by(Message.created_at.desc())\
        .limit(10).all()
    
    history = []
    for msg in reversed(past_messages):
        history.append({"role": msg.role, "parts": [{"text": msg.content}]})

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    user = User.query.get(user_id)
    portfolio = Portfolio.query.filter_by(user_id=user_id).all()
    holdings = [f"{p.ticker}: {p.quantity} shares" for p in portfolio]
    context = f"User Balance: ${user.balance}. Portfolio: {', '.join(holdings)}."

    system_instruction = f"""
    You are 'Fin-Intel', an elite stock market assistant.
    User Context: {context}
    Rules:
    1. Be concise and professional.
    2. If the user asks about their own stocks, use the provided context.
    3. If they ask for investment advice, give a disclaimer that this is a simulator.
    4. Use the history if the chat given to you to give the best answers.
    5. Use bold text for stock tickers (e.g., **AAPL**).
    """

    try:
        
        chat = client.chats.create(model=MODEL_ID, history=history)

        full_prompt = f"{system_instruction}\n\nUser Question: {user_message}"
        response = chat.send_message(full_prompt)

        # adding new messages to Message class
        new_user_msg = Message(user_id=user_id, role='user', content=user_message)
        new_ai_msg = Message(user_id=user_id, role='model', content=response.text)
        db.session.add_all([new_user_msg, new_ai_msg])
        db.session.commit()

        return jsonify({
            "response": response.text,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": "Chat engine is currently offline"}), 500
