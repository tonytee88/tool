let addPointsContainerState = 0; 
let categories = [];
console.log("updated13-jan1")
document.addEventListener("DOMContentLoaded", async () => {
    // const noteInput = document.getElementById("noteInput");
    // const autocompleteList = document.getElementById("autocompleteList");
    // const STATIC_NOTE = "Combo 7W+"; // Static note always shown first

    // if (!noteInput || !autocompleteList) {
    //     console.error("Error: Input or autocomplete list not found!");
    //     return;
    // }

    // function getRecentNotes() {
    //     return JSON.parse(localStorage.getItem("recentNotes")) || [];
    // }

    // function saveNoteHistory(note) {
    //     let notes = getRecentNotes();
    //     if (!notes.includes(note) && note !== STATIC_NOTE) {
    //         notes.unshift(note);
    //     }
    //     if (notes.length > 5) {
    //         notes = notes.slice(0, 5);
    //     }
    //     localStorage.setItem("recentNotes", JSON.stringify(notes));
    // }

    // function showAutocomplete() {
    //     let notes = getRecentNotes();
    //     autocompleteList.innerHTML = ""; // Clear existing list

    //     // Add static note first
    //     const staticItem = document.createElement("div");
    //     staticItem.classList.add("autocomplete-item");
    //     staticItem.textContent = STATIC_NOTE;
    //     staticItem.addEventListener("click", () => {
    //         noteInput.value = STATIC_NOTE;
    //         autocompleteList.style.display = "none";
    //     });
    //     autocompleteList.appendChild(staticItem);

    //     // Show stored notes
    //     notes.forEach(note => {
    //         const item = document.createElement("div");
    //         item.classList.add("autocomplete-item");
    //         item.textContent = note;
    //         item.addEventListener("click", () => {
    //             noteInput.value = note;
    //             autocompleteList.style.display = "none";
    //         });
    //         autocompleteList.appendChild(item);
    //     });

    //     if (autocompleteList.children.length > 0) {
    //         autocompleteList.style.display = "block"; // Show dropdown
    //     }
    // }

    // noteInput.addEventListener("focus", showAutocomplete);

    // document.addEventListener("click", (e) => {
    //     if (!noteInput.contains(e.target) && !autocompleteList.contains(e.target)) {
    //         autocompleteList.style.display = "none";
    //     }
    // });

    // document.getElementById("addOne").addEventListener("click", () => {
    //     const note = noteInput.value.trim();
    //     if (note) {
    //         saveNoteHistory(note);
    //         noteInput.value = "";
    //     }
    // });
    
    await getCategories1(); // Fetch and set categories globally
    //console.log(categories);

    populateCategoryDropdowns();
    createCategoryElements();
    incrementCategory();
    await initTrees();
    getAndLoadIdeas();

});

const categoriesForNewRun = [
    { name: "Cooking", totalGoal: 6, color: "#FF7F50" }, // Coral - Trouver 10 recettes qui vont s'ajouter à ma rotation
    { name: "Work", totalGoal: 5, color: "#FFD700" }, // Gold - Embarquer sur 5 projets extra-work qui vont m'amener plus loin
    { name: "Social", totalGoal: 5, color: "#6A5ACD" }, // Slate Blue - Trouver 5 thématiques de discussion et partager avec des humains
    { name: "Give Back", totalGoal: 2, color: "#98FB98" }, // Pale Green

    { name: "Husband Duty", totalGoal: 3, color: "#FF69B4" }, // Hot Pink - Trouver 3 manières d'être un meilleur mari
    { name: "Fatherhood", totalGoal: 5, color: "#00FA9A" }, // Medium Spring Green - Intentionnellement avoir une expérience avec les enfants
    { name: "Body Health", totalGoal: 65, color: "#4682B4" }, // Steel Blue
    { name: "Home Ownership", totalGoal: 12, color: "#DAA520" }, // Goldenrod - Faire une liste des choses à faire weekly et exécuter, +1 si réussi

    { name: "Learn", totalGoal: 5, color: "#20B2AA" }, // Light Sea Green - Apprendre 5 nouvelles choses intentionnellement et écrire mes apprentissages

    { name: "What-Who-How-Why", totalGoal: 1, color: "#40E0D0" }, // Turquoise
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

        treeHead.addEventListener('click', async () => {
            document.getElementById('history').innerHTML = '';  // Clear the history div
            const notes = await fetchCategoryNotes(category.name);
            displayNotes(notes);
        });

        const trunkContainer = document.createElement('div');
        trunkContainer.className = 'trunkContainer';
        trunkContainer.id = category.name.toLowerCase();
        treeDiv.appendChild(trunkContainer);

        treeContainer.appendChild(treeDiv);
    });
}

async function fetchCategoryNotes(categoryName) {
    try {
        const response = await fetch(
            `https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=getNotes&category=${encodeURIComponent(categoryName)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching category notes:', error);
        throw error;
    }
}

function displayNotes(notes) {
    const historyContainer = document.getElementById('history');
    // Sort notes by date, earliest first, and filter out unwanted notes
    const filteredNotes = notes.filter(note => note.activityNote !== "Sample activity note");
    filteredNotes.sort((a, b) => new Date(a.dateStamp) - new Date(b.dateStamp));

    filteredNotes.forEach(note => {
        const entry = document.createElement('div');
        entry.className = 'historyEntry';
        // Display date first, then activity note
        entry.textContent = `${note.dateStamp} - ${note.activityNote}`;
        historyContainer.appendChild(entry);
    });
}

function populateCategoryDropdowns() {
    const categoryDropdown = document.getElementById("categoryDropdown");
    const categoryDropdownForIdeas = document.getElementById("categoryDropdownForIdeas");

    // Empty existing options
    categoryDropdown.innerHTML = '';
    categoryDropdownForIdeas.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;

        const optionForIdeas = option.cloneNode(true); // Clone the option for the second dropdown

        categoryDropdown.appendChild(option);
        categoryDropdownForIdeas.appendChild(optionForIdeas);
    });
}

function showGarden() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");
    const wallContent = document.getElementById("wallContent");
    const historyContainer = document.getElementById("history");
    
    getAndLoadIdeas();
    plusContent.style.display = "none";
    exploreContent.style.display = "none";
    treeContainer.style.display = "grid";
    wallContent.style.display = "none";
    historyContainer.style.display = "block";
}

function showPlus() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");
    const wallContent = document.getElementById("wallContent");
    const historyContainer = document.getElementById("history");

    treeContainer.style.display = "none";
    exploreContent.style.display = "none";
    plusContent.style.display = "block";
    wallContent.style.display = "none";
    historyContainer.style.display = "none";
}

function showExplore () {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");
    const wallContent = document.getElementById("wallContent");
    const historyContainer = document.getElementById("history");

    treeContainer.style.display = "none";
    exploreContent.style.display = "block";
    plusContent.style.display = "none";
    wallContent.style.display = "none";
    historyContainer.style.display = "none";}

function showWall () {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    const exploreContent = document.getElementById("exploreContent");
    const wallContent = document.getElementById("wallContent");
    const historyContainer = document.getElementById("history");

    treeContainer.style.display = "none";
    exploreContent.style.display = "none";
    plusContent.style.display = "none";
    wallContent.style.display = "block";
    historyContainer.style.display = "none";
    loadWall();
}

let selectedFile = null;

function handlePhotoSelection(event) {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        console.log("Photo selected:", selectedFile.name);
        // You can add additional UI feedback here
    }
}

const galleryInput = document.createElement("input");
galleryInput.type = "file";
galleryInput.accept = "image/*";

const selectPhotoButton = document.getElementById("selectPhoto");
selectPhotoButton.onclick = function() {
    galleryInput.click();
};

galleryInput.onchange = handlePhotoSelection;

async function handlePhotoUpload(file) {
    if (!file) {
        console.error('No file provided for upload.');
        return;
    }
    
    // Generate a unique filename using the current timestamp and original file name
    const fileName = `${Date.now()}_${file.name}`;
    console.log("File name: "+fileName);
    const fileType = file.type;
    console.log("File type: "+fileType);
    try {
        // Request a pre-signed URL from your server
        const response = await fetch('https://j7-magic-tool.vercel.app/api/s3PhotoUpload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName, fileType }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const { preSignedUrl, fileUrl } = await response.json();
        // Check if the pre-signed URL and file URL are received correctly
        if (!preSignedUrl || !fileUrl) {
            throw new Error('Pre-signed URL or file URL is missing in the response');
        }

        // Upload the file directly to S3 using the pre-signed URL
        const uploadResponse = await fetch(preSignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': fileType,
            },
            body: file,
        });

        // Check if the upload was successful
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();  // Get detailed error message
            console.error(`Failed to upload file. Server responded with ${uploadResponse.status}: ${errorText}`);
            throw new Error(`Failed to upload file. Server responded with ${uploadResponse.status}: ${errorText}`);
        }

        console.log('File uploaded:', fileUrl);
        return fileUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        // Depending on your application's structure, you might want to handle this error further (e.g., user notification).
        throw error;
    }
}

function incrementCategory() {
    const addOne = document.getElementById("addOne");
      
    addOne.addEventListener('click', async function() {
        const dropdown = document.getElementById("categoryDropdown");
        const selectedCategory = dropdown.value;
        const noteInput = document.getElementById("noteInput");
        const noteValue = noteInput.value;
        console.log("noteValue:" + noteValue)
        const add = 1;

        let photoUrl = "";

        // If a photo is selected, upload it
        if (selectedFile) {
            photoUrl = await handlePhotoUpload(selectedFile);
            selectedFile = null; // Reset the selected file
        }

        const addPointsContainer = document.getElementById('addPointsContainer');
        const ideaTag = addPointsContainer.querySelector('.ideaTag');

        if (ideaTag) {
            const ideaValue = ideaTag.innerText;
            ideaTag.remove();

            // Delete data in mongo
            await treeMongoDeleteIdea(selectedCategory, ideaValue);
            addPointsContainerState = 0;
            await getAndLoadIdeas();
        }

            // Now you include the photo URL in your update
            await updateMongoAndTrees(selectedCategory, add, noteValue, photoUrl);
            noteInput.value = "";

            // Show success feedback with a checkmark
            addOne.innerHTML = "<span style='color: green;'>✔️</span>";
            addOne.disabled = true; // Optionally disable the button to prevent multiple clicks

            // Revert the button back to its original state after 5 seconds
            setTimeout(() => {
                addOne.innerHTML = "+1";
                addOne.disabled = false; // Re-enable the button
            }, 5000);

        });
    };


async function updateMongoAndTrees(selectedCategory, add, noteValue, photoUrl) {
    try {
        await treeMongoAdd(selectedCategory, add, noteValue, photoUrl);
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

    // Determine the filled and empty block counts
    let filledBlockCount;
    if (count >= category.totalGoal) {
        filledBlockCount = 10; // Full progress if current score is greater than or equal to total goal
    } else {
        filledBlockCount = Math.round((count / category.totalGoal) * 10);
    }
    let emptyBlockCount = 10 - filledBlockCount;

    // Create a span for the filled part of the progress bar to apply color
    const filledSpan = document.createElement("span");
    filledSpan.style.color = category.color; // Set color from the category
    filledSpan.innerText = '█'.repeat(filledBlockCount);

    // Create the progress bar text
    const progressBar = document.createElement("pre");
    progressBar.appendChild(filledSpan); // Add the colored filled part
    progressBar.append('░'.repeat(emptyBlockCount) + ` (${count}/${category.totalGoal})`); // Add the empty part and the text

    trunk.appendChild(progressBar);
}

async function initializeCategoryDocuments(categoriesForNewRun) {
    const endpointUrl = 'https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=create';
    
    for (const category of categoriesForNewRun) {
        console.log(category.name);
        try {
            const initialNote = []; // Starting with an empty notes array

            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: category.name,
                    count: 0, // Initializing count to 0
                    totalGoal: category.totalGoal,
                    notes: [{
                        activityNote: "Sample activity note",
                        photoUrl: "https://example.com/sample-photo.jpg",
                        dateStamp: "APR-08-2024"
                      }]
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Response for ${category.name}:`, data.message);
        } catch (error) {
            console.error(`Error initializing category ${category.name}:`, error);
        }
    }
}

async function storeCategories(categoriesForNewRun) {
    const endpointUrl = 'https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=storeCategories';
    
    try {
        console.log("Storing categories for new run...");
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categoriesForNewRun }), // Pass the categories array
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Categories stored successfully:", data.message);
    } catch (error) {
        console.error("Error storing categories:", error);
    }
}

async function getCategories1() {
    // this function gets the categories based on the activeTree in mongoDB
    const endpointUrl = 'https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=getCategories'; // Update with the correct endpoint
    try {
        const response = await fetch(endpointUrl, {
            method: 'GET', // Assuming the serverless function expects a GET request
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        categories = data.categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function treeMongoAdd(category, add, note, photoUrl) {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=addNote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, add, note, photoUrl }),
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=getCategoryCount', {
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoIdeas?operation=add', {
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

        const filteredIdeas = ideas.filter(idea => idea.trim() !== "" && idea !== "Sample activity note");

        filteredIdeas.forEach((idea) => {
            let uniqueIdentifier = `${category.replace(/\s+/g, '-')}-${Date.now()}`;

            // Create a div element for each idea, applying the color for border
            const ideaTag = document.createElement('div');
            ideaTag.className = 'ideaTag';
            ideaTag.style.border = `2px solid ${color}`;  // Set the border color
            ideaTag.style.color = "#ffffff";  // White text for readability
            ideaTag.innerText = idea;
            ideaTag.setAttribute('draggable', true);
            ideaTag.setAttribute('id', `idea-${uniqueIdentifier}`);
            //console.log(uniqueIdentifier);

            // Append the idea tag to the ideas list
            ideasList.appendChild(ideaTag);
            setupDragListeners(ideaTag, category);

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
                    noteInput.value = "";
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoIdeas?operation=get', {
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
        if (data.ideas && Array.isArray(data.ideas)) {
            return data.ideas;
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoIdeas?operation=get', {
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoIdeas?operation=delete', {
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
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoIdeas?operation=save', {
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

//Wall MPGI
//find active tree + fetchNotesFromActiveTree : return object with activity note, photourl, date, category
async function treeMongoGetNotes() {
    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=getNotes', {
            method: 'GET', // Should likely be a GET request if fetching data
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Expecting an array of notes as the response
        const notes = await response.json();
        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];  // Return an empty array in case of error
    }
}

//create card + id and classes
function createCard(note) {
    const card = document.createElement('div');
    card.className = 'noteCard';
    card.innerHTML = `
        <div class="notePhoto"><img src="${note.photoUrl}" alt="Photo"></div>
        <div class="noteText">${note.activityNote}</div>
        <div class="noteDate">${note.dateStamp}</div>
        <div class="noteCategory">${note.category}</div>
    `;
    return card;
}

//function loadWall
async function loadWall() {
    const wallContent = document.getElementById('wallContent');
    wallContent.innerHTML = ''; // Clear existing content

    const notes = await treeMongoGetNotes();

    // Filter notes based on photoUrl and activityNote
    const filteredNotes = notes.filter(note => {
        const hasValidPhotoUrl = note.photoUrl && note.photoUrl.includes("mpgi-bucket.s3.amazonaws.com/images");
        const hasValidActivityNote = note.activityNote && note.activityNote !== "Sample activity note";
        return hasValidPhotoUrl && hasValidActivityNote;
    });

    // Create and append cards for each filtered note
    filteredNotes.forEach(note => {
        const card = createCard(note);
        wallContent.appendChild(card);
    });
}


const garbageBin = document.getElementById('garbageBin');
garbageBin.addEventListener('dragover', event => {
    event.preventDefault(); // Necessary to allow dropping
});

garbageBin.addEventListener('drop', async event => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const ideaTag = document.getElementById(id);

    if (ideaTag) {
        // Extracting category and idea text from the tag
        const idParts = id.split('-');
        const categoryIndex = idParts.length - 2;
        const category = idParts[categoryIndex];
        const idea = ideaTag.innerText;
        console.log("trying to delete:" +idea + category);
        // API call to delete the idea
        await treeMongoDeleteIdea(category, idea);

        // Remove the tag from DOM
        ideaTag.remove();
    }

    garbageBin.classList.remove('highlight');
});

function setupDragListeners(ideaTag) {
    ideaTag.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', event.target.id);
        document.getElementById('garbageBin').classList.add('highlight');
    });

    ideaTag.addEventListener('dragend', () => {
        document.getElementById('garbageBin').classList.remove('highlight');
    });
}

async function sendChat() {
    const chatInput = document.getElementById('chatInput');
    const chatResponse = document.getElementById('chatResponse');

    const prompt = chatInput.value.trim();
    if (!prompt) {
        alert("Please enter a message to send.");
        return;
    }

    try {
        const response = await fetch('https://j7-magic-tool.vercel.app/api/agenticMongoGet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: prompt })
        }).catch(err => {
            console.error('Fetch error:', err);
            throw err;  // Rethrow to handle it in the outer catch block
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Assuming the server returns data in the format { results: [{ idea, tagline }, ...] }
        if (data.results && data.results.length > 0) {
            // Constructing a response string from results
            const responseText = data.results.map(result => `${result.idea} - ${result.tagline}`).join('\n');
            chatResponse.innerText = responseText;
        } else {
            chatResponse.innerText = 'No results found.';
        }
        
        chatInput.value = ''; // Clear input after sending
    } catch (error) {
        console.error('Error sending chat:', error);
        chatResponse.innerText = 'Error: ' + error.message;
    }
}

function submitData() {
    var idea = document.getElementById('ideaInput').value;
    var tagline = document.getElementById('taglineInput').value;

    createIdea(idea, tagline);
  }

  // Example function to post data via API
  async function createIdea(idea, tagline) {
    const endpointUrl = 'https://j7-magic-tool.vercel.app/api/agenticAiCreate'; // Change to your actual domain

    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idea: idea,
                tagline: tagline
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Response:`, data.message);
    } catch (error) {
        console.error(`Error creating idea:`, error);
    }
}

document.getElementById('initializeCategories').addEventListener('click', async () => {

    try {
        // First, store the categories
        console.log("Starting category initialization test...");
        await storeCategories(categoriesForNewRun);
        
        // Then initialize the documents for each category
        console.log("Creating individual category documents...");
        await initializeCategoryDocuments(categoriesForNewRun);
        
        console.log("Test initialization completed successfully!");
        
        // Optional: Fetch and display the categories to verify
        const response = await fetch('https://j7-magic-tool.vercel.app/api/treeMongoNotes?operation=getCategories');
        if (response.ok) {
            const data = await response.json();
            console.log("Verified categories in database:", data);
        }

    } catch (error) {
        console.error("Error during test initialization:", error);
    }
});