from flask import Flask
from flask_migrate import Migrate
from extensions import db, jwt

app = Flask(__name__) 

migrate = Migrate(app, db)

db.init_app(app)
jwt.init_app(app)



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(host="0.0.0.0", port=5000)