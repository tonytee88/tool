const tonyApiKey = "pk_452de2a70be46e0a24dea659a7b607f586" //tony J7
const msgId = "01GW2E4H1E5E5R58ZTZRMY6DRK"

const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      revision: '2023-02-22',
      Authorization: `Klaviyo-API-Key ${tonyApiKey}`,
    }
};
  
  fetch(`https://a.klaviyo.com/api/campaign-messages/${msgId}/`, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));