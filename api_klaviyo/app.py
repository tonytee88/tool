from apiRequests import flows
import requests
import csv

mscp = "pk_c104b4a7bb7f04ce41474ba802748f8946"
ske = "pk_d993312d635a4e55781a7595e1dfcea06b"

csvheader = ["type","id"]

with open('mscpdata.csv','w',encoding='UTF8',newline='') as f:
    writer = csv.writer(f)
    
    writer.writerow(csvheader)
    writer.writerows(flows(mscp))

print('done')



