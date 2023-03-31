from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import requests
import random
import json
import time

#CREATE CONVERSION EMAIL ON LANDING PAGE

def createAccount(landingPage, emailTest):
    ##https://stackoverflow.com/questions/62024144/validate-urls-using-python-and-selenium
    def valid_url(url):
        try:
            req = requests.get(url)
            while req.status_code != requests.codes['ok']:
                  return valid_url(input('Please enter a valid url:'))
        except Exception as ex:
            print(f'Something went wrong: {ex}')
            print('Try again!')
            return valid_url(input('Please enter a valid url:'))


        return url
                
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"

    options = webdriver.ChromeOptions()
    options.headless = True
    options.add_argument(f'user-agent={user_agent}')
    options.add_argument("--window-size=1920,1080")
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--allow-running-insecure-content')
    options.add_argument("--disable-extensions")
    options.add_argument("--proxy-server='direct://'")
    options.add_argument("--proxy-bypass-list=*")
    options.add_argument("--start-maximized")
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--no-sandbox')
    driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))

    driver.get(valid_url(landingPage))
    username = driver.find_element(By.XPATH, "//*[contains(@id, 'first_name')]")
    username.send_keys("Tony Test")

    username = driver.find_element(By.XPATH, "//*[contains(@id, 'last_name')]")
    username.send_keys("Tran Test")

    username = driver.find_element(By.XPATH, "//*[contains(@id, 'email')]")
    username.send_keys(emailTest)

    submit_button = driver.find_element(By.XPATH, "//*[contains(@class, 'kl-private-reset-css')][@type='button']" )
    submit_button.click()

def findProfileId(tonyApi, emailTest):
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
    return testProfileId

    # def getpath(nested_dict, value, prepath=()):
    #     for k, v in nested_dict.items():
    #         path = prepath + (k,)
    #         if v == value: # found value
    #             return path
    #         elif hasattr(v, 'items'): # v is a dict
    #             p = getpath(v, value, path) # recursive call
    #             if p is not None:
    #                 return p    
  
def verifyEmailSubscribedToList(tonyApi, emailTest, projectNumber, testProfileId):
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
                printEmailSubbed = (f"Test email has been subscribed to list containing {projectNumber}")
                return printEmailSubbed 
            else: 
                printEmailSubbed = (f"Error - not subscribed to a list with project number {projectNumber}")
                return printEmailSubbed


#Check if project flow is active and sending emails to emailTest

def verifyFlowIsActive(tonyApi, projectNumber):
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
    
    def search(myDict, lookup):
        for key, value in myDict.items():
            if lookup in value:
                return key
    
    flowId = search(flow_dict, projectNumber)
    
    flow_status_dict = {}

    for value in default_flow_id_dict["data"]:
        flow_status_dict.update({value["attributes"]["status"]: value["attributes"]["name"]})   

    vip_flow_status = search(flow_status_dict, projectNumber)

    # check if account has flow with project number

    if vip_flow_status == "live":
        return (f"Detected : Active flow with project number {projectNumber}")
    else:
        return (f"Error - no active flow with project number {projectNumber}")
    
#Get events for testProfileId for flowId

def verifyTestEmailReceived(tonyApi, testProfileId, emailTest):
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

    if lastEvent[0] or lastEvent[1] or lastEvent[2] or lastEvent[3] or lastEvent[4] or lastEvent[5] or lastEvent[6] or lastEvent[7] or lastEvent[8]  == testProfileId:       
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
        
        return (f"The test email was received by {emailTest} on {lastEvent[1]} and {emailTest} is now suppressed")
         
    else:
        return (f"The test email was never received by {emailTest}")
    
def supressTestEmail (tonyApi, testProfileId, emailTest):
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
    
    return (f"{emailTest} is now suppressed")
         

        
def findClientApi(clientDict, clientName):
    def search(myDict, lookup):
        for key, value in myDict.items():
            if lookup in key:
                return value
    return search(clientDict, clientName)

def addNewClient(clientDict, newClientNAme, newClientApi):
    clientDict.update({"newclientName":"newClientApi"})