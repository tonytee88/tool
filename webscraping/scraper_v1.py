from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import requests
import random
import json
from selenium.webdriver.common.by import By
import time

# Variables
landingPage = "https://go.mydressin.shop/liste-vip/"

emailRandomSuffix = random.randint(10000, 99909)
emailTest = f"tony+{emailRandomSuffix}@j7media.com"

projectNumber = "222361"

tonyApi = "pk_d61c54e0fcc68b34c7a0fc1dd6321f4c15" #MDI

#"pk_452de2a70be46e0a24dea659a7b607f586" #tony J7

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get(landingPage)

username = driver.find_element(By.XPATH, "//*[contains(@id, 'first_name')]")
username.send_keys("Tony Test")

username = driver.find_element(By.XPATH, "//*[contains(@id, 'last_name')]")
username.send_keys("Tran Test")

username = driver.find_element(By.XPATH, "//*[contains(@id, 'email')]")
username.send_keys(emailTest)

submit_button = driver.find_element(By.XPATH, "//*[contains(@class, 'kl-private-reset-css')][@type='button']" )
submit_button.click()

#find profile_id_string
url = "https://a.klaviyo.com/api/profiles/?sort=-created"

headers = {
    "accept": "application/json",
    "revision": "2022-10-17",
    "Authorization": f"Klaviyo-API-Key {tonyApi}"
}

profile_id = requests.get(url, headers=headers)

profile_id_dict = profile_id.json()

profileId_dict = {}

for value in profile_id_dict["data"]:
    profileId_dict.update({value["id"]: value["attributes"]["email"]})
  
def search(myDict, lookup):
    for key, value in myDict.items():
         if lookup in value:
            return key
        
testProfileId = search(profileId_dict, emailTest)

time.sleep(2)

# def getpath(nested_dict, value, prepath=()):
#     for k, v in nested_dict.items():
#         path = prepath + (k,)
#         if v == value: # found value
#             return path
#         elif hasattr(v, 'items'): # v is a dict
#             p = getpath(v, value, path) # recursive call
#             if p is not None:
#                 return p
            
# check if emailtest is subscribed to list containing project number

url = f"https://a.klaviyo.com/api/profiles/{testProfileId}/lists/"

headers = {
   "accept": "application/json",
   "revision": "2022-10-17",
   "Authorization": f"Klaviyo-API-Key {tonyApi}"
}

response_lists = requests.get(url, headers=headers)

lists_dict = response_lists.json()

profile_dict = {}

for value in lists_dict["data"]:
    profile_dict.update({value["attributes"]["name"]: 0})

for key, value in profile_dict.items():
        if projectNumber in key:
            print(f"Test email has been subscribed to list containing {projectNumber}")
        else: 
            print(f"Error - not subscribed to a list with project number {projectNumber}")

#Check if project flow is active and sending emails to emailTest

url = "https://a.klaviyo.com/api/flows/"

headers = {
    "accept": "application/json",
    "revision": "2022-10-17",
    "Authorization": f"Klaviyo-API-Key {tonyApi}"
}

response = requests.get(url, headers=headers)

default_flow_id_dict = response.json()

flow_list = []

for value in default_flow_id_dict["data"]:
    listing = value["attributes"]["name"]
    flow_list.append(listing)

flow_dict = {} 

for value in default_flow_id_dict["data"]:
    flow_dict.update({value["id"]: value["attributes"]["name"]})
 
flowId = search(flow_dict, projectNumber)
 
flow_status_dict = {}

for value in default_flow_id_dict["data"]:
    flow_status_dict.update({value["attributes"]["status"]: value["attributes"]["name"]})   

vip_flow_status = search(flow_status_dict, projectNumber)

# check if account has flow with project number

if vip_flow_status == "live":
    print(f"Flow with project number {projectNumber} exists")
else:
    print(f"Error - no flow with project number {projectNumber}")

# check if flow is ACTIVE

if vip_flow_status == "live":
    print(f"Flow with {projectNumber} is active")
else:
    print(f"Error - no ACTIVE flow with project number {projectNumber}")

#get events for testProfileId for flowId

time.sleep(2)

url = "https://a.klaviyo.com/api/events/"

headers = {
    "accept": "application/json",
    "revision": "2022-10-17",
    "Authorization": f"Klaviyo-API-Key {tonyApi}"
}

response = requests.get(url, headers=headers)

event_dict = response.json()

event_list = {}

for value in event_dict["data"]:
    event_list.update({value["attributes"]["profile_id"]: value["attributes"]["datetime"]})

lastEvent = list(event_list.items())[0]

if lastEvent[0] == testProfileId:
    print(f"The test email was received by {emailTest} on {lastEvent[1]}")
    print(f"{emailTest} is now suppressed")
    time.sleep(2)

    url = "https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/"

    payload = {"data": {
        "type": "profile-suppression-bulk-create-job",
        "attributes": {"suppressions": [{"email": emailTest}]}
    }}
    headers = {
    "accept": "application/json",
    "revision": "2022-10-17",
    "content-type": "application/json",
    "Authorization": f"Klaviyo-API-Key {tonyApi}"
    }

    response = requests.post(url, json=payload, headers=headers)
    
else:
    print(f"The test email was never received by {emailTest}")
