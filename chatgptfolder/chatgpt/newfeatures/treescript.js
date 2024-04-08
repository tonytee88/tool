let addPointsContainerState = 0; 

document.addEventListener('DOMContentLoaded', async (event) => {
    createCategoryElements();
    incrementCategory();
    await initTrees();
    getAndLoadIdeas();
});

const categories = [
    { name: "Cooking", totalGoal: 50, color: "#FF7F50" }, // Coral
    { name: "Work", totalGoal: 20, color: "#FFD700" }, // Gold
    { name: "Social", totalGoal: 10, color: "#6A5ACD" }, // Slate Blue
    { name: "Give Back", totalGoal: 5, color: "#98FB98" }, // Pale Green

    { name: "Husband Duty", totalGoal: 5, color: "#FF69B4" }, // Hot Pink
    { name: "Fatherhood", totalGoal: 30, color: "#00FA9A" }, // Medium Spring Green
    { name: "Body Health", totalGoal: 50, color: "#4682B4" }, // Steel Blue
    { name: "Home Ownership", totalGoal: 20, color: "#DAA520" }, // Goldenrod

    { name: "Create-Ship", totalGoal: 10, color: "#DA70D6" }, // Orchid
    { name: "Share", totalGoal: 10, color: "#F08080" }, // Light Coral
    { name: "Learn", totalGoal: 5, color: "#20B2AA" }, // Light Sea Green
    { name: "Surprise", totalGoal: 5, color: "#9ACD32" }, // Yellow Green

    { name: "What", totalGoal: 1, color: "#40E0D0" }, // Turquoise
    { name: "Who", totalGoal: 1, color: "#FFA07A" }, // Light Salmon
    { name: "How", totalGoal: 1, color: "#BA55D3" }, // Medium Orchid
    { name: "Why", totalGoal: 1, color: "#FF8C00" }  // Dark Orange
];

function createCategoryElements() {
    const treeContainer = document.querySelector('.treeContainer');
    treeContainer.innerHTML = '';  // Clear existing content

    categories.forEach(category => {
        const treeDiv = document.createElement('div');
        treeDiv.className = 'tree1';

        const treeHead = document.createElement('pre');
        treeHead.className = 'treeHead';
        treeHead.id = `${category.name.toLowerCase()}Head`;
        treeHead.textContent = category.name;
        treeHead.style.color = category.color; // Set the text color for each category
        treeDiv.appendChild(treeHead);

        const trunkContainer = document.createElement('div');
        trunkContainer.className = 'trunkContainer';
        trunkContainer.id = category.name.toLowerCase();
        treeDiv.appendChild(trunkContainer);

        treeContainer.appendChild(treeDiv);
    });
}


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
    for (let category of categories) {
        let count = await treeMongoGetCount(category.name);
        createPreElements(count, category);
    }
}

function createPreElements(count, category) {
    const trunk = document.getElementById(category.name.toLowerCase()); // Get the specific trunkContainer by category

    // Clear any existing content first
    trunk.innerHTML = '';

    // Calculate the proportion of filled blocks out of a total of 10 blocks
    let filledBlockCount = Math.round((count / category.totalGoal) * 10);
    let emptyBlockCount = 10 - filledBlockCount;

    // Now we create our progress bar using these counts
    const progressBar = document.createElement("pre");
    progressBar.innerText = '█'.repeat(filledBlockCount) + '░'.repeat(emptyBlockCount) + ` (${count}/${category.totalGoal})`;

    trunk.appendChild(progressBar);
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

    // Iterate over each category from the categories array
    for (const { name: category, color } of categories) {
        const ideas = await treeMongoFetchIdeas(category);
        const filteredIdeas = ideas.filter(idea => idea.trim() !== "");

        filteredIdeas.forEach(idea => {
            // Create a div element for each idea, applying the color for border
            const ideaTag = document.createElement('div');
            ideaTag.className = 'ideaTag';
            ideaTag.style.border = `2px solid ${color}`;  // Set the border color
            ideaTag.style.color = "#ffffff";  // White text for readability
            ideaTag.innerText = idea;

            // Add event listener for click actions on idea tags
            ideaTag.addEventListener('click', () => {
                const noteInput = document.getElementById('noteInput');
                const categoryDropdown = document.getElementById('categoryDropdown');

                if (addPointsContainerState === 0) {
                    const noteInputContainer = document.getElementById('noteInputContainer');
                    noteInputContainer.insertAdjacentElement('afterend', ideaTag);
                    noteInput.value = idea;
                    categoryDropdown.value = category;
                    ideaTag.style.marginTop = '2px';
                    addPointsContainerState = 1;
                } else if (addPointsContainerState === 1 && ideaTag.parentElement === addPointsContainer) {
                    ideaTag.style.marginTop = '0px';
                    ideasList.appendChild(ideaTag);
                    addPointsContainerState = 0;
                } else if (addPointsContainerState === 1) {
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

            // Append the idea tag to the ideas list
            ideasList.appendChild(ideaTag);
        });
    }
}

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
    const ideas = extractIdeas(savedIdeas); // This should return an array of ideas with categories
    cardsContainer.innerHTML = ''; // Clear out any old cards

    for (const idea of ideas) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-sphere', idea.sphere);
        card.innerText = `${idea.sphere}: ${idea.text}`; 
        cardsContainer.appendChild(card);
    }
});

function getLocalDateForMontreal() {
    // Create a date object in the local timezone
    const date = new Date();

    // Convert the local date to the Montreal timezone
    const options = { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric' };
    const montrealDate = new Intl.DateTimeFormat('en-CA', options).format(date);

    return montrealDate;
}

document.getElementById('preload').addEventListener('click', async () => {
    const preloadButton = document.getElementById('preload');
    const preloadInput = document.getElementById('preloadInput');
    const saveName = "ideas1";

    // Hide the button text
    preloadButton.innerHTML = "";

    // Create the loader element
    const loader = document.createElement('div');
    loader.className = 'loader';

    // Append the loader to the button
    preloadButton.appendChild(loader);
    
    const currentDate = getLocalDateForMontreal();
    const keywords = preloadInput;

    let ideas = await callApi(currentDate, keywords);
    await treeMongoSaveIdeas(saveName, ideas)
    
    // Show the text and remove the loading animation
    preloadButton.removeChild(loader);
    preloadButton.innerHTML = "Preload";
    
    return ideas;
});

function extractIdeas(savedIdeas) {
    let extractedIdeas = [];
    parsedSavedIdeas = JSON.parse(savedIdeas)

    try {
        for (let item of parsedSavedIdeas) {
            for (let idea of item.ideas) {
                extractedIdeas.push({
                    sphere: item.sphere,
                    text: idea.description
                });
            }
        }
    } catch (e) {
        // If there's a problem iterating over savedIdeas
        console.error("Error while extracting ideas:", e);
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