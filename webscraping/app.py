from flask import Flask, render_template, url_for, request, redirect, flash
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import requests
import random
import json
import time
from utils2 import createAccount, verifyEmailSubscribedToList, verifyFlowIsActive, findProfileId, verifyTestEmailReceived
from flask_sqlalchemy import SQLAlchemy, session

#chrome://net-internals/#sockets

app = Flask(__name__)
app.config['SECRET_KEY'] = '35467854332fgrbn567443tf43g3g1424t654u56y436331113'
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

def findApi(clientName):
        requestedApi = apiKeys.query.filter_by(name=clientName).first()
        return (requestedApi.api)
        
#client1 = {
#"MDI": "pk_d61c54e0fcc68b34c7a0fc1dd6321f4c15", #MDI
#"BOP": "123",
#"SKE": "345"
#}

@app.route("/", methods=["POST", "GET"])
def index():
    return render_template("index.html")

@app.route("/qa", methods=["POST", "GET"])
def qa(): 
    clientName = request.form.get("clientName", "init")
    clientlist = apiKeys.query.all()
                
    if request.method == 'POST':
        landingPage = request.form.get("landingPage")
        projectNumber = request.form.get("projectNumber")
        tonyApi = findApi(clientName)#(clientlist, clientName)##client1 instead of clientlist
        clientName=request.form.get("clientName")
    else:
        return render_template("qa.html", client=clientlist)
    
    emailRandomSuffix = random.randint(10000, 99909)
    emailTest = f"tony+{emailRandomSuffix}@j7media.com"
    
    createAccount(landingPage, emailTest)
    flash(createAccount(landingPage, emailTest))
    if findProfileId(tonyApi, emailTest) == None:
        return render_template("qa.html", printEmailSubbed = f"The landing page {landingPage} seems not connected to the right Klaviyo account. Please make sure to suppress manually the new conversion email {emailTest} and try again")
    else:
        flash("Profile ID found")
        verifyEmailSubscribedToList(tonyApi, emailTest, projectNumber, findProfileId(tonyApi, emailTest))
        flash("Test Email subbed to list")
        verifyFlowIsActive(tonyApi, projectNumber)
        verifyTestEmailReceived(tonyApi, findProfileId(tonyApi, emailTest), emailTest)
        #findClientApi(clientlist, clientName)##client1 instead of clientlist
        findApi(clientName)
        clientApi=findApi(clientName)#findClientApi(clientlist, clientName)#client1 instead of clientlist
        return render_template("qa.html", client=clientApi,
                            printEmailSubbed = verifyEmailSubscribedToList(tonyApi, emailTest, projectNumber, findProfileId(tonyApi, emailTest)),
                            printFlowActive = verifyFlowIsActive(tonyApi, projectNumber),
                            printTestEmailReceived = verifyTestEmailReceived(tonyApi, findProfileId(tonyApi, emailTest), emailTest), 
                            clientName=clientName, tonyApi=clientApi)
    
@app.route("/results")
def results():
    return render_template("results.html")

@app.route("/add", methods=["POST", "GET"])
def add():
    if request.method == "POST": 
        newClientName = request.form.get("newClientName")
        newClientApi = request.form.get("newClientApi")
        newClient = apiKeys(newClientName, newClientApi)
        db.session.add(newClient)
        db.session.commit()
        clientlist = apiKeys.query.all()
        return render_template("add.html",newClientName=newClientName, newClientApi=newClientApi, clientlist=clientlist)
    else:
        clientlist = apiKeys.query.all()
        return render_template("add.html", clientlist=clientlist)

if __name__== "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)