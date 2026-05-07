from extensions import db
from bcrypt import hashpw, checkpw, gensalt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, JWTManager
from flask_jwt_extended import get_jwt, jwt_required
from datetime import timedelta
from models import User
import redis

auth_bp = Blueprint('auth', __name__)
jwt_redis_blocklist = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify(message='All fields are required!!'), 400
    
    # checking if user already exists in the database..
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify(message='User with this username or email already exists!'), 400
    
    hashed_password = hashpw(password.encode('utf-8'), gensalt())

    user = User(
        username=username,
        email=email,
        password=hashed_password.decode('utf-8')
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(message='User registered successfully!!'), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message='Email and password required'), 400
    
    user = User.query.filter_by(email=email).first()

    if user and checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "balance": user.balance 
            }
        }), 200
    
    return jsonify(message='Invalid credentials!'), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    
    jti = get_jwt()["jti"]

    jwt_redis_blocklist.setex(jti, timedelta(hours=24), "true")

    return jsonify({"msg": "Access token required"}), 200