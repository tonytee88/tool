import requests

url = "https://a.klaviyo.com/api/profiles/01F4EZXS5CXV11AQ3ST52M6D9F/"

headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "Authorization": "Klaviyo-API-Key pk_82b65c17369e48a953f59fd31c31c8680d"
}

#response = requests.get(url, headers=headers)

#print(response.text)

###


url = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/"

headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "content-type": "application/json",
    "Authorization": "Klaviyo-API-Key pk_f5d8783cd2f139ee9c078fa25700e11ead"

}

payload = {"data": {
    "type": "profile-subscription-bulk-create-job",
    "attributes": {
      "list_id": "RM5xcr",
      "custom_source": "test zapier",
      "subscriptions": [
        {
          "channels": {
            "email": [
              "MARKETING"
            ],
            "sms": [
              "MARKETING"
            ]
          },
          "email": "otsmane.hocine@gmail.com",
          "phone_number": "+14389782961",
          "profile_id": "01GYT6KFV62AKFXAXATYGBW0MF"
        }
      ]
    }
  }
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)