import requests
import csv

def flows(apiKey):
    url = "https://a.klaviyo.com/api/flows/"
    
    headers = {
        "accept": "application/json",
        "revision": "2022-10-17",
        "Authorization": f"Klaviyo-API-Key {apiKey}"
    }

    response = requests.get(url, headers=headers)
    
    myjson = response.json()
    
    ourdata = []

    for x in myjson["data"]:
        listing = [x["type"], x["id"]]
        ourdata.append(listing)
    
       
    return ourdata