function onOpen() {
  DocumentApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('createPlaceHolders')
      .addItem('Process Tags', 'processTagsInMenu')
      .addItem('Show Sidebar', 'setupSideBar')
      .addToUi();
}

function setupSideBar() {
  var html = HtmlService.createTemplateFromFile('index');
  // Evaluate the HTML template
  var sidebar = html.evaluate();
  sidebar.setTitle('Sections to Sheets');
  DocumentApp.getUi().showSidebar(sidebar);
}
 
// Creates an import or include function so files can be added
// inside the main index.
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
};

// ----------------------------------------------------------------------------------------------------------------------------------------


function getGPTResponse(prompt, promptElements, optionsTotal, lang){
  var apiKey = getApiKey();
  var exampleObj ={
    "email subject line": {
      "option1": "generated copy1",
      "option2": "generated copy2",
      "option3": "generated copy3",
      "option4": "generated copy4",
      "option5": "generated copy5"
    }
  };

  var content = "Act as a professional ad copywriter in the email marketing specialization. Here's the subject: " + prompt + ". Write copy for all the provided elements. Here's the Javascript Array with elements to write about: " + promptElements + ". Provide creative, engaging, and conversational copy in a new nested Javascript Object within an object.Please use the same exact name keys as the provided array " +promptElements+". For example, if promptElements[0] = 'email subject line', please generate " + optionsTotal + " copies for 'email subject line' (using the same words and capitalization) and store them under 'option[i]' in a nested JavaScript object format. Each element should have its own object key-value pairs with the required number of options. Your response should only contain the Javascript Object. For example: " + exampleObj;
  
  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}],
      "model": "gpt-3.5-turbo",
    };

                              
      var options = {
        'method' : 'post',
        'contentType': 'application/json',
        'payload' : JSON.stringify(data),
        'headers': {
          Authorization: 'Bearer ' + apiKey,
        },
      };

    var response = UrlFetchApp.fetch(
      'https://api.openai.com/v1/chat/completions',
      options
    );

      //Logger.log(response.getContentText());
    
    // Send the API request 
    var resultString = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
    //Logger.log(resultString);
    
    testlog = ('Result string:'+ resultString);
    var resultObj = JSON.parse(resultString);

  if (lang === "English") {

    return resultObj;
  
  } else {

    return resultString;
  }
}



function requestTranslation(data, lang) {
  // Configure the API request 
  var stringToTranslate = data;
  var langToTranslateTo = lang;

  // Make the API call to the translation service
  var apiKey = getApiKey();
  var exampleObj ={
    "email subject line": {
      "option1": "translated copy1",
      "option2": "translated copy2",
      "option3": "translated copy3",
      "option4": "translated copy4",
      "option5": "translated copy5"
    }
  };

  var content = "Your response should only include the javascript object such as: " + exampleObj + "Act as an experienced linguist that specializes in translation marketing copy from English to foreign language. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. The language is: " +langToTranslateTo + " and here's the object :" + stringToTranslate + ". Generate compelling marketing translation for an email campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each section of the email, including subject lines, opening lines, body paragraphs, and closing statements. The final translated copy should be ready to use in real email marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'email subject line', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options. Your response should only contain the Javascript Object. For example: " + exampleObj ;
  
  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}],
      "model": "gpt-3.5-turbo",
    };

                              
      var options = {
        'method' : 'post',
        'contentType': 'application/json',
        'payload' : JSON.stringify(data),
        'headers': {
          Authorization: 'Bearer ' + apiKey,
        },
      };

    var response = UrlFetchApp.fetch(
      'https://api.openai.com/v1/chat/completions',
      options
    );
    
    // Send the API request 
    var translatedResultString = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
    
    testlog = ('Result string:'+ translatedResultString);
 
    var translatedResultObj = JSON.parse(translatedResultString);

  return translatedResultObj;
}









function updateDocument(finalObjectResult) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  for (var key in finalObjectResult) {
    var value = finalObjectResult[key];
    body.replaceText(key, value);
  }
}













// ----------------------------------------------------------------------------------------------------------------------------------------


function getPromptElements() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  promptElements = [];
  var searchPattern = '\\{([^}]+)\\}';
  var search = body.findText(searchPattern);

  while (search) {
    var tag = search.getElement().asText().getText().substring(search.getStartOffset(), search.getEndOffsetInclusive() + 1);
    promptElements.push(tag);

    // Continue searching for the same pattern
    search = body.findText(searchPattern, search);
  }

  // Log the found tags
  Logger.log(promptElements);
  
  return promptElements
};

function getApiKey() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('openai');
  return apiKey;
}

function getAIReponse(prompt,promptElements){
  var body = DocumentApp.getActiveDocument()
      .getBody();
  var apiKey = getApiKey();
  

  // configure the API request to OpenAI
  var exampleObj = {
    "book_id": 1,
    "title": "The Lost City of Zorath",
    "author": "Aria Blackwood",
    "genre": "Fantasy"
  }
  
  var data = {
    "messages": [
      {"role": "system", "content": ""},

      {"role": "user", "content": "Act as a professionel adcopywritter in the email marketing specialization. Here's the subject:" +prompt +". Write copy for all the provided elements. Here's the Javascript Array with elements to write about:" +promptElements +". Provide creative, engaging and conversationnal copy in another Javascript Object with the same keys as the provided array. For example, if promptElements[0]= {title}, please generate a copy for {title} and store it in javascript object format. Your reponse should only contain the Javascript Object. For example, for a subject about books, here's a possible response:" + exampleObj}],
    "model": "gpt-3.5-turbo",
  };

                            
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data),
      'headers': {
        Authorization: 'Bearer ' + apiKey,
      },
    };

  var response = UrlFetchApp.fetch(
    'https://api.openai.com/v1/chat/completions',
    options
  );

  //let testlog = ('API response:' + response.getContentText());

  //Logger.log(response.getContentText());
  
  // Send the API request 
  var resultString = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
  //Logger.log(resultString);
  
  testlog = ('Result string:'+ resultString);

  var resultObj = JSON.parse(resultString);

  //console.log('Result object:', resultObj);

  for (var key in resultObj) {
    var tag = '{' + key + '}';

    body.replaceText(tag, resultObj[key]);
  }
  return testlog;
}


function translate(resultObj, lang) {
  var translatedResultObj = {};

  for (var key in resultObj) {
    var prompt = `Translate the following English text to ${lang}: "${resultObj[key]}"`;
    var translatedValue = callOpenAI(prompt);
    translatedResultObj[key] = translatedValue;
  }

  return translatedResultObj;
}

function processTagsInMenu(promptElements) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var tags = ['[* subject *]'];

  tags.forEach(function (tag) {
    var search = body.findText(tag);

    while (search) {
      var tagElement = search.getElement();
      var tagCell = getTableCell(tagElement);

      if (tagCell) {
        var tagRow = tagCell.getParent();

        if (tagRow.getType() === DocumentApp.ElementType.TABLE_ROW) {
          var rowIndex = tagRow.getChildIndex(tagCell);
          var inputCell;

          // Check if there's a cell to the right
          if (rowIndex < tagRow.getNumChildren() - 1) {
            inputCell = tagRow.getChild(rowIndex + 1);
          } else {
            Logger.log('No cell to the right of ' + tag);
          }

          if (inputCell) {
            var inputText = inputCell.getText();

            // Process the input text
            Logger.log('Input text for ' + tag + ': ' + inputText);
            getAIReponse(inputText, promptElements);
            return inputText;
          }
        }
      } else {
        Logger.log(tag + ' is not inside a table cell');
      }

      // Continue searching for the same tag
      search = body.findText(tag, search);
    }
  });
}

function getTableCell(element) {
  while (element && element.getType() !== DocumentApp.ElementType.TABLE_CELL) {
    element = element.getParent();
  }
  return element;
}
  
function getTags() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var tags = [];

  var searchPattern = '\\{([^}]+)\\}';
  var search = body.findText(searchPattern);

  while (search) {
    var tag = search.getElement().asText().getText().substring(search.getStartOffset(), search.getEndOffsetInclusive() + 1);
    tags.push(tag);

    // Continue searching for the same pattern
    search = body.findText(searchPattern, search);
  }

  return tags;
}
