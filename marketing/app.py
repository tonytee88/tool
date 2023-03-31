import requests

tonyApiKey = "pk_cc8136a63dc5fbaf8cd2814f303a57f261"

import requests

url = "https://a.klaviyo.com/api/templates/"

payload = {"data": {
        "type": "template",
        "attributes": {
            "name": "test12311",
            "html": "<html><body>hello world</body></html>",
            "text": "hello world",
            "editor_type": "CODE"
        }
    }}
headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "content-type": "application/json",
    "Authorization": f"Klaviyo-API-Key {tonyApiKey}"
}

#response = requests.post(url, json=payload, headers=headers)

#print(response.text)

#####

import requests

url = "https://a.klaviyo.com/api/campaigns/"

payload = {"data": {
        "type": "campaign",
        "attributes": {
            "name": "My new campaign",
            "channel": "email",
            "audiences": {"included": ["VeGyrR"]},
            "send_strategy": {
                "method": "static",
                "options_static": {
                    "datetime": "2023-11-08T00:00:00",
                    "send_past_recipients_immediately": True,
                    "is_local": True
                }
            },
            "tracking_options": {"utm_params": [
                    {
                        "name": "utm_medium",
                        "value": "campaign"
                    }
                ]}
        }
    }}
headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "content-type": "application/json",
    "Authorization": f"Klaviyo-API-Key {tonyApiKey}"
}

#response = requests.post(url, json=payload, headers=headers)

#print(response.text)

########

import requests

url = "https://a.klaviyo.com/api/campaign-message-assign-template/"

payload = {"data": {
        "type": "campaign-message",
        "attributes": {
            "template_id": "YuEZak",
            "id": "01GWHY24WYP5WW3NQW64CPY7CR"
        }
    }}
headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "content-type": "application/json",
    "Authorization": f"Klaviyo-API-Key {tonyApiKey}"
}

#response = requests.post(url, json=payload, headers=headers)

#print(response.text)

import requests

url = "https://a.klaviyo.com/api/campaign-messages/01GWHY24WYP5WW3NQW64CPY7CR/"

payload = {"data": {
        "type": "campaign-message",
        "attributes": {
            "label": "My message name",
            "content": {
                "subject": "Buy our product!",
                "preview_text": "My preview text",
                "from_email": "store@my-company.com",
                "from_label": "My Company",
                #"template_id": "YuEZak",
                #"template_name": "test12311"
            }
        },
        "id": "01GWHY24WYP5WW3NQW64CPY7CR"
    }}
headers = {
    "accept": "application/json",
    "revision": "2023-02-22",
    "content-type": "application/json",
    "Authorization": f"Klaviyo-API-Key  {tonyApiKey}"
}

response = requests.patch(url, json=payload, headers=headers)

print(response.text)