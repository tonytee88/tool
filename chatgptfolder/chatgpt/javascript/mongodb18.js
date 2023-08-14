var clientTraits2;
var foundOneData;
var clientName = document.getElementById("clients").value;

// findAllData
function findAllData() {
    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler(response => {
                //console.log("Success:", response.result); 
                //console.log("statusLog:", response.statusLog);
                documentNamesObj = response.result;
                //console.log("documentNamesObj: " + JSON.stringify(documentNamesObj));
                resolve(documentNamesObj);
            })
            .withFailureHandler(error => {
                console.log("Error:", error);
                reject(error);
            })
            .findAllDataFromMongoDB();
    });
}

const handleFindAllMongoClick = document.getElementById("findAllMongo");

handleFindAllMongoClick.addEventListener("click", function() {
    findAllData()
});

// findOneData
function findOneData(clientName) {
    console.log(clientName);
    google.script.run
  .withSuccessHandler(response => {
    console.log("Success:", response); 
  })
  .withFailureHandler(error => {
    console.log("Error:", error);
  })
  .findOneDataFromMongoDB(clientName);

}

const handleFindOneMongoClick = document.getElementById("findOneMongo");

handleFindOneMongoClick.addEventListener("click", function() {
    var clientName = document.getElementById("clients").value;
    findOneData(clientName);
});


// updateData
function updateData(clientName) {
    google.script.run
  .withSuccessHandler(response => {
    console.log("Success:", response.result); 
    console.log("statusLog:", response.statusLog); 
  })
  .withFailureHandler(error => {
    console.log("Error:", error);
  })
  .updateDataFromMongoDB(clientName);

}

const handleUpdateMongoClick = document.getElementById("updateMongo");

handleUpdateMongoClick.addEventListener("click", function() {
    var clientName = document.getElementById("clients").value;
    updateData(clientName)
});

// createData
function createData(clientName) {
    google.script.run
  .withSuccessHandler(response => {
    console.log("Success:", response.result); 
    console.log("statusLog:", response.statusLog);
    sidebarInit(); 
    statusMessage.textContent = "New client created: "+clientName+".";
  })
  .withFailureHandler(error => {
    console.log("Error:", error);
  })
  .createDataFromMongoDB(clientName);

}

const handleCreateMongoClick = document.getElementById("createMongo");

handleCreateMongoClick.addEventListener("click", function() {
    var clientName = document.getElementById("newClientName").value;
    statusMessage.textContent = "Giving birth...";
    createData(clientName);
});

// deleteData
function deleteData(clientName) {
    google.script.run
  .withSuccessHandler(response => {
    console.log("Success:", response.result); 
    console.log("statusLog:", response.statusLog); 
  })
  .withFailureHandler(error => {
    console.log("Error:", error);
  })
  .deleteDataFromMongoDB(clientName);

}

const handleDeleteMongoClick = document.getElementById("deleteMongo");

handleDeleteMongoClick.addEventListener("click", function() {
    var clientName = document.getElementById("clients").value;
    console.log(clientName);
    deleteData(clientName)
});

//grab the final result object (storedFinalObjectResult)

//Add event listenner
const handleGptMagicButtonClick = document.getElementById("gptMagicButton");
var traitsArray = [];
var simplifiedTraitsArray = [];

handleGptMagicButtonClick.addEventListener("click", function() {
    // Make the API call
    var statusMessage = document.getElementById("statusMessage");
    var traits = document.getElementById("traits").value;
    //traitsArray.push(traits); // push it later after having formatted the input
    var subject = getSubject();
    var lang = getLang();
    var info = getInfo();

    // Set the message to indicate the running state
    statusMessage.textContent = "Talking to ChatGPT...";
    //make an api call to correct the object and return it
    var clientName = document.getElementById("clients").value;
    function findOneDataPromise(clientName) {
    return new Promise((resolve, reject) => {
        google.script.run
        .withSuccessHandler(response => {
            resolve(response);
        })
        .withFailureHandler(error => {
            reject(error);
        })
        .findOneDataFromMongoDB(clientName);
    });
    }
    foundOneData = findOneDataPromise(clientName)
    .then(response => {
    //console.log("Success949:", response);
    foundOneData = response
    //console.log("foundOneData:" +JSON.stringify(foundOneData))
    return response; // Return the response to use it further if needed
    })
    .then(foundOneData => {
    clientTraits = extractTraits(foundOneData);
    //console.log("client traits extracted:" + JSON.stringify(clientTraits));
    clientTraits2 = clientTraits;
    return clientTraits;
    }).then(clientTraits => {
    return new Promise((resolve, reject) => {
        google.script.run
        .withSuccessHandler((response) => {
        //console.log("Success:", response.result);  // Only logs the 'result' part of the response
        //console.log("statusLog:", response.statusLog); // Logs the statusLog for debugging
        globalApiResponse = response.result;  // Only use the 'result' part of the response
        updateStoredFinalObjectResult()
        resolve(response.result);  // Only resolve the 'result' part of the response
        })
        .withFailureHandler((error) => {
        console.log("Error:", error);
        reject(error);
        }).getGPTCorrection(subject, lang, info, promptElements, traitsArray, clientTraits, storedFinalObjectResult);
    })
    .then((result) => {
        statusMessage.textContent = "Translating with ChatGPT...";
        if (lang === "English") {
        // Skip requestTranslation and continue to the next step
        return Promise.resolve(result);
        } else {
        // Proceed with requestTranslation
        return new Promise((resolve, reject) => {
            console.log("Success:", result);
            google.script.run
            .withSuccessHandler((response) => {
                console.log("Success:", response.result);
                console.log("Success:", response.statusLog);
                globalApiResponse = response.result;
                resolve(response.result);
            })
            .withFailureHandler((error) => {
                console.log("Error:", error);
                reject(error);
            })
            .requestTranslation1(result, lang);
        });
        }
    })
    .then((result) => {
        statusMessage.textContent = "Extracting client intel...";
        // Handle the API response
        return new Promise((resolve, reject) => {
        updateTextContentCells(result, optionsCount);
        resolve(result);  
        })
    }).then((result) => {
        return new Promise((resolve, reject) => {
        //console.log(traits);
        //console.log(clientTraits2);
        google.script.run
        .withSuccessHandler((response) => {
        //console.log("Success:", response.result);  // the response.result is an object with the preferences
        //console.log("statusLog:", response.statusLog); // Logs the statusLog for debugging
        resolve(response.result);  // Only resolve the 'result' part of the response
        })
        .withFailureHandler((error) => {
        console.log("Error:", error);
        reject(error);
        }).getGPTTraits(traits, clientTraits2);
        })
    .then((result) => {
        statusMessage.textContent = "Spoon feeding the Brain...";
        return new Promise((resolve, reject) => {
        //upate array with traits from input and from mongoDB
        //console.log(result);
        traitsString = combineTraits(result, clientTraits2);
        const checkCondition = () => {
        const divElement = document.querySelector("#Email-Subject-Line");
        if (traitsString) {
        resolve(traitsString);
        } else {
        console.log("not yet, rechecking...");
        setTimeout(checkCondition, 500);  // Check again after a delay
        }
        };
        checkCondition();
        })
    })
    .then((traitsString) => {
        statusMessage.textContent = "Brain fed, script completed.";
        //console.log(traitsString);
        return new Promise((resolve, reject) => {
        //upate array with traits from input and from mongoDB
        google.script.run.updateDataFromMongoDB(clientName, traitsString);
        resolve(traitsString);  
        })
    })
    .catch((error) => {
        console.error("Error:", error);
        statusMessage.textContent = "Script encountered an error.";
    })
    })
    })
});

const handleMongoDisplayClick = document.getElementById("mongoDisplayButton");

handleMongoDisplayClick.addEventListener("click", function() {
    var clientName = document.getElementById("clientNameStep5").value;
    function findOneDataPromise(clientName) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(response => {
            resolve(response);
          })
          .withFailureHandler(error => {
            reject(error);
          })
          .findOneDataFromMongoDB(clientName);
      });
    }
    foundOneData = findOneDataPromise(clientName)
    .then(response => {
      //console.log("Success949:", response);
      foundOneData = response
      console.log("foundOneData:" +JSON.stringify(foundOneData))
      return response; // Return the response to use it further if needed
    })
    .then(foundOneData => {
      clientTraits = extractTraits(foundOneData);
      //console.log("client traits extracted:" + JSON.stringify(clientTraits));
      clientTraits2 = clientTraits;
      return clientTraits;
    }).then(clientTraits => {
  // Extract and display the traits in the desired format
  const traitsList = document.getElementById("mongoDisplay");
  traitsList.innerHTML = "";
  clientDocument = foundOneData;

    // Display traits
  const traitHeading = document.createElement("h3");
  traitHeading.textContent = "Traits:";
  traitsList.appendChild(traitHeading);

  for (const key in clientTraits) {
    const listItem = document.createElement("li");
    listItem.textContent = `${key}: ${clientTraits[key]}`;
    traitsList.appendChild(listItem);
  }

    // Display upvotes
  const upvoteHeading = document.createElement("h3");
  upvoteHeading.textContent = "Upvotes:";
  traitsList.appendChild(upvoteHeading);

  for (const key in clientDocument.document.upvotes) {
    const listItem = document.createElement("li");
    listItem.textContent = `${key}: ${clientDocument.document.upvotes[key]}`;
    traitsList.appendChild(listItem);
  }

  // Display downvotes
  const downvoteHeading = document.createElement("h3");
  downvoteHeading.textContent = "Downvotes:";
  traitsList.appendChild(downvoteHeading);

  for (const key in clientDocument.document.downvotes) {
    const listItem = document.createElement("li");
    listItem.textContent = `${key}: ${clientDocument.document.downvotes[key]}`;
    traitsList.appendChild(listItem);
  }

})
});