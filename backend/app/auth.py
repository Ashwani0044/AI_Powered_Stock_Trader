from extensions import db
from flask_bcrypt import hashpw, checkpw, gensalt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    pass