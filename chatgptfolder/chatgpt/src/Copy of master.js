
// //Create menu
// //process tag > get.inputText = promptSubject
// //process tag > get.inputElements = promptElements
// //GetAIReponse



// // Starts the "real" code

// // (function getPromptElements() {
// //   var doc = DocumentApp.getActiveDocument();
// //   var body = doc.getBody();
// //   promptElements = [];
// //   var searchPattern = '\\{([^}]+)\\}';
// //   var search = body.findText(searchPattern);

// //   while (search) {
// //     var tag = search.getElement().asText().getText().substring(search.getStartOffset(), search.getEndOffsetInclusive() + 1);
// //     promptElements.push(tag);

// //     // Continue searching for the same pattern
// //     search = body.findText(searchPattern, search);
// //   }

// //   // Log the found tags
// //   Logger.log(promptElements);
  
// //   return promptElements
// // })();

// function getApiKey() {
//   var scriptProperties = PropertiesService.getScriptProperties();
//   var apiKey = scriptProperties.getProperty('openai');
//   return apiKey;
// }

// function getAIReponse(prompt,promptElements){
//   var body = DocumentApp.getActiveDocument()
//       .getBody();
//   var apiKey = getApiKey();
  

//   // configure the API request to OpenAI
//   var exampleObj = {
//     "book_id": 1,
//     "title": "The Lost City of Zorath",
//     "author": "Aria Blackwood",
//     "genre": "Fantasy"
//   }
  
//   var data = {
//     "messages": [
//       {"role": "system", "content": ""},

//       {"role": "user", "content": "Act as a professionel adcopywritter in the email marketing specialization. Here's the subject:" +prompt +". Write copy for all the provided elements. Here's the Javascript Array with elements to write about:" +promptElements +". Provide creative, engaging and conversationnal copy in another Javascript Object with the same keys as the provided array. For example, if promptElements[0]= {title}, please generate a copy for {title} and store it in javascript object format. Your reponse should only contain the Javascript Object. For example, for a subject about books, here's a possible response:" + exampleObj}],
//     "model": "gpt-3.5-turbo",
//   };
                    
//     var options = {
//       'method' : 'post',
//       'contentType': 'application/json',
//       'payload' : JSON.stringify(data),
//       'headers': {
//         Authorization: 'Bearer ' + apiKey,
//       },
//     };

//   var response = UrlFetchApp.fetch(
//     'https://api.openai.com/v1/chat/completions',
//     options
//   );

//   //Logger.log(response.getContentText());
  
//   // Send the API request 
//   var resultString = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
//   Logger.log(resultString);
  
//   var resultObj = JSON.parse(resultString);

//   //flow : check lang
//   var lang = getLang();

//   //if English, give result
//   if (lang === "English") {
//     for (var key in resultObj) {
//       var tag = '{' + key + '}';
//       body.replaceText(tag, resultObj[key]);
//     }    
//   } else { //if not english, take lang and translate and give result
//     var translatedResultObj = translate(resultObj, lang);
//     for (var key in translatedResultObj) {
//       var tag = '{' + key + '}';
//       body.replaceText(tag, translatedResultObj[key]);
//     }    
//   } 

//   }

// function callOpenAI(prompt) {
//   var apiKey = getApiKey();
//   var data = {
//     "messages": [
//       {"role": "system", "content": ""},

//       {"role": "user", "content": prompt}],
//     "model": "gpt-3.5-turbo",
//   };
//     var options = {
//       'method' : 'post',
//       'contentType': 'application/json',
//       'payload' : JSON.stringify(data),
//       'headers': {
//         Authorization: 'Bearer ' + apiKey,
//       },
//     };

//   var response = UrlFetchApp.fetch(
//     'https://api.openai.com/v1/chat/completions',
//     options
//   );

//   //Logger.log(response.getContentText());
  
//   // Send the API request 
//   var resultString = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
//   Logger.log(resultString);
  
//   var resultObj = JSON.parse(resultString);

//   //var response = UrlFetchApp.fetch(url, options);
//   //var jsonResponse = JSON.parse(response.getContentText());
//   //var generatedText = jsonResponse.choices[0].text;

//   return resultObj;
// }

// function getLang() {
//   var doc = DocumentApp.getActiveDocument();
//   var body = doc.getBody();
//   var tag = '[* lang *]';
//   var search = body.findText(tag);

//   while (search) {
//     var tagElement = search.getElement();
//     var tagCell = getTableCell(tagElement);

//     if (tagCell) {
//       var tagRow = tagCell.getParent();

//       if (tagRow.getType() === DocumentApp.ElementType.TABLE_ROW) {
//         var rowIndex = tagRow.getChildIndex(tagCell);
//         var inputCell;

//         // Check if there's a cell to the right
//         if (rowIndex < tagRow.getNumChildren() - 1) {
//           inputCell = tagRow.getChild(rowIndex + 1);

//           // Check if the input text is "English"
//           if (inputCell.getText() === "English") {
//             var inputLang = inputCell.getText();

//             // Process the input text
//             Logger.log('Input Lang for ' + tag + ': ' + inputLang);
//             return inputLang;
//           }
//         } else {
//           Logger.log('No cell to the right of ' + tag);
//         }
//       }
//     } else {
//       Logger.log(tag + ' is not inside a table cell');
//     }

//     // Continue searching for the same tag
//     search = body.findText(tag, search);
//   }
// }


// function translate(resultObj, lang) {
//   var translatedResultObj = {};

//   for (var key in resultObj) {
//     var prompt = `Translate the following English text to ${lang}: "${resultObj[key]}"`;
//     var translatedValue = callOpenAI(prompt);
//     translatedResultObj[key] = translatedValue;
//   }

//   return translatedResultObj;
// }

// function processTags() {
//   var doc = DocumentApp.getActiveDocument();
//   var body = doc.getBody();
//   var tag = '[* subject *]';
//   var search = body.findText(tag);

//   while (search) {
//     var tagElement = search.getElement();
//     var tagCell = getTableCell(tagElement);

//     if (tagCell) {
//       var tagRow = tagCell.getParent();

//       if (tagRow.getType() === DocumentApp.ElementType.TABLE_ROW) {
//         var rowIndex = tagRow.getChildIndex(tagCell);
//         var inputCell;

//         // Check if there's a cell to the right
//         if (rowIndex < tagRow.getNumChildren() - 1) {
//           inputCell = tagRow.getChild(rowIndex + 1);

//           var inputText = inputCell.getText();

//           // Get the index of the table row containing the tag
//           var table = tagRow.getParent();
//           var tableRows = table.getNumRows();
//           var tagRowIndex;

//           for (var i = 0; i < tableRows; i++) {
//             if (table.getRow(i) === tagRow) {
//               tagRowIndex = i;
//               break;
//             }
//           }

//           // Process the input text
//           Logger.log('Input Text for ' + tag + ' at table row ' + tagRowIndex + ': ' + inputText);
//           getAIReponse(inputText, promptElements);

//         } else {
//           Logger.log('No cell to the right of ' + tag);
//         }
//       }
//     } else {
//       Logger.log(tag + ' is not inside a table cell');
//     }

//     // Continue searching for the same tag
//     search = body.findText(tag, search);
//   }
// }

// function getTableCell(element) {
//   while (element) {
//     if (element.getType() === DocumentApp.ElementType.TABLE_CELL) {
//       return element;
//     }
//     element = element.getParent();
//   }
//   return null;
// }

// function openDialog() {
//   var html = HtmlService.createHtmlOutputFromFile('Index');
//   DocumentApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
//       .showModalDialog(html, 'Dialog title');
// }

// function createPlaceHolders() {
//   var body = DocumentApp.getActiveDocument().getBody();
//   body.appendParagraph('{title}');
//   body.appendParagraph('{genre}');
// }

// function searchAndReplaceBackup() {
//   var body = DocumentApp.getActiveDocument()
//       .getBody();

//   var client = {
//     name: 'Joe Script-Guru',
//     address: '100 Script Rd',
//     city: 'Scriptville',
//     state: 'GA',
//     zip: 94043
//   };

//   body.replaceText('{name}', client.name);
//   body.replaceText('{address}', client.address);
//   body.replaceText('{city}', client.city);
//   body.replaceText('{state}', client.state);
//   body.replaceText('{zip}', client.zip);
// }

