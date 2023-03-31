import asana

client = asana.Client.access_token('1/1200208858117092:170a26a4a74a3421946fa26da29b3ade')

workspacecode = "456872174481206"

result = client.tasks.create_task({"workspace": workspacecode,"name":"TESTAPI3","notes":"ceci est écrit par un robot"}, opt_pretty=True)


