//page unit
  // Call the star function for each subcontainer
  createStarContainer('descriptionContainer');
  createStarContainer('linkedInContainer');
  createStarContainer('newsletterContainer');

window.onload = async function() {

    const categories = ['description', 'linkedIn', 'newsletter'];

    for (const category of categories) {
        let textFromMongo = (await getTextFromMongo(category)).document.text;

    // Set the fetched value as the default value of the textarea
    document.getElementById(`${category}Prompt`).value = textFromMongo;
    }
}

async function callApi(transcript, prompt, category) {
    const submitButton = document.getElementById(`submitButton${category}`);
    const originalColor = submitButton.style.color;
    submitButton.style.color = '#4CAF50';

    // Add the loading class to show the spinner
    submitButton.classList.add('loading');  

    try {
        console.log("trying to fetch");
        const response = await fetch('https://j7-magic-tool.vercel.app/api/openaiCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript, prompt }),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Server error:', data.error);
            console.log('Server error:', data.error);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

        if (content === undefined) {
            return "Error: Content is undefined";
        }
        return content;
    } catch (error) {
        console.error('Error calling the API', error);
    } finally {
        // Remove the loading class to hide the spinner once the call is done
        submitButton.classList.remove('loading');
        submitButton.style.color = originalColor;
    }
}

function submitFormDescription() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('descriptionPrompt').value; 
    callApi(transcript, prompt, "Description").then(response => {
        document.getElementById('descriptionOutput').value = response;
    });
    // put the value of prompt field to the one saved on server
    updateTextMongoCall("description", prompt);
}

function submitFormLinkedIn() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('linkedInPrompt').value; 
    callApi(transcript, prompt, "LinkedIn").then(response => {
        document.getElementById('linkedInOutput').value = response;
    });
    updateTextMongoCall("linkedIn", prompt);
}

function submitFormNewsletter() {
    const transcript = document.getElementById('transcript').value;
    const prompt = document.getElementById('newsletterPrompt').value; 
    callApi(transcript, prompt, "Newsletter").then(response => {
        document.getElementById('newsletterOutput').value = response;
    });
    updateTextMongoCall("newsletter", prompt)
}

async function createStarContainer(containerId) {
    // Get the container element by ID
    const container = document.getElementById(containerId);
    const category = containerId.replace('Container', '');
    
    // Wait for the star count to be fetched
    const starCount = await fetchStarCount(category);
  
    // Define the id of the starContainer
    const starContainerId = containerId + 'StarContainer';
  
    // Check if the starContainer already exists
    const existingStarContainer = document.getElementById(starContainerId);
    
    // If it exists, clear its content
    if (existingStarContainer) {
        existingStarContainer.innerHTML = '';
    }

    // Create the star container div and assign an ID
    const starContainer = existingStarContainer || document.createElement('div');
    starContainer.id = starContainerId;
    
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
    if (!existingStarContainer) {
        container.appendChild(starContainer);
    }
    
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

async function onStarButtonClick(category) {
    let prompt = document.getElementById(`${category}Prompt`).value
    let apiresponse = document.getElementById(`${category}Output`).value
    let incrementToAdd = 1;
    // write +1 in the starcount
    await updateStarMongoCall(category, incrementToAdd)
    //run the starcreation again to update visual
    createStarContainer(`${category}Container`);

    //get user input (prompt + response) and store in a new mongodb collection
    pushStarMongoCall(category, prompt, apiresponse)

    //change color of button until textarea is modified
    console.log(`Star button clicked for category: ${category}`);
}

  
  async function findOneMongoCall(category) {
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

async function getTextFromMongo(category) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/mongoCallGetText', {
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

async function updateStarMongoCall(category, add) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/mongoCallAdd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, add }),
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

async function updateTextMongoCall(category, text) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/mongoCallLoadText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, text }),
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

async function pushStarMongoCall(category, prompt, apiresponse) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/mongoCallPushStars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, prompt, apiresponse }),
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
    findOneMongoCall(category).then(response => {
        const starcount = response.document.starcount;
        document.getElementById('descriptionOutput').value = starcount;
    });
}

async function getStarsForCategory(category) {
    const response = await findOneMongoCall(category);
    const starcount = response.document.starcount;
    return starcount;
}

async function fetchStarCount(category) {
    let starCount = await getStarsForCategory(category);
    return starCount;
}
  
