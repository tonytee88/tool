from apiRequests import flows
import requests
import csv

mscp = "pk_c1a68d42dcbba5ea418db3ec6a02fd61ca"
ske = "pk_d39ca1c35ccc14e83e19355ab574d8dab2"

csvheader = ["type","id"]

with open('mscpdata.csv','w',encoding='UTF8',newline='') as f:
    writer = csv.writer(f)
    
    writer.writerow(csvheader)
    writer.writerows(flows(mscp))

print('done')



