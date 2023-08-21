console.log("BIGUPDATE/MONGODB.JS V1.7.1");

// 1. Overriding the console.log and window.onerror methods:

// Store original console.log function
const originalConsoleLog = console.log;

let logs = [];

console.log = function(...args) {
  const error = new Error();
  let stackLines = error.stack.split('\n');
  let match = stackLines[2].match(/\(([^)]+)\)/);
  let location = match ? match[1] : "window.error"; 

  // Check if location is window.error and update location from error stack
  if (location === "window.error" && typeof args[0] === 'string' && args[0].startsWith("Error stack:")) {
    let stackMatch = args[0].match(/\(([^)]+)\)$/);
    if (stackMatch) {
      location = stackMatch[1];
    }
  }

  storeLog('log', location, ...args);
  originalConsoleLog.apply(console, [location, ...args]);
};

function storeLog(type, ...data) {
    logs.push({
        type: type,
        data: data,
        timestamp: new Date().toISOString()
    });

    while (logs.length > 10) {
        logs.shift();
    }
}
// 2. Creating a "Bug Report" Button:

document.getElementById('goBugReport').addEventListener('click', function() {
  step1.style.display = 'none';
  step2.style.display = 'none';
  step3.style.display = 'none';
  step4.style.display = 'none';
  step5.style.display = 'none';
  step6.style.display = 'none';
  step7.style.display = 'block';
})

document.getElementById('sendBugReport').addEventListener('click', function() {
  function sendBugReport(logs) {
    var title = document.getElementById("bugTitle").value;
    var text = document.getElementById("bugInfo").value;
    var bugReporter = document.getElementById("bugReporter").value;

    var formattedLogs = '';
    for (var i = 0; i < logs.length; i++) {
        var logEntry = logs[i];
        
        var logData;
        if (logEntry.data && Array.isArray(logEntry.data)) {
            logData = logEntry.data.join(' ');
        } else if (logEntry.data) {
            logData = String(logEntry.data);
        } else {
            logData = JSON.stringify(logEntry);  // Default to stringifying the whole log entry
        }
    
        formattedLogs += logEntry.timestamp + ' [' + logEntry.type + '] ' + logData + '\n';
    }

    // Using google.script.run to call the server-side function
    google.script.run
      .withSuccessHandler(function(response) {
        // Handle successful task creation (maybe show a confirmation message to the user)
      })
      .withFailureHandler(function(error) {
        // Handle errors
        console.error(error);
      })
      .createBugReportAsanaTask(title, text, formattedLogs, bugReporter);
  }

  sendBugReport(logs);
  var clientName = document.getElementById("newClientName").value;
  statusMessage.textContent = "Bug reported via Asana. Thank you!";
  step7.style.display = 'none';
  step1.style.display = 'block';
  currentSection = 1;
});

var clientTraits2;
var foundOneData;
var clientName = document.getElementById("clients").value;
var requestedCorrections = document.getElementById("traits").value;

function getDateAndTime() {
  const currentDate = new Date();  
  // Formatting the date and time
  const formattedDate = [
    ("0" + currentDate.getDate()).slice(-2),
    ("0" + (currentDate.getMonth() + 1)).slice(-2),
    currentDate.getFullYear()
  ].join("/");

  const formattedTime = [
    ("0" + currentDate.getHours()).slice(-2),
    ("0" + currentDate.getMinutes()).slice(-2),
    ("0" + currentDate.getSeconds()).slice(-2)
  ].join(":");

  const finalFormat = formattedDate + " " + formattedTime;
  
  return finalFormat
}

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
    //console.log(clientName);
    google.script.run
  .withSuccessHandler(response => {
    //console.log("Success:", response); 
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
function createDataPromise(clientName) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(exists => {
        if (exists) {
          reject("Error: Client with this name already exists.");
          statusMessage.textContent = "Client already exist. If you need to edit existing client, report a bug!";
        } else {
          google.script.run
            .withSuccessHandler(response => {
              resolve(response);
            })
            .withFailureHandler(error => {
              reject(error);
            })
            .createDataFromMongoDB(clientName);
        }
      })
      .withFailureHandler(error => {
        reject("Error while checking if client exists: " + error);
      })
      .doesClientExist(clientName);
  });
}

document.getElementById('startCreateMongoProcess').addEventListener('click', function() {
  step1.style.display = 'none';
  step2.style.display = 'none';
  step3.style.display = 'none';
  step4.style.display = 'none';
  step5.style.display = 'none';
  step7.style.display = 'none';
  step6.style.display = 'block';
})

const handleCreateMongoClick = document.getElementById("createMongo");

handleCreateMongoClick.addEventListener("click", async function() {
  var clientName = document.getElementById("newClientName").value;
  statusMessage.textContent = "Giving birth...";

  try {
      const response = await createDataPromise(clientName);
      console.log("Success:", response.result);
      console.log("statusLog:", response.statusLog);
      sidebarInit();
      statusMessage.textContent = "New client created: " + clientName + ".";
      step6.style.display = 'none';
      step1.style.display = 'block';
      currentSection = 1;
      document.getElementById('goBackButton').disabled = true;
      document.getElementById('goNextButton').disabled = true;
      document.getElementById('goBackButton').style.backgroundColor = '#f1f1f1';
      document.getElementById('goNextButton').style.backgroundColor = '#3498db';
  } catch (error) {
      console.log("Error:", error);
  }
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
      //console.log(traitsArray);
      //console.log(traits);
      //console.log(JSON.stringify(clientTraits));
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
        }).getGPTCorrection(subject, lang, info, promptElements, traits, clientTraits, storedFinalObjectResult);
        resetVoteButtons()
        //get date and time of gpt request    
        var prompt = getSubject();
        var timeStamp = getDateAndTime();
        requestedCorrections = document.getElementById("traits").value;
        //make the api call
        google.script.run
        .withSuccessHandler((response) => {
          //console.log("statusLog:", response);
        })
        .logUsageOnServer(prompt, timeStamp, version, lang, info, requestedCorrections, clientName);
    })
    .then((result) => {
        statusMessage.textContent = "Translating with ChatGPT...";
        if (lang === "English") {
        // Skip requestTranslation and continue to the next step
        return Promise.resolve(result);
        } else {
        // Proceed with requestTranslation
        return new Promise((resolve, reject) => {
            //console.log("Success:", result);
            google.script.run
            .withSuccessHandler((response) => {
                //console.log("Success:", response.result);
                //console.log("Success:", response.statusLog);
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

function resetVoteButtons() {
  var upvoteButtons = document.getElementsByClassName('upvote-button');
  var downvoteButtons = document.getElementsByClassName('downvote-button');

  for (let button of upvoteButtons) {
      button.style.fontSize = "12px";
      button.style.color = "black";
      button.setAttribute("data-upvoted", "0");
  }

  for (let button of downvoteButtons) {
      button.style.fontSize = "12px";
      button.style.color = "black";
      button.setAttribute("data-downvoted", "0");
  }
}

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
      //console.log("foundOneData:" +JSON.stringify(foundOneData))
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