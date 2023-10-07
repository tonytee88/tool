let addPointsContainerState = 0; 

document.addEventListener('DOMContentLoaded', (event) => {
    incrementCategory();
    initTrees();
    getAndLoadIdeas();
});

function showGarden() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");
    
    plusContent.style.display = "none";
    exploreContent.style.display = "none";
    treeContainer.style.display = "flex";
}

function showPlus() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");

    treeContainer.style.display = "none";
    exploreContent.style.display = "none";
    plusContent.style.display = "block";
}

function showExplore () {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");

    treeContainer.style.display = "none";
    exploreContent.style.display = "block";
    plusContent.style.display = "none";
}

function incrementCategory() {
    const addOne = document.getElementById("addOne");

    addOne.addEventListener('click', async function() {
        const dropdown = document.getElementById("categoryDropdown");
        const selectedCategory = dropdown.value;
        const noteInput = document.getElementById("noteInput");
        const noteValue = noteInput.value;
        const add = 1;

        // Check for ideaTag in addPointsContainer
        const addPointsContainer = document.getElementById('addPointsContainer');
        const ideaTag = addPointsContainer.querySelector('.ideaTag');

        if (ideaTag) {
            const ideaValue = ideaTag.innerText; // Assuming the idea text is the innerText of the ideaTag
            ideaTag.remove(); // Delete the ideaTag currently in the addPointsContainer

            // Delete data in mongo
            await treeMongoDeleteIdea(selectedCategory, ideaValue);
            addPointsContainerState = 0;
            // Reload the tags
            await getAndLoadIdeas();
        }

        updateMongoAndTrees(selectedCategory, add, noteValue);
        noteInput.value ="";

        // Add animation to the +1 button
        addOne.classList.add('clicked-animation'); // Assuming you have defined this class in your CSS

        // Remove the animation class after 500ms (or adjust the time based on your desired animation length)
        setTimeout(() => {
            addOne.classList.remove('clicked-animation');
        }, 500);
    });

}

async function updateMongoAndTrees(selectedCategory, add, noteValue) {
    try {
        await treeMongoAdd(selectedCategory, add, noteValue);
        initTrees();
    } catch (error) {
        console.error('Error updating MongoDB and Trees', error);
    }
}

async function initTrees() {
    const categories = ["Husband", "Fatherhood", "Home", "Money", "Brain", "Body"];

    for (let category of categories) {
        let count = await treeMongoGetCount(category);
        createPreElements(count, category);
    }
}

function createPreElements(count, category) {
    const trunk = document.getElementById(category.toLowerCase()); // get the specific trunkContainer by category

    // Clear any existing trunks first, this will prevent duplicating trunks every time you initialize
    trunk.innerHTML = ''; 

    for (let i = 0; i < count; i++) {
        const preElement = document.createElement("pre");
        preElement.innerText = "|   |"; // ASCII representation for a tree trunk segment. Adjust as needed.
        
        // This will prepend (or insert at the beginning) the new trunk segment
        trunk.appendChild(preElement);
    }
}


async function treeMongoAdd(category, add, note) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoAdd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, add, note }),
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

async function treeMongoGetCount(category) {

    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoGetCount', {
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
        //console.log(data)
        // Check if the count property is available in the nested document object
        if (data.document && data.document.count !== undefined) {
            return data.document.count;
        } else {
            console.error('Count not found in the response data');
            return 0;  // Return 0 or any default value if count is not found
        }
    } catch (error) {
        console.error('Error calling the API', error);
        return 0;  // You may choose to return 0 or any other default value in case of error
    }
}

const submitButton = document.getElementById('submitIdea');
submitButton.addEventListener('click', async () => {
    const idea = document.getElementById('idea').value;
    const category = document.getElementById('categoryDropdownForIdeas').value;

    if (idea.trim() !== "") {
        await treeMongoAddNotebookIdeas(category, idea);
        document.getElementById('idea').value = '';  // Clear the input
        getAndLoadIdeas();
    } else {
        alert("Please enter a note!");
    }
});

async function treeMongoAddNotebookIdeas(category, idea) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoAddNotebookIdeas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, idea }),
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

async function getAndLoadIdeas() {
    const ideasList = document.getElementById('ideasList');
    const addPointsContainer = document.getElementById('addPointsContainer');

    // Clear previous ideas
    ideasList.innerHTML = '';

    for (const category of Object.keys(categoryColors)) {
        const ideas = await treeMongoFetchIdeas(category);
        const filteredIdeas = ideas.filter(idea => idea.trim() !== "");
        
        filteredIdeas.forEach(idea => {
            const ideaTag = document.createElement('div');
            ideaTag.className = 'ideaTag';
            ideaTag.style.backgroundColor = categoryColors[category];
            ideaTag.innerText = idea;

            ideaTag.addEventListener('click', () => {
                console.log("you clicked me once!");
                const noteInput = document.getElementById('noteInput');
                const categoryDropdown = document.getElementById('categoryDropdown');

                // If there's no ideaTag in addPointsContainer, move the clicked ideaTag there
                if (addPointsContainerState === 0) {
                    const noteInputContainer = document.getElementById('noteInputContainer');
                    noteInputContainer.insertAdjacentElement('afterend', ideaTag);
                    noteInput.value = idea;
                    categoryDropdown.value = category;
                    ideaTag.style.marginTop = '2px';
                    addPointsContainerState = 1;
                } 
                // If there's an ideaTag inside addPointsContainer and it's the clicked one, move it back to ideasList
                else if (addPointsContainerState === 1 && ideaTag.parentElement === addPointsContainer) {
                    ideaTag.style.marginTop = '0px';
                    ideasList.appendChild(ideaTag);
                    addPointsContainerState = 0;
                } 
                // If another ideaTag was inside addPointsContainer, replace it
                else if (addPointsContainerState === 1) {
                    const existingIdeaTag = addPointsContainer.querySelector('.ideaTag');
                    existingIdeaTag.style.marginTop = '0px';
                    ideasList.appendChild(existingIdeaTag);
                    
                    const noteInputContainer = document.getElementById('noteInputContainer');
                    noteInputContainer.insertAdjacentElement('afterend', ideaTag);
                    noteInput.value = idea;
                    categoryDropdown.value = category;
                    ideaTag.style.marginTop = '2px';
                }
            });
            
            ideasList.appendChild(ideaTag);
        });
    }
}

const categoryColors = {
    "Husband": "#f28d35",  // Example color
    "Fatherhood": "#35a2f2",
    "Home": "#9ef235",
    "Money": "#e835f2",
    "Brain": "#35f2a2",
    "Body": "#f23572",
    // ... Add more categories and colors if needed
};

async function treeMongoFetchIdeas(category) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoFetchIdeas', {
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
        // Check if the ideas property is available in the nested document object
        if (data.document && Array.isArray(data.document.ideas)) {
            return data.document.ideas;
        } else {
            console.error('Ideas array not found in the response data');
            return [];  // Return an empty array if ideas are not found
        }
    } catch (error) {
        console.error('Error calling the API', error);
        return [];  // Return an empty array in case of error
    }
}

async function treeMongoFetchSavedIdeas(saveName) {
    console.log(saveName);
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoFetchSavedIdeas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ saveName }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        // Check if the ideas property is available in the nested document object
        if (data.document.savedIdeas) {
            console.log(data.document.savedIdeas);
            return data.document.savedIdeas;
        } else {
            console.error('Ideas array not found in the response data');
            return [];  // Return an empty array if ideas are not found
        }
    } catch (error) {
        console.error('Error calling the API', error);
        return [];  // Return an empty array in case of error
    }
}

async function treeMongoDeleteIdea(category, idea) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoDeleteIdea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, idea }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        // Assuming your API sends a confirmation message under 'message' property.
        if (data && data.message) {
            return data.message;
        } else {
            throw new Error('Unexpected response structure from the API');
        }
    } catch (error) {
        console.error('Error calling the API', error);
        return 'Failed to delete the idea';  // Return an error message in case of error
    }
}

async function treeMongoSaveIdeas(saveName, ideas) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoSaveIdeas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ saveName, ideas }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("the data sent to be saved: " + JSON.stringify(data));
        // Assuming your API sends a confirmation message under 'message' property.

    } catch (error) {
        console.error('Error calling the API', error);
        return 'Failed to delete the idea';  // Return an error message in case of error
    }
}

document.getElementById('refreshButton').addEventListener('click', async () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const saveName = "ideas1";
    const savedIdeas = await treeMongoFetchSavedIdeas(saveName);
    const ideas = await extractIdeas(savedIdeas); // This should return an array of ideas with categories

    cardsContainer.innerHTML = ''; // Clear out any old cards

    for (const idea of ideas) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-category', idea.category);
        card.innerText = idea.text; // Assuming there's a text property with the idea's content
        cardsContainer.appendChild(card);
    }
});

document.getElementById('preload').addEventListener('click', async () => {
    const preloadButton = document.getElementById('preload');
    const saveName = "ideas1";

    // Hide the button text
    preloadButton.innerHTML = "";

    // Create the loader element
    const loader = document.createElement('div');
    loader.className = 'loader';

    // Append the loader to the button
    preloadButton.appendChild(loader);
    
    const currentDate = "Oct 6th, 2023";
    const keywords = "love and laughter";

    let ideas = await callApi(currentDate, keywords);
    await treeMongoSaveIdeas(saveName, ideas)
    
    // Show the text and remove the loading animation
    preloadButton.removeChild(loader);
    preloadButton.innerHTML = "Preload";
    
    return ideas;
});

async function extractIdeas(savedIdeas) {
    let extractedIdeas = [];

    try {
        // Attempt to parse the data string
        let data = savedIdeas
        //let data = JSON.parse(savedIdeas);
        // Handle the first format
        if (savedIdeas) {
            console.log("im an array so it works");
            for (let item of data) {
                for (let idea of item.ideas) {
                    extractedIdeas.push({
                        sphere: item.sphere,
                        text: idea
                    });
                }
            }
        }
    } catch (e) {
        // Handle the second format if the above parse fails
        const sections = savedIdeas.split('\n\n');  // Split by double newline to get sections
        for (let section of sections) {
            const lines = section.split('\n');
            const sphere = lines[0].slice(0, -1);  // Removing the colon at the end
            for (let i = 1; i < lines.length; i++) {
                extractedIdeas.push({
                    sphere: sphere,
                    text: lines[i].slice(3)  // Removing the "1. " at the beginning
                });
            }
        }
    }

    return extractedIdeas;
}

async function generateIdeasGPT() {
    ideas = [
        {
            "sphere": "Husband",
            "text": "Spend quality time together at least once a week."
        },
        {
            "sphere": "Fatherhood",
            "text": "Read a bedtime story every night."
        },
        {
            "sphere": "Home",
            "text": "Create a monthly cleaning schedule."
        },
        {
            "sphere": "Money",
            "text": "Create a monthly cleaning schedule."
        },
        {
            "sphere": "Brain",
            "text": "Create a monthly cleaning schedule."
        },
        {
            "sphere": "Body",
            "text": "Create a monthly cleaning schedule."
        },
    ];
    return ideas
}

async function callApi(currentDate, keywords) {
    const submitButton = document.getElementById("preload");
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeOpenAiCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentDate, keywords }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        console.log(content);
        if (content === undefined) {
            return "Error: Content is undefined";
        }

        return content;
    } catch (error) {
        console.error('Error calling the API', error);
    } 
}