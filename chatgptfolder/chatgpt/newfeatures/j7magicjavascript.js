require('dotenv').config();

//page unit
  // Call the function for each subcontainer
  createStarContainer('descriptionContainer');
  createStarContainer('linkedInContainer');
  createStarContainer('newsletterContainer');
  


async function callApi(transcript, prompt) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/openaiCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript, prompt }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data); // Process the response data as needed
        const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        // Check if content is undefined and return an error message if it is
        if (content === undefined) {
            return "Error: Content is undefined";
        }

        return content;
    } catch (error) {
        console.error('Error calling the API', error);
    }
}


function submitFormDescription() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('descriptionPrompt').value; 
    callApi(transcript, prompt).then(response => {
        document.getElementById('descriptionOutput').value = response;
    });
}

function submitFormLinkedIn() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('linkedInPrompt').value; 
    callApi(transcript, prompt).then(response => {
        document.getElementById('linkedInOutput').value = response;
    });
}

function submitFormNewsletter() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('newsletterPrompt').value; 
    callApi(transcript, prompt).then(response => {
        document.getElementById('newsletterOutput').value = response;
    });
}

function createStarContainer(containerId) {
    // Get the container element by ID
    const container = document.getElementById(containerId);
    
    // Create the star container div and assign an ID
    const starContainer = document.createElement('div');
    starContainer.id = containerId + 'StarContainer';
    
    // Create a table to organize stars in 2 columns
    const table = document.createElement('table');
    for (let i = 0; i < 5; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 2; j++) {
        const cell = document.createElement('td');
        cell.textContent = '☆'; // Unicode for star
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    // ★
    // Append the table to the star container
    starContainer.appendChild(table);
    
    // Append the star container to the main container
    container.appendChild(starContainer);
  }
  
  function getStarCountFromMongoDB(category) {
    const apiKey = process.env.Mongo_API_KEY;
    const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/findOne';
    
    const data = JSON.stringify({
      "collection": "StarCountCollection",
      "database": "J7MagicTool",
      "dataSource": "Cluster0",
      "filter": {
        "name": category
      },
      "projection": {
        "_id": 1,
        "name": 1,
        "starcount": 1
      }
    });
    statusLog += "Data:" + data +"\n";
    const config = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': apiKey
      },
      payload: data
    };
  
    const response = UrlFetchApp.fetch(url, config);
    const responseData = JSON.parse(response.getContentText());
  
    // Process the response data as needed
  
    //return {result: responseData, statusLog: statusLog};
    console.log("responseData:" + responseData)
    return responseData
  }