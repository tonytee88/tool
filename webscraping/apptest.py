from flask_sqlalchemy import SQLAlchemy, session
from flask import Flask, render_template, url_for, request, redirect, flash
from utils2 import convertDataToDict

app = Flask(__name__)
app.config['SECRET_KEY'] = '35467854332fgrbn56741241321321443tf43g3g4t654u56y3'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clientapi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class apiKeys(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    api = db.Column(db.String(100), unique=True, nullable=False)
    
    def __init__(self, name, api):
        self.name = name
        self.api = api

#with app.app_context():
    #for key1 in apiKeys.query.filter_by(name="MDI").first():
        #print(key1.__dict__)

def findApi(clientName):
    with app.app_context():
        requestedApi = apiKeys.query.filter_by(name=clientName).first()
        print(requestedApi.api)

findApi("tnoyaaaa")

if __name__== "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)