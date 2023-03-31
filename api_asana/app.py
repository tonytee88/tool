import asana

client = asana.Client.access_token('1/1200208858117092:4a721ea4d22136cb0ec8568b6a7e0182')

workspacecode = "456872174481206"

result = client.tasks.create_task({"workspace": workspacecode,"name":"TESTAPI3","notes":"ceci est écrit par un robot"}, opt_pretty=True)