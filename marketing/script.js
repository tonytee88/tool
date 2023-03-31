const tonyApiKey = "pk_cc8136a63dc5fbaf8cd2814f303a57f261"
const msgId = "01GW2E4H1E5E5R58ZTZRMY6DRK"

const options = {
    method: 'GET',
    headers: {trh
      accept: 'application/json',
      revision: '2023-02-22',
      Authorization: `Klaviyo-API-Key ${tonyApiKey}`,
    }
};
  
  fetch(`https://a.klaviyo.com/api/campaign-messages/${msgId}/`, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));