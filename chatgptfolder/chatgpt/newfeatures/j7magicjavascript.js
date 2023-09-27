//page unit
  // Call the function for each subcontainer

  let descriptionStarCount = "";
  let linkedInStarCount = "";
  let newsletterStarCount = "";

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

async function createStarContainer(containerId) {
    // Get the container element by ID
    const container = document.getElementById(containerId);
    const category = containerId.replace('Container', '');
    
    // Wait for the star count to be fetched
    const starCount = await fetchStarCount(category);
  
    // Create the star container div and assign an ID
    const starContainer = document.createElement('div');
    starContainer.id = containerId + 'StarContainer';
    
    // Create a table to organize stars in 2 columns
    const table = document.createElement('table');
    for (let i = 0; i < 5; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 2; j++) {
        const cell = document.createElement('td');
        
        // If the index is less than the fetched star count, create a filled star, otherwise create an empty star
        if (i * 2 + j < starCount) {
          cell.textContent = '★'; // Unicode for filled star
        } else {
          cell.textContent = '☆'; // Unicode for empty star
        }
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    
    // Append the table to the star container
    starContainer.appendChild(table);
    
    // Append the star container to the main container
    container.appendChild(starContainer);
    
    // Create and append the star button to the star container
    const starButton = document.createElement('button');
    starButton.innerText = '+';
    starButton.onclick = function() {
        onStarButtonClick(category);
    };
    starContainer.appendChild(starButton);
    
    // Append the star container to the main container
    container.appendChild(starContainer);
}

    function onStarButtonClick(category) {
    // find the right category
    // write +1 in the starcount
    //run the starcreation again to update visual
    //get user input (prompt + response) and store in a new mongodb collection
    //change color of button until textarea is modified
    console.log(`Star button clicked for category: ${category}`);
}

  
  async function callMongoApi(category) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/mongoCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data); // Process the response data as needed
        const content = data;
        // Check if content is undefined and return an error message if it is
        if (content === undefined) {
            return "Error: Content is undefined";
        }

        return content;
    } catch (error) {
        console.error('Error calling the API', error);
    }
}

function submitFormMongo() {
    const category = "description";
    callMongoApi(category).then(response => {
        const starcount = response.document.starcount;
        document.getElementById('descriptionOutput').value = starcount;
    });
}

async function getStarsForCategory(category) {
    const response = await callMongoApi(category);
    const starcount = response.document.starcount;
    return starcount;
}

async function fetchStarCount(category) {
    let starCount = await getStarsForCategory(category);
    
    // if (category === "description") {
    //     descriptionStarCount = starCount;
    // } else if (category === "linkedIn") {
    //     linkedInStarCount = starCount;
    // } else if (category === "newsletter") {
    //     newsletterStarCount = starCount;
    // }

    return starCount;
}
  
