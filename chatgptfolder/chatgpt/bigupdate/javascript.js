// async function sequentialSteps() {
//   try {
//     const result1 = await asyncFunction1();
//     console.log('Result 1:', result1);
    
//     const result2 = await asyncFunction2(result1);  // Assume asyncFunction2 takes result1 as an argument.
//     console.log('Result 2:', result2);
    
//     const result3 = await asyncFunction3(result2);  // Assume asyncFunction3 takes result2 as an argument.
//     console.log('Result 3:', result3);
    
//     // And so on...
    
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// }

// sequentialSteps();
console.log("BIGUPDATE/JAVASCRIPT.JS");
var optionsCount = 1;
const optionsTotal = 3;
const designOptions = 3; // Number of design options
var storedFinalObjectResult = {};
var promptElements = [];
var storedPromptElements = [];
var finalObjectResult = {};
var storedEmailSubject = "";
var firstTimeStep3 = 0;
var upvoteContent = "";
var clientMongoDocument = {};
var elementCopyExamples = {};
const numberOfExamples = 5;
var documentNamesObj;
var namesArray = [];
var processTagsAddedListeners = 0;

window.addEventListener('load', function() {
  sidebarInit();
  function moveElementButton(button, fromSection, toSection) {
    fromSection.removeChild(button);
    toSection.appendChild(button);
  }

  // Add event listeners to element buttons
  var chosenSection = document.getElementById('chosenContainer');
  var recommendedSection = document.getElementById('recommendedSection');
  var elementButtons = document.getElementsByClassName('element-button');

  for (let i = 0; i < elementButtons.length; i++) {
    elementButtons[i].addEventListener('click', function() {
      if (chosenSection.contains(this)) {
        // Move from chosen to recommended
        moveElementButton(this, chosenSection, recommendedSection);
      } else if (recommendedSection.contains(this)) {
        // Move from recommended to chosen
        moveElementButton(this, recommendedSection, chosenSection);
      }
    });
  }

  // Add event listener to "Add" button
  var addElementButton = document.getElementById('addElementButton');
  var otherElementInput = document.getElementById('otherElementInput');
  var chosenElementButtons = chosenSection.querySelector('.element-buttons');

  addElementButton.addEventListener('click', function() {
  var elementText = otherElementInput.value.trim();

  if (elementText !== '') {
    // Create new element button

    //Title
    newElementButtonTitleText = elementText + " Title";
    var newElementButtonTitle = document.createElement('button');
    newElementButtonTitle.className = 'element-button';
    newElementButtonTitle.textContent = newElementButtonTitleText;

    //Text
    newElementButtonTextText = elementText + " Text";
    var newElementButtonText = document.createElement('button');
    newElementButtonText.className = 'element-button';
    newElementButtonText.textContent = newElementButtonTextText;

    //CTA
    newElementButtonCTAText = elementText + " CTA";
    var newElementButtonCTA = document.createElement('button');
    newElementButtonCTA.className = 'element-button';
    newElementButtonCTA.textContent = newElementButtonCTAText;

    // Add listener Title
    newElementButtonTitle.addEventListener('click', function() {
    if (chosenSection.contains(this)) {
      // Move from chosen to recommended
      moveElementButton(this, chosenSection, recommendedSection);
    } else if (recommendedSection.contains(this)) {
      // Move from recommended to chosen
      moveElementButton(this, recommendedSection, chosenSection);
    }
  });
    // Add listener Text
       newElementButtonText.addEventListener('click', function() {
    if (chosenSection.contains(this)) {
      // Move from chosen to recommended
      moveElementButton(this, chosenSection, recommendedSection);
    } else if (recommendedSection.contains(this)) {
      // Move from recommended to chosen
      moveElementButton(this, recommendedSection, chosenSection);
    }
  });
       // Add listener CTA
       newElementButtonCTA.addEventListener('click', function() {
    if (chosenSection.contains(this)) {
      // Move from chosen to recommended
      moveElementButton(this, chosenSection, recommendedSection);
    } else if (recommendedSection.contains(this)) {
      // Move from recommended to chosen
      moveElementButton(this, recommendedSection, chosenSection);
    }
  });


    // Add the new button to the chosen section
    chosenSection.appendChild(newElementButtonTitle);
    chosenSection.appendChild(newElementButtonText);
    chosenSection.appendChild(newElementButtonCTA);

    // Clear input field
    otherElementInput.value = '';
  }
  });
});

function getNamesArray() {
  //console.log("documentNamesObj: " + documentNamesObj)
  namesArray = documentNamesObj.documents.map(function(doc) {
  return doc.name;
  })
}

async function sidebarInit() {
    try {
      var clientListDiv = document.getElementById('clientDiv');
      var clientLabel = document.getElementById('clientLabel');
      var clientSelector = document.getElementById('clients');
      
      clientLabel.style.display = 'none';
      clientSelector.style.display = 'none';

      var clientListStatus = document.createElement('div');
      clientListStatus.className = 'statusMessage';
      clientListStatus.textContent = "Pick a client: [Loading]";
      clientListDiv.appendChild(clientListStatus);
      
      if (currentSection !== 1) {
        statusMessage.textContent = "Updating client list...";
      }
      var result1 = await findAllData();
      var result2 = await getNamesArray(result1);
      var result3 = await getDropListNames();
      
      clientListStatus.style.display = 'none';
      clientLabel.style.display = 'block';
      clientSelector.style.display = 'block';

      if (currentSection === 5) {
        statusMessage.textContent = "Client list updated.";
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

document.getElementById("clients").addEventListener("change", function() {
  var selectedClientName = this.options[this.selectedIndex].text;
  document.getElementById("clientNameStep5").value = selectedClientName;
  var statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "";
  console.log(selectedClientName);
});  

function updateDocumentPromise(result) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .updateDocument(result);
    });
};

function getDropListNames() {
  var dropdown = document.getElementById('clients');
  
  // Create and add the "Select One" option
  var selectOneOption = document.createElement('option');
  selectOneOption.text = "Select One";
  selectOneOption.value = "INVALID"; // You might want to set a specific value for this option
  dropdown.add(selectOneOption);

  namesArray.forEach(function(name) {
  var option = document.createElement('option');
  option.text = name;
  option.value = name;
  dropdown.add(option);
});
}

var globalApiResponse = {
  "hero banner title": {
    "option1": "Ride in style with our Bike Flash Sale!",
    "option2": "Unbeatable deals on bikes this week only!",
    "option3": "Get ready to bike your heart out with our Flash Sale!"
  },
  "hero banner text": {
    "option1": "Don't miss out on the bike sale event of the year!",
    "option2": "Get your hands on the finest bikes at the most amazing prices!",
    "option3": "Upgrade your ride at our epic Flash Sale! Hurry, limited time only!"
  },
  "hero banner cta": {
    "option1": "Don't miss out on the bike sale event of the year!",
    "option2": "Get your hands on the finest bikes at the most amazing prices!",
    "option3": "Upgrade your ride at our epic Flash Sale! Hurry, limited time only!"
  }

};

var heroBannerTitle;
var heroBannerText;
var heroBannerCTA;
var designTips;

// const testFunctionClick = document.getElementById("testFunction");

// testFunctionClick.addEventListener("click", function() {
//   new Promise(function(resolve, reject) {
//     google.script.run
//       .withSuccessHandler((result) => {
//         console.log("Success:", result);
//         resolve(result);
//       })
//       .withFailureHandler((error) => {
//         console.log("Error:", error);
//         reject(error);
//       })
//       .getGPTResponseSuper("Benjamin's first Olympic Season", "email subject line, email preview text, hero banner title, hero banner text, hero banner cta, descriptive bloc title, descriptive bloc text, descriptive bloc cta", 3, "English", "20% off early bird price, valid from June 22nd to June 25th only.");
//   })
//     .then(function(result) {
//       // Handle the resolved result here
//       console.log("Promise resolved:", result);
//     })
//     .catch(function(error) {
//       // Handle the rejected error here
//       console.log("Promise rejected:", error);
//     });
// });

const qaButtonClick = document.getElementById("qaButton");

qaButtonClick.addEventListener("click", function() {

  new Promise((resolve) => {
        (function() {
            // Get the button element
            const loadTagsButton = document.getElementById("loadTags");

            // Create a new 'click' event
            const event = new Event('click');

            // Dispatch the event
            loadTagsButton.dispatchEvent(event);

            // simulate async operation
            setTimeout(resolve, 1000);  // Adjust this delay as needed
        })();
    }).then(() => {
        (function() {
            // Get the form element
            const gptRequest = document.getElementById("gptRequest");

            // Create a new 'submit' event
            const event = new Event('submit');

            // Dispatch the event
            gptRequest.dispatchEvent(event);
        })();
    })
})

// Setup "LoadTags" to execute ProcessTags
document.getElementById("loadTags").addEventListener("click", function() {
  var chosenDiv = document.getElementById("chosenContainer");
  var elementButtons = chosenDiv.getElementsByClassName("element-button");
  var tags = [];

  // Convert HTMLCollection to array using spread operator
  buttonArray = [...elementButtons];

  buttonArray.forEach(function(button) {
    tags.push(button.textContent);
  });
  setTimeout(() => {}, 1000)
  
  console.log(tags);
  // Step 2
  processTags(tags);
  
});
  
function createTablesInDoc() { 
  return new Promise((resolve, reject) => {
    var chosenDiv = document.getElementById("chosenContainer");
    var elementButtons = chosenDiv.getElementsByClassName("element-button");
    var elementsArray = [];

    for (var i = 0; i < elementButtons.length; i++) {
      var category = "category " + (i + 1);
      var value = elementButtons[i].textContent;
      var elementName = elementButtons[i].textContent;

      // Special handling for "email subject line" and "email preview text"
      if (value === "Email Subject Line" || value === "Email Preview Text") {
        value = "Email Misc";
      } else {
        // Get the category name by extracting the characters before the first space
        var firstSpaceIndex = value.indexOf(' ');
        if (firstSpaceIndex !== -1) {
          value = value.substring(0, firstSpaceIndex);
        } else {
          value = "Other";  // Default category if no space is found
        }
      }
      // Check if the category already exists in the elementsArray
      var categoryExists = false;
      for (var j = 0; j < elementsArray.length; j++) {
        if (elementsArray[j][0] === value) {
          // Add the element to the existing category
          elementsArray[j].push([elementName, "{" + elementName + "}"]);
          categoryExists = true;
          break;
        }
      }
      if (!categoryExists) {
        // Add a new category with the element
        elementsArray.push([value, [elementName, "{" + elementName + "}"]]);
      }
    }
    // Create the table via Code.gs
    var lang = getLang();
    google.script.run.withSuccessHandler(function(statusLog) {
      resolve();
    }).createTables(elementsArray, lang);
  });
}   

function getCategory(tag) {
  var firstSpaceIndex = tag.indexOf(' ');
  if (firstSpaceIndex !== -1) {
    return tag.substring(0, firstSpaceIndex);
  } else {
    // Return a default category if no space is found in the tag
    return "Other";
  }
}

function getElementName(tag) {
  return tag.trim(); // Remove leading and trailing whitespace
}

function updateStoredFinalObjectResult() {
  var cells = document.getElementsByClassName("title-content-cell");
  finalObjectResult = {};

  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];
    var cellText = cell.innerText.trim();
    var nextRow = cell.parentNode.nextElementSibling;
    var nextCell = nextRow ? nextRow.children[cell.cellIndex] : null;

    if (nextCell !== null && nextCell.classList.contains("text-content-cell")) {
      var key = "{" + cellText + "}";
      var value = nextCell.innerText.trim();
      finalObjectResult[key] = value;
    }
  }
  storedFinalObjectResult = finalObjectResult;
  return finalObjectResult
};


function processTags(tags) {
  var topContainer = document.getElementById("topContainer");
  topContainer.setAttribute("gpt-request-status", "generate-copy");

  var tagList = document.getElementById('tagList');
  tagList.innerHTML = ''; // Clear existing content

  // Create the tag list table
  var table = document.createElement('table');
  table.id = 'mainTable';

  // Iterate over each tag and create table rows
  tags.forEach(function (tag) {
    // Create unique IDs for buttons and tagsWithDelimitersCell
    var buttonId = 'button_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    var voteButtonId = 'voteButton_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    var tagsWithDelimitersCellId = 'tagsCell_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    
    // Create the first row
    var firstRow = document.createElement('tr');

    // Create the cells for the first row
    var emptyCell = document.createElement('td');
    var tagsWithoutDelimitersCell = document.createElement('td');
    tagsWithoutDelimitersCell.textContent = tag.replace('{', '').replace('}', '');
    tagsWithoutDelimitersCell.className = 'title-content-cell';
  
    // Append the cells to the first row
    firstRow.appendChild(emptyCell);
    firstRow.appendChild(tagsWithoutDelimitersCell);

    // Create the second row
    var secondRow = document.createElement('tr');

    // Create the cells for the second row
    var buttonCell = document.createElement('td');
    var tagsWithDelimitersCell = document.createElement('td');
    tagsWithDelimitersCell.textContent = tag;
    tagsWithDelimitersCell.className = 'text-content-cell ';
    tagsWithDelimitersCell.id = tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');

    // Create the third row
    var thirdRow = document.createElement('tr');

    var emptyCell2 = document.createElement('td');
    var voteButtonCell = document.createElement('td');
    
    var voteButtonContainer = document.createElement('div');
    voteButtonContainer.className = 'vote-button-container';
    voteButtonCell.appendChild(voteButtonContainer);

    var upvoteButton = document.createElement('button');
    upvoteButton.textContent = '⬆';
    upvoteButton.className = 'upvote-button';
    upvoteButton.style.border = 'none';
    upvoteButton.id = voteButtonId + '_up'; // Set the unique ID
    upvoteButton.setAttribute("data-upvoted", "0")

    var downvoteButton = document.createElement('button');
    downvoteButton.textContent = '⬇';
    downvoteButton.className = 'downvote-button';
    downvoteButton.style.border = 'none';
    downvoteButton.id = voteButtonId + '_down'; // Set the unique ID
    downvoteButton.setAttribute("data-downvoted", "0")

    // Append the button to the button cell
    voteButtonContainer.appendChild(upvoteButton);
    voteButtonContainer.appendChild(downvoteButton);

    // Append the cells to the second row
    thirdRow.appendChild(emptyCell2);
    thirdRow.appendChild(voteButtonCell);
   
    // Set the initial data-option attribute
    tagsWithDelimitersCell.setAttribute('data-option', '1');
    // Create button container
    var buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonCell.appendChild(buttonContainer);

    // Create the options hover-over element
    var optionsHover = document.createElement('div');
    optionsHover.className = 'options-hover';
    optionsHover.id = 'optionsHover_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    optionsHover.textContent = "Options: "

    // Attach the hover-over element to the optionsHoverBottom element
    var optionsHoverBottom = document.getElementById('optionsHoverBottom');
    optionsHoverBottom.appendChild(optionsHover);

    // Add event listeners for hover events
    buttonCell.addEventListener('mouseenter', function () {
    var optionsHoverId = 'optionsHover_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    var optionsHover = document.getElementById(optionsHoverId);
    optionsHover.style.display = 'block';
    bottomContainer.style.display = 'block';
    });

    buttonCell.addEventListener('mouseleave', function () {
    var optionsHoverId = 'optionsHover_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', '');
    var optionsHover = document.getElementById(optionsHoverId);
    optionsHover.style.display = 'none';
    bottomContainer.style.display = 'none';
    });

    // Create the button elements with unique IDs
    var backButton = document.createElement('button');
    backButton.textContent = '◄';
    backButton.className = 'back-button';
    backButton.style.border = 'none';
    backButton.id = buttonId; // Set the unique ID

    var nextButton = document.createElement('button');
    nextButton.textContent = '►';
    nextButton.className = 'next-button';
    nextButton.style.border = 'none';
    nextButton.id = buttonId + '_next'; // Set the unique ID

    // Append the button to the button cell
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(nextButton);

    // Append the rows to the table
    table.appendChild(firstRow);
    table.appendChild(secondRow);
    table.appendChild(thirdRow);

    // Append the cells to the second row
    secondRow.appendChild(buttonCell);
    secondRow.appendChild(tagsWithDelimitersCell);
  
    // Apply border styles to cells
    emptyCell.style.border = 'none'; // No border for the empty cell
    emptyCell2.style.border = 'none'; // No border for the empty cell
    tagsWithoutDelimitersCell.style.border = 'none'; // No border for the cell spanning both columns
    buttonCell.style.border = 'none'; // No border for the button cell
    voteButtonCell.style.border = 'none'; // No border for the button cell
    voteButtonCell.style.textAlign = 'left';
    tagsWithDelimitersCell.style.border = '2px solid #000'; // Thick border for the second cell of the second row
    upvoteButton.style.fontSize = "12px";
    downvoteButton.style.fontSize = "12px";
    

      // Add the click event listener to the "Back" button
      backButton.addEventListener('click', function() {
        var buttonId = this.id;
        var tagsWithDelimitersCellId = buttonId.replace('button_', ''); // Remove the 'button_' prefix
        var tagsWithDelimitersCell = document.getElementById(tagsWithDelimitersCellId);
        //var test183 = parseInt(tagsWithDelimitersCell.getAttribute('data-option'));

        showPreviousOption(tagsWithDelimitersCell, tagsWithDelimitersCellId);
      });

      // Add the click event listener to the "Next" button
      nextButton.addEventListener('click', function() {
        var buttonId = this.id;
        var tagsWithDelimitersCellId = buttonId.replace('button_', ''); // Remove the 'button_' prefix
        tagsWithDelimitersCellId = tagsWithDelimitersCellId.replace('_next', ''); // Remove the '_next' suffix
        var tagsWithDelimitersCell = document.getElementById(tagsWithDelimitersCellId);
        showNextOption(tagsWithDelimitersCell, tagsWithDelimitersCellId);
      });
      backButton.addEventListener('click', function() {
        backButton.classList.add('clicked');
        setTimeout(function() {
          backButton.classList.remove('clicked');
        }, 500);
        // Rest of your code...
      });

      nextButton.addEventListener('click', function() {
        nextButton.classList.add('clicked');
        setTimeout(function() {
          nextButton.classList.remove('clicked');
        }, 500);
      
      });

      upvoteButton.addEventListener('click', function(event) {
        // Extract the tag from the button id
        var clickStatus =  upvoteButton.getAttribute("data-upvoted")
        if (clickStatus === "0") {
          upvoteButton.style.color = "green";
          upvoteButton.style.fontSize = "16px";
          upvoteButton.setAttribute("data-upvoted", "1")
          let tag = this.id.replace('_up', '').replace('voteButton_', '').replace(/-/g, ' ').replace('{', '').replace('}', '');
          // Find the corresponding div using the tag
          let associatedDiv = document.getElementById(tag.replace(/\s+/g, '-').replace('{', '').replace('}', ''));
          upvoteContent = associatedDiv.textContent;
          // If the div was found
          if (associatedDiv) {
              // Log the text content of the div
            var clientName = document.getElementById("clients").value;
            new Promise((resolve, reject) => {
                google.script.run
                  .withSuccessHandler(response => {
                    resolve(response);
                  })
                  .withFailureHandler(error => {
                    reject(error);
                  })
                  .updateUpvotes(clientName, upvoteContent, tag);;
              });
        }} else {
          upvoteButton.style.color = "black";
          upvoteButton.style.fontSize = "12px";
          upvoteButton.setAttribute("data-upvoted", "0")
          let tag = this.id.replace('_up', '').replace('voteButton_', '').replace('-', ' ').replace('{', '').replace('}', '');
          // Find the corresponding div using the tag
          let associatedDiv = document.getElementById(tag.replace(/\s+/g, '-').replace('{', '').replace('}', ''));
          upvoteContent = associatedDiv.textContent;
          // If the div was found
          if (associatedDiv) {
            var clientName = document.getElementById("clients").value;
            new Promise((resolve, reject) => {
                google.script.run
                  .withSuccessHandler(response => {
                    resolve(response);
                  })
                  .withFailureHandler(error => {
                    reject(error);
                  })
                  .removeLastUpvote(clientName, tag);;
              })
          }
        }
      });
    
      downvoteButton.addEventListener('click', function(event) {
        var clickStatus =  downvoteButton.getAttribute("data-downvoted")
        if (clickStatus === "0") {
          downvoteButton.style.color = "red";
          downvoteButton.style.fontSize = "16px";
          downvoteButton.setAttribute("data-downvoted", "1")
        
          let tag = this.id.replace('_down', '').replace('voteButton_', '').replace('-', ' ').replace('{', '').replace('}', '');

          // Find the corresponding div using the tag
          let associatedDiv = document.getElementById(tag.replace(/\s+/g, '-').replace('{', '').replace('}', ''));
          downvoteContent = associatedDiv.textContent;
          // If the div was found
          if (associatedDiv) {
              // Log the text content of the div
            var clientName = document.getElementById("clients").value;
            new Promise((resolve, reject) => {
                google.script.run
                  .withSuccessHandler(response => {
                    resolve(response);
                  })
                  .withFailureHandler(error => {
                    reject(error);
                  })
                  .updateDownvotes(clientName, downvoteContent, tag);;
            });
          }
        } else {
            downvoteButton.style.color = "black";
            downvoteButton.style.fontSize = "12px";
            downvoteButton.setAttribute("data-downvoted", "0")
            let tag = this.id.replace('_down', '').replace('voteButton_', '').replace('-', ' ').replace('{', '').replace('}', '');
            // Find the corresponding div using the tag
            let associatedDiv = document.getElementById(tag.replace(/\s+/g, '-').replace('{', '').replace('}', ''));
            downvoteContent = associatedDiv.textContent;
            // If the div was found
            if (associatedDiv) {
              var clientName = document.getElementById("clients").value;
              new Promise((resolve, reject) => {
                  google.script.run
                    .withSuccessHandler(response => {
                      resolve(response);
                    })
                    .withFailureHandler(error => {
                      reject(error);
                    })
                    .removeLastDownvote(clientName, tag);;
                })
              }
          }
      });
    if (processTagsAddedListeners === 0) {
      processTagsAddedListeners = 1;
      const handleUpdateButtonClick = document.getElementById("update");
      //handleUpdateButtonClick.removeEventListener("click", updateButtonSequence);
      handleUpdateButtonClick.addEventListener("click", updateButtonSequence);
      
        async function updateButtonSequence() {
          try {
            await createTablesInDoc();
            finalObjectResult = {};
            console.log("this ran once when adding listeners to the updatebutton")
            finalObjectResult = await updateStoredFinalObjectResult();
            await updateDocumentPromise(finalObjectResult);
          } catch (error) {
            console.error('An error occurred:', error);
          }
        }
    
      const handleUpdateBilingualButtonClick = document.getElementById("updateBilingual");

      //handleUpdateBilingualButtonClick.removeEventListener("click", startBilingualProcess);
      handleUpdateBilingualButtonClick.addEventListener("click", startBilingualProcess);

        function clickLoadTagsButton() {
          // Get the button element
          const loadTagsButton = document.getElementById("loadTags");
          // Create a new 'click' event
          const event = new Event('click');
          // Dispatch the event
          loadTagsButton.dispatchEvent(event);
        }

        async function updateBilingualSequence() {
          try {
            // await updateEnglishFinalObjectResult();
            await createTablesInDoc();
            console.log("this ran once when adding listeners to the updatebilingualbutton")
            //finalObjectResult = {};
            finalObjectResult = await updateStoredFinalObjectResult();
            await updateDocumentPromise(finalObjectResult);
            clickLoadTagsButton()
          } catch (error) {
            console.error('An error occurred:', error);
          }
        }

        function startBilingualProcess() {
          updateBilingualSequence();
          //leave the fake asyn for now, we will remove it later
          new Promise((resolve) => {
              (function() {
                  // simulate async operation
                  setTimeout(resolve, 1000);  // Adjust this delay as needed
              })();
          }).then(() => {
              // run gptrequest with French
              (function() {
                  // Get the form element
                  const gptRequest = document.getElementById("gptRequest");
                  const lang = document.getElementById("lang");
                  lang.value = "Français (Québec)";

                  // Create a new 'submit' event
                  const event = new Event('submit');

                  // Dispatch the event
                  gptRequest.dispatchEvent(event);
              })();
          })
        }
    }
  });

  // Append the table to the tag list element
  tagList.appendChild(table);

  //end of table generating code
   

    //end of updatedocument
    // function "bidon" to isolate design phase -- remove "function bidon() {} to enable design phase"
  //   function bidon() {
  //   //create elements for design phase
    
  //   //Change gpt-request-status
  //   var topContainer = document.getElementById("topContainer");
  //   topContainer.setAttribute("gpt-request-status", "generate-design-tips");

  //   // Get the text content of the required divs
  //   try {
  //     heroBannerTitle = document.getElementById("HeroBanner-Title").textContent.trim();
  //     heroBannerSubtitle = document.getElementById("HeroBanner-Text").textContent.trim();
  //     heroBannerCTA = document.getElementById("HeroBanner-CTA").textContent.trim();

  //     // If an error occurs within the try block, the catch block will handle it
  //   } catch (error) {
  //     // Code to handle the error
  //     console.error('An error occurred:', error.message);
  //     var statusMessage = document.getElementById("statusMessage");
  //     // Set the message to indicate the running state
  //     statusMessage.textContent = "Make sure your tags include : 'hero banner title', 'hero banner text' and 'hero banner cta'";
  //   }

  //   // Clear the content of div with id="tableContainer"
  //   var tableContainer = document.getElementById("tableContainer");
  //   tableContainer.innerHTML = "";

  //   // Generate a new table with 4 rows
  //   for (var i = 1; i <= designOptions; i++) {
  //   // Create a new table for each design option
  //   var newTable = document.createElement("table");
  //   newTable.id = 'designTable' + i;

  //   // Create the first row with two divs
  //   var row1 = document.createElement("tr");

  //   var cell1 = document.createElement("td");
  //   var div1 = document.createElement("div");
  //   div1.textContent = "Option " + i;
  //   // Apply CSS styles to div1

  //   var cell2 = document.createElement("td");
  //   var div2 = document.createElement("div");

  //   // Create a button element
  //   var deleteButton = document.createElement("button");
  //   deleteButton.id = 'deleteDesignIdea' + i;
  //   deleteButton.innerHTML = "&#128465"; // Unicode character for trash can
  //   deleteButton.style.fontSize = "12px"; // Set the font size to make the button small

  //   // Apply CSS styles to the button
  //   //deleteButton.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)";
  //   deleteButton.style.transition = "box-shadow 0.3s ease-in-out";

  //   // Add event listeners for hover and click animations
  //   deleteButton.addEventListener("mouseover", function() {
  //     this.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  //   });

  //   deleteButton.addEventListener("mouseout", function() {
  //     this.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)";
  //   });

  //   deleteButton.addEventListener("click", createDeleteTableHandler(i)); // Call a separate function to handle the deletion

  //   // Append the button to the second div
  //   div2.appendChild(deleteButton);

  //   cell1.appendChild(div1);
  //   cell2.appendChild(div2);
  //   row1.appendChild(cell1);
  //   row1.appendChild(cell2);

  //   newTable.appendChild(row1);
  //   // Create the second row with the response from the API call
  //   var row2 = document.createElement("tr");
  //   var cell3 = document.createElement("td");
  //   cell3.colSpan = 2;
  //   cell3.id = "cell3_option" + i;
  //   cell3.className = "cell3_option";
  //   //var response = getGPTDesignResponse(lang, heroBannerTitle, heroBannerText, heroBannerCTA, subject, info);
  //   //cell3.textContent = "Response: " + JSON.stringify(response.result);
    
  //   row2.appendChild(cell3);
  //   newTable.appendChild(row2);

  //   // Append the new table to the table container
  //   var tableContainer = document.getElementById("tableContainer");
  //   tableContainer.appendChild(newTable);

  // }
  //   var addButton = document.createElement("button");
  //   addButton.id = "addDesignTips";
  //   addButton.className = "option-button";
  //   addButton.textContent = "Add Design Tip";

  //   tableContainer.appendChild(addButton);
 


  //  // Find the textarea with class "large-input"
  //  var textarea = document.querySelector(".large-input");
  //   textarea.value = "Focus on the sale"; // Change the text

  //   //Scroll back to the top for best UX
  //   document.documentElement.scrollTop = 0; // For modern browsers
  //   document.body.scrollTop = 0; // For older browsers

  //   // Add an animation to the textarea
  //   textarea.classList.add("textarea-animation");
  //   setTimeout(function() {
  //     textarea.classList.remove("textarea-animation");
  //   }, 1000);

  //   const handleAddDesignTipsButtonClick = document.getElementById("addDesignTips");

  //   handleAddDesignTipsButtonClick.addEventListener("click", function() {
  //   var designTips = document.getElementsByClassName("cell3_option");
  //   var designTipsText = [];

  //   for (var i = 0; i < designTips.length; i++) {
  //     var designTip = designTips[i];
  //     var textContent = designTip.textContent.trim(); // Trim the text content
  //     designTipsText.push(textContent);
  //   }

  //   console.log(designTipsText);
  //   google.script.run.addDesignTips(designTipsText);
  // });
  
  // }
  // //end of function bidon()



    
    //create elements for design phase
    
        //Change gpt-request-status
    //add the code to change and prepare design stuff, see same script a bit above
  }


//END OF PROCESS TAG FUNCTION
//----------------------------------------------------------------------------------------------------------------

function showOptionsOnHover(tag, optionsCount) {
  var responseForOptionsHover = globalApiResponse;

  // Check if the response is available
  if (responseForOptionsHover && responseForOptionsHover.hasOwnProperty(tag)) {

    var optionsHoverBottom = document.getElementById('optionsHoverBottom');
    var optionElementGeneratedContainer = document.getElementById('optionsHover_' + tag.replace(/\s+/g, '-').replace('{', '').replace('}', ''));
    optionsHoverBottom.appendChild(optionElementGeneratedContainer);

    //optionsHoverBottom.style.display = 'none'; // Hide the options initially
    // Loop through the options and add them to the optionsHoverBottom element
    optionElementGeneratedContainer.innerHTML="Options:";
    for (var optionCount = 1; optionCount <= optionsTotal; optionCount++) {

      var optionText = optionCount + " - " + responseForOptionsHover[tag]["option" + optionCount];
      var optionElement = document.createElement('div');
      optionElement.textContent = optionText;
      optionElementGeneratedContainer.appendChild(optionElement);
    }

  }
}

function showPreviousOption(tagsWithDelimitersCell,tagsWithDelimitersCellId) {
  var optionsCount = parseInt(tagsWithDelimitersCell.getAttribute('data-option'));
  var previousOptionIndex = optionsCount === 1 ? optionsTotal : optionsCount - 1;
  var tag = tagsWithDelimitersCellId.replace(/-/g, ' ');
  var generatedCopyPrevious = globalApiResponse[tag]["option" + previousOptionIndex];
  tagsWithDelimitersCell.textContent = generatedCopyPrevious;
  tagsWithDelimitersCell.setAttribute('data-option', previousOptionIndex.toString());
}

function showNextOption(tagsWithDelimitersCell,tagsWithDelimitersCellId) {
  var optionsCount = parseInt(tagsWithDelimitersCell.getAttribute('data-option'));
  var nextOptionIndex = optionsCount === optionsTotal ? 1 : optionsCount + 1;
  var tag = tagsWithDelimitersCellId.replace(/-/g, ' ');
  var generatedCopyNext = globalApiResponse[tag]["option" + nextOptionIndex];
  tagsWithDelimitersCell.textContent = generatedCopyNext;
  tagsWithDelimitersCell.setAttribute('data-option', nextOptionIndex.toString());
}


var exampleObj = {
    "element1": {
      "option1": "generated copy1",
      "option2": "generated copy2",
      "option3": "generated copy3",
      "option4": "generated copy4",
      "option5": "generated copy5"
    }
  };

function updateTextContentCells(response, optionsCount) {

  var topContainer = document.getElementById("topContainer");
  var gptRequestStatus = topContainer.getAttribute("gpt-request-status");

  if (gptRequestStatus === "generate-copy") {

  var titleContentCells = document.getElementsByClassName("title-content-cell");
  var textContentCells = document.getElementsByClassName("text-content-cell");
  
  for (var i = 0; i < titleContentCells.length; i++) {
    var tag = titleContentCells[i].textContent;
    if (response.hasOwnProperty(tag)) {
      var generatedCopy = response[tag]["option" + optionsCount];
        if (generatedCopy != '') {
        textContentCells[i].textContent = generatedCopy;
      } else {
        console.log("Empty string");
      }
    } else {
      console.log("Tag not found in response:", tag);
    }
  }

  return response;
} else {
  // var cell3_option = document.getElementsByClassName("cell3_option");

  // for (var i = 1; i <= designOptions; i++) {
  // var generatedDesignOption = response["Option" + i];
  // var generatedDesignOption1 = response["Option" + i]["Description"];
  // console.log(generatedDesignOption);
  // cell3_option[i - 1].textContent = generatedDesignOption;
  for (var i = 1; i <= designOptions; i++) {
  var optionKey = "Option" + i;
  if (response.hasOwnProperty(optionKey)) {
    var backgroundText = response[optionKey]["Background"];
    var descriptionText = response[optionKey]["Description"];
    var designElementText = response[optionKey]["DesignElement"];
    
    // Get the div element with the corresponding unique id
    var divId = "cell3_option" + i;
    var divElement = document.getElementById(divId);
    
    // Check if the div element exists
    if (divElement) {
      // Update the inner HTML of the div with the text content
      divElement.innerHTML = `
        <p>Background: ${backgroundText}</p>
        <p>Description: ${descriptionText}</p>
        <p>Design Element: ${designElementText}</p>
      `;
    }
  }
  }  
  }
};

// extract the traits from a specific client from MongoDB
function extractTraits(response) {
  if (response && response.document && response.document.traits) {
    const traits = response.document.traits;
    const traitArray = traits.split(',').map(trait => trait.trim());
    
    const clientTraits = {};
    for (var i = 0; i < traitArray.length; i++) {
      const key = 'trait' + (i + 1);
      clientTraits[key] = i < traitArray.length ? traitArray[i] : '';
    }
  
    return clientTraits;
  } else {
    return {};
  }
}

// function extractUpvotes(response) {
//   if (response && response.document && response.document.upvotes) {
//     var upvotesObject = response.document.upvotes;
//     return upvotesObject;
//   } else {
//     return null; // or some default value
//   }
// }

// function extractTraits(response) {
//   if (response && response.document && response.document.traits) {
//     const traits = response.document.traits;
//     const traitArray = traits.split(',').map(trait => trait.trim());
    
//     const clientTraits = {};
//     for (var i = 0; i < traitArray.length; i++) {
//       const key = 'trait' + (i + 1);
//       clientTraits[key] = i < traitArray.length ? traitArray[i] : '';
//     }
  
//     return clientTraits;
//   } else {
//     return {};
//   }
// }

function combineTraits(preferenceObject, clientTraits2) {
  // Get the first key name from the apiResponse object
  let preferenceObjectParsed = JSON.parse(preferenceObject);

  let firstKey = Object.keys(preferenceObjectParsed)[0];
  let firstKeyValue = preferenceObjectParsed[firstKey];
  //console.log(firstKey);
  //console.log(firstKeyValue);
  traitsArray = [];
  for(let i = 0; i < firstKeyValue.length; i++) {
    traitsArray.push(firstKeyValue[i].preference);
  }

  for (let key in clientTraits2) {
    if (clientTraits2.hasOwnProperty(key)) {
      // Push each value into the traitsArray
      traitsArray.push(clientTraits2[key]);
    }
  }
  // check if we have more than 10 traits
  //console.log(traitsArray.length);
  //console.log(traitsArray);

  if (traitsArray.length > 5) {
    new Promise((resolve, reject) => {
        google.script.run
        .withSuccessHandler((response) => {
        console.log("Success:", response.result);  // Only logs the 'result' part of the response
        //console.log("statusLog:", response.statusLog); // Logs the statusLog for debugging
        resolve(response.result);  // Only resolve the 'result' part of the response
        })
        .withFailureHandler((error) => {
        console.log("Error:", error);
        reject(error);
        }).cleanUpTraits(traitsArray);
    }).then((result) => {
        console.log(result);
        let preferenceObjectParsed = JSON.parse(result);
        let firstKey = Object.keys(preferenceObjectParsed)[0];
        let firstKeyValue = preferenceObjectParsed[firstKey];
        simplifiedTraitsArray = [];
        for(let i = 0; i < firstKeyValue.length; i++) {
          simplifiedTraitsArray.push(firstKeyValue[i]);
        }
        console.log(simplifiedTraitsArray);
        return simplifiedTraitsArray
      }).then((simplifiedTraitsArray) => {
        traitsString = simplifiedTraitsArray.join(", ");
        console.log(traitsString);
        return traitsString
      });
  } else {
    traitsString = traitsArray.join(", ");
    return traitsString
  }
  
  // if (response && response.document && response.document.traits) {
  //   const traits = response.document.traits;
  //   const traitArray = traits.split(',').map(trait => trait.trim());
    
  //   const clientTraits = {};
  //   for (var i = 0; i < traitArray.length; i++) {
  //     const key = 'trait' + (i + 1);
  //     clientTraits[key] = i < traitArray.length ? traitArray[i] : '';
  //   }
  
  //   return clientTraits;
  // } else {
  //   return {};
  // }
}


function getSubject() {
  var subjectInput = document.getElementById("subject");
  var prompt = subjectInput.value;
  return prompt;
}

function getLang() {
  var langInput = document.getElementById("lang");
  var lang = langInput.value;
  return lang;
}

function getInfo() {
  var infoInput = document.getElementById("info");
  var info = infoInput.value;
  return info;
}

function getPromptElements() {
  storedPromptElements = [];
  storedPromptElements = promptElements;
  promptElements = [];
  var inputs = document.querySelectorAll("#mainTable td.text-content-cell");
  inputs.forEach(function (input) {
    var tagText = input.textContent.trim();
    promptElements.push(tagText);
  });
  return promptElements;
}

let inputs = document.querySelectorAll('#gptRequest input, #gptRequest, #info, #traits');

// Add an event listener to each input field
inputs.forEach(input => {
    document.addEventListener('keydown', function(event) {
        // Check if the Enter key was pressed
        if (event.key === 'Enter') {
            // Prevent the Enter key from submitting the form
            event.preventDefault();
            
            return false;
        }
    });
});
document.addEventListener('keydown', function(event) {
    // Check if the Enter key was pressed
    if (event.key === 'Enter') {
        // Prevent the Enter key from submitting the form
        event.preventDefault();
        
        // Check if the Cmd (for macOS) or Ctrl (for Windows/Linux) key is held
        if (event.metaKey || event.ctrlKey) {
            // Check if the Shift key is also held
            if (event.shiftKey) {
                // Call the simulateGoBackButtonClick function
                simulateGoBackButtonClick();
            } else {
                // Call the simulateGoNextButtonClick function
                simulateGoNextButtonClick();
            }
        }
        
        return false;
    }
});



const gptRequest = document.getElementById("gptRequest");

gptRequest.addEventListener("submit", (e) => {
  e.preventDefault();


  //   var promptElements = [];
  //   var searchPattern = /\{([^}]+)\}/g;
  //   var inputs = document.querySelectorAll("#mainTable td.text-content-cell");

  //      inputs.forEach(function (input) {
  //     var tagText = input.textContent;
  //     //console.log("Tag Text:", tagText); // Log the tag text for debugging

  //     var matches = tagText.match(searchPattern);
  //     //console.log("Matches:", matches); // Log the matches for debugging

  //     if (matches) {
  //       for (var i = 0; i < matches.length; i++) {
  //         var tag = matches[i].replace('{', '').replace('}', '');
  //         promptElements.push(tag);
  //       }
  //     }
  //   });
  //   return promptElements;
  // }

  var prompt = getSubject();
  var lang = getLang();
  var info = getInfo();
  //console.log(getPromptElements)
  promptElements = getPromptElements();
  var subject = getSubject();

  // Make the API call
  var statusMessage = document.getElementById("statusMessage");
  // Set the message to indicate the running state
  statusMessage.textContent = "Talking to ChatGPT...";
  console.log("storedPromptElements: " + storedPromptElements);
  console.log("ok prompt: " + prompt + " and ok prompt elements: " + promptElements) + "and ok lang: " + lang;

  new Promise((resolve, reject) => {
  // Add your condition based on gpt-request-status here
  var topContainer = document.getElementById("topContainer");
  var gptRequestStatus = topContainer.getAttribute("gpt-request-status");


  if (gptRequestStatus === "generate-copy") {
    clientTraits = "";
  
    // Find the right client traits
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
    var foundOneData = findOneDataPromise(clientName)
    .then(response => {
      //console.log("Success949:", response);
      return response; // Return the response to use it further if needed
    })
    .then(foundOneData => {
      clientTraits = extractTraits(foundOneData);
      clientMongoDocument = foundOneData;
      return clientTraits;
    }).then(clientTraits => {
      elementCopyExamples = {};
      let clientMongoDocumentUpvotes = clientMongoDocument.document.upvotes;
      let clientMongoDocumentDownvotes = clientMongoDocument.document.downvotes;

      for (let element of promptElements) {
        if (clientMongoDocumentUpvotes && clientMongoDocumentUpvotes.hasOwnProperty(element + "_upvotes")) {
            let examplesArray = clientMongoDocumentUpvotes[element + "_upvotes"];
            let lastFiveExamples = examplesArray.slice(-numberOfExamples);
            elementCopyExamples[element + "_upvotes"] = lastFiveExamples;
        }
      }

      for (let element of promptElements) {
        if (clientMongoDocumentDownvotes && clientMongoDocumentDownvotes.hasOwnProperty(element + "_downvotes")) {
            let examplesArray = clientMongoDocumentDownvotes[element + "_downvotes"];
            let lastFiveExamples = examplesArray.slice(-numberOfExamples);
            elementCopyExamples[element + "_downvotes"] = lastFiveExamples;
        }
      }  
    }).then(result => {    
    // Run getGPTResponse
    google.script.run
    .withSuccessHandler((response) => {
      //console.log("Success:", response.result);  // Only logs the 'result' part of the response
      console.log("statusLog:", response.statusLog); // Logs the statusLog for debugging
      globalApiResponse = response.result;  // Only use the 'result' part of the response
      updateStoredFinalObjectResult()
      resolve(response.result);  // Only resolve the 'result' part of the response
    })
    .withFailureHandler((error) => {
      console.log("Error:", error);
      reject(error);
    })
    .getGPTResponseSuper(prompt, promptElements, optionsTotal, lang, info, clientTraits, elementCopyExamples, numberOfExamples);
   // });
  });
  } else {
    // Run getGPTDesignResponse
    google.script.run
      .withSuccessHandler((response) => {
        console.log("Success:", response.result);
        resolve(response.result);
      })
      .withFailureHandler((error) => {
        console.log("Error:", error);
        reject(error);
      })
      .getGPTDesignResponse(lang, heroBannerTitle, heroBannerText, heroBannerCTA, subject, info);
  }
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
    statusMessage.textContent = "Negociation with Open AI servers...";
    // Handle the API response
    return new Promise((resolve, reject) => {
      updateTextContentCells(result, optionsCount);
      resolve(result);
    });
  })
  .then((result) => {
    statusMessage.textContent = "Script completed.";
    // Process each tag and call showOptionsOnHover
    promptElements.forEach((tag) => {
      showOptionsOnHover(tag, optionsCount);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
    statusMessage.textContent = "Script encountered an error.";
  });

});

function getTopContainerStatus() {
  var topContainerStatus = ""; // Initialize the status
  
  // Use HtmlService to access the HTML content
  var html = HtmlService.createHtmlOutputFromFile('index').getContent();
  
  // Use DOM methods to parse and manipulate the HTML content
  var document = XmlService.parse(html);
  var root = document.getRootElement();
  var topContainerElement = root.getChild('div', { 'id': 'topContainer' });
  
  if (topContainerElement) {
    var statusAttribute = topContainerElement.getAttribute('gpt-request-status');
    if (statusAttribute) {
      topContainerStatus = statusAttribute.getValue();
    }
  }
  
  return topContainerStatus;
}
function createDeleteTableHandler(index) {
  return function() {
    var designTableId = 'designTable' + index; // Get the corresponding table id to be deleted
    var designTable = document.getElementById(designTableId);
    if (designTable) {
      designTable.remove(); // Delete the table
    }
  };
}
//-------

window.onload = function() {
  // Function to move an element button between sections
  //aaaa CODE COUCOU

};

var inputFieldOtherElement = document.getElementById("otherElementInput");

inputFieldOtherElement.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default form submission
    // Add your submit logic here
    // For example, you can call a function to handle the form submission
    simulateAddElementButtonClick();
  }
});

function simulateAddElementButtonClick() {
  var addElementButton = document.getElementById("addElementButton");
  addElementButton.click(); // Simulate a click event on the addElementButton
}

var inputFieldTraits = document.getElementById("traits");

inputFieldTraits.addEventListener("keypress", function(event) {
  // Check if the Ctrl key is pressed and if the pressed key is 'Enter'
  if ((event.metaKey||event.ctrlKey) && event.key === "Enter") {
    event.preventDefault(); // Prevent the default form submission
    var gptMagicButton = document.getElementById("gptMagicButton");
    gptMagicButton.click(); // Simulate a click event on the addElementButton
  }
});

let currentSection = 1;
const totalSections = 5;

document.getElementById("goNextButton").addEventListener('click', function() {

  if ((currentSection < totalSections) && (currentSection !== 4)) {
    var clientName = document.getElementById("clients").value;
    console.log(clientName)
    if ((currentSection === 1) && ((clientName === "INVALID") || (clientName ===""))){
      var statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = "Please select a client or create a new one first";

    } else {
    document.getElementById('step' + currentSection).style.display = 'none';
    currentSection++;
    if ((currentSection === 3) && (firstTimeStep3 === 0)) {
  
      simulateQaButtonkButtonClick()
      firstTimeStep3 = 1;
      var qaButton = document.getElementById("qaButton");
      qaButton.classList.remove("hideButton");
      const checkCondition = () => {
        var emailSubjectLineField = document.getElementById("Email-Subject-Line");
        if (emailSubjectLineField.textContent !== "Email Subject Line") {
          storedEmailSubject = emailSubjectLineField.textContent;
          document.getElementById('step' + currentSection).style.display = 'block';
        } else {
        console.log("not yet, rechecking...");
        setTimeout(checkCondition, 500);  // Check again after a delay
        }
        };
        checkCondition();
    } else {
      document.getElementById('step' + currentSection).style.display = 'block';

    }
  }
    if (currentSection === totalSections) {
      this.disabled = true;
      this.style.backgroundColor = '#f1f1f1'; 
    }
    
    if (currentSection > 1) {
      document.getElementById('goBackButton').disabled = false;
      document.getElementById('goBackButton').style.backgroundColor = '#3498db'; 
    }
  }
  else if (currentSection === 4) {
    var traits = document.getElementById("traits").value;
    if (traits !== "") {
      simulateGptMagicButtonClick()
      document.getElementById('step' + currentSection).style.display = 'none';
      currentSection--;
          
      const checkCondition = (retryCount = 0, maxRetries = 30) => {
      var emailSubjectLineField = document.getElementById("Email-Subject-Line");
      //console.log("emailSubjectLineField: " + emailSubjectLineField.textContent);
      //console.log("storedEmailSubject: " + storedEmailSubject);
      
      if (emailSubjectLineField.textContent !== storedEmailSubject) {
        storedEmailSubject = emailSubjectLineField.textContent;
        document.getElementById('step' + currentSection).style.display = 'block';
      } else {
        console.log("Not yet, rechecking...");

        if (retryCount < maxRetries) {
          setTimeout(() => checkCondition(retryCount + 1), 500); // Check again after a delay
        } else {
          console.log("Max reached, displaying answers")
          storedEmailSubject = emailSubjectLineField.textContent;
          document.getElementById('step' + currentSection).style.display = 'block';
        }
      }
    };

    checkCondition();
      // document.getElementById('step' + currentSection).style.display = 'block';
    } else {
      var statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = "Please input valid corrections";
    }
  }
});

document.getElementById('goBackButton').addEventListener('click', function() {
  if (currentSection > 1) {
    document.getElementById('step' + currentSection).style.display = 'none';
    currentSection--;
    document.getElementById('step' + currentSection).style.display = 'block';
    goNextButton.innerText = "Next"
    
    if (currentSection === 1) {
      this.disabled = true;
      this.style.backgroundColor = '#f1f1f1'; 
    }

    if (currentSection < totalSections) {
      document.getElementById('goNextButton').disabled = false;
      document.getElementById('goNextButton').style.backgroundColor = '#3498db'; 
    }
  }
});

// document.getElementById("goNextButton").addEventListener('click', function() {
//   if (currentSection === 3) {
//     simulateQaButtonkButtonClick()

//   }
// });

document.getElementById("goStep5").addEventListener('click', function() {
  document.getElementById('step' + currentSection).style.display = 'none';
  currentSection=5;
  document.getElementById('step' + '5').style.display = 'block';
  document.getElementById('goBackButton').disabled = false;
  document.getElementById('goBackButton').style.backgroundColor = '#3498db'; 
  document.getElementById('goNextButton').disabled = true;
  document.getElementById('goNextButton').style.backgroundColor = '#f1f1f1'; 
});



function simulateGoNextButtonClick() {
  var goNextButton = document.getElementById("goNextButton");
  goNextButton.click(); // Simulate a click event on the addElementButton
}

function simulateGoBackButtonClick() {
  var goBackButton = document.getElementById("goBackButton");
  goBackButton.click(); // Simulate a click event on the addElementButton
}

function simulateFindAllMongoButtonClick() {
  var findAllMongoButton = document.getElementById("findAllMongo");
  findAllMongoButton.click(); // Simulate a click event on the addElementButton
  return documentNamesObj
}

function simulateQaButtonkButtonClick() {
  var qaButton = document.getElementById("qaButton");
  qaButton.click(); // Simulate a click event on the addElementButton
}

function simulateGptMagicButtonClick() {
  var gptMagicButton = document.getElementById("gptMagicButton");
  gptMagicButton.click(); // Simulate a click event on the addElementButton
}
