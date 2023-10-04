incrementCategory();
initTrees();

function showGarden() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");
    
    plusContent.style.display = "none";
    treeContainer.style.display = "flex";
}

function showPlus() {
    const plusContent = document.getElementById("plusContent");
    const treeContainer = document.querySelector(".treeContainer");

    treeContainer.style.display = "none";
    plusContent.style.display = "block";
}

function incrementCategory() {
    const dropdown = document.getElementById("categoryDropdown");
    const selectedCategory = dropdown.value;
    const addOne = document.getElementById("addOne");
    const noteInput = document.getElementById("noteInput");
    const noteValue = noteInput.value
    const add = 1;

    addOne.addEventListener('click', function() {
        console.log("clicked on +1");
        updateMongoAndTrees(selectedCategory, add, noteValue);
    });
}

async function updateMongoAndTrees(selectedCategory, add, noteValue) {
    await treeMongoAdd(selectedCategory, add, noteValue)
    initTrees();
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

    for (let i = 0; i < count; i++) {
        const preElement = document.createElement("pre");
        preElement.innerText = "|   |"; // ASCII representation for a tree trunk segment. Adjust as needed.
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
        
        // Check if the count property is available in the data
        if (data.count !== undefined) {
            return data.count;
        } else {
            console.error('Count not found in the response data');
            return 0;  // Return 0 or any default value if count is not found
        }
        
    } catch (error) {
        console.error('Error calling the API', error);
        return 0;  // You may choose to return 0 or any other default value in case of error
    }
}
