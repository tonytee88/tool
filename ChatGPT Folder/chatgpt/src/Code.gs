function onOpen() {
  DocumentApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Load SideBar')
      .addItem('Show Sidebar', 'setupSideBar')
      .addToUi();

}

function setupSideBar() {
  var html = HtmlService.createTemplateFromFile('index');
  // Evaluate the HTML template
  var sidebar = html.evaluate();
  sidebar.setTitle('ChatGPT Super Tool');
  DocumentApp.getUi().showSidebar(sidebar);
}


// Creates an import or include function so files can be added
// inside the main index.
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
};

// ----------------------------------------------------------------------------------------------------------------------------------------


function getGPTResponse(prompt, promptElements, optionsTotal, lang, info){
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

  var content = "Your response should only include the javascript object such as: " + exampleObj + "Step 1: Act as a professional ad copywriter in the email marketing specialization. Here's the subject: " + prompt + ". Write copy for all the provided elements. Here's the Javascript Array with elements to write about: " + promptElements + ". You will also be provided with extra info to clarify the subject or give you specific requirements for the copy. The extra info is optional. If it's not empty, please take it into consideration. Here's the info: " +info +". Provide creative, engaging, and conversational copy in a new nested Javascript Object within an object. Please use the same exact name keys as the provided array " + promptElements + ". For example, if promptElements[0] = 'email subject line', please generate " + optionsTotal + " copies for 'email subject line' (using the same words and capitalization) and store them under 'option[i]' in a nested JavaScript object format. Each element should have its own object key-value pairs with the required number of options. Your response should only contain the Javascript Object. For example: " + exampleObj + ".\n\nStep 2: For all the following steps, we will review your nested JavaScript object as the response. When asked to review and improve your copy, always put it back in the nested JavaScript object at the end. The nested JavaScript object should be your only response in the end.\n\nStep 3: Review each tag copy and pay attention to word repetition. For each section, avoid repeating the same information more than once as it provides a poor user experience. Ensure that the copy between tag elements is coherent and connected by maintaining a consistent tone, establishing a clear theme, and using a storytelling approach. Rewrite the copy for any repetitive elements.\n\nStep 4: Are the copies for each element short, engaging, and catchy? Remember that this is an email, and the content should be easily readable on mobile devices. If necessary, rewrite the copy for any elements that are too lengthy.\n\nStep 5: Revise the subject line and preheader text to make them excellent and compelling. Craft subject lines and preheader text that are attention-grabbing, compelling, and irresistible. Use powerful and impactful words to create a sense of urgency, curiosity, or value. Continuously refine the copy until it becomes the greatest and most compelling subject line and preheader text possible.\n\nStep 5: Act as a veteran Conversion Rate Optimization Expert and revise the email copy. Ensure that it generates a high number of clicks and frames the readers' mindset to click, shop, and convert. Maximize the conversion rate by optimizing the tag copies.\n\nStep 6: Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n\nStep 7: Use the established and clear theme from Step 1. Identify the main theme or message of the email and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n\nStep 8: Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed. When you are done and ready to respond, please look at the reponse. Is it a javascript object only? If not, please fix it so that it contains ONLY the javascript object such as: " + exampleObj;

  
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

// start function design
function getGPTDesignResponse(heroBannerTitle, heroBannerText, heroBannerCTA, subject, info){
  var apiKey = getApiKey();
  var exampleObj = {
"Option1" : {
  "Description":"idea",
  "Background": "idea",
  "MainFocus": "idea",
  "DesignElement1": "idea",
  "DesignElement2": "idea",
  "Typography": "idea"
	}
}

//var content = "We're embarking on an electrifying email campaign. Your role as a Marketing Specialist, Motion Designer Team Lead, Hipster Street Graffiti Artist, and JavaScript Programmer is essential. We're focusing on creating a hero banner that instantly engages and grabs the reader's attention in the first 2 seconds. Provide your design guideline options as well as a description of the concept in a nested JavaScript object. For example: " + exempleObj + ". Your task involves understanding the provided hero banner copy, subject, and extra info, then deciding how to highlight these elements for maximum click-through rate. Importantly, while your concepts can be wild and artistic, keep in mind that we are a marketing agency that has access to our clients' assets, including product photos. We can place these photos within other photos but are unable to conduct new photoshoots for the hero banners. Hence, if the product is used inside the hero banner, it must take into consideration that we can photoshop it inside the photo.\n\nRemember, your response should ONLY include the JavaScript object.\n\nHere's the copy for the banner: title: " + heroBannerTitle + ". Here's the text: " + heroBannerText + ". And here's the CTA: " + heroBannerCTA + ". The subject is: "+ subject + ". The Extra info: " + info + "We're looking for three design guidelines across varying complexity levels and styles:\n\n\"All-In\": Up to 6-frames GIFs (fade in/out, background transitions, text animation, highlighting/underlining, etc.). Go wild.\n\"Simplicity in Motion\": Up to 2-frames GIFS (fade in/out, background transitions, text animation, highlighting/underlining, etc.) The concept should be cleaner, less crowded banner with a strong focus.\n\"Still Life\": No GIFs or animations here, but a focus on typography, graphics, backgrounds, and static elements.\n\nFor each option, think about specific techniques like GIF animations (fade in/out, background transitions, text animation, highlighting/underlining, etc.), bubble elements for specific highlights, typography techniques (bold/oversized headlines, gradient typography, layered typography, textual overlays, etc.), and vibrant background colors/gradients.\n\nProvide your design guideline options as JavaScript objects. Remember, your descriptions should be succinct yet vibrant, capturing the design essence in 2-3 short sentences. Do indicate which elements to focus on for each design. Infuse human names into your descriptions where possible to provide a relatable context.\n\nYour design guidelines should not always include the same elements. Each option should be different to encourage maximum creativity. For example, don't include a Bubble Element in each option. You may use Bubble in option 1 and Text highlight in option 2 for example. You may include design ideas of the CTA if you have ideas, but it will always be a focus in the design by default, no need to mention that.\n\nOur goal is to impress and inspire our recipients, encouraging them to click through with your innovative and visually pleasing hero banner designs. Let's create a memorable experience! Remember, your response should ONLY include the JavaScript object.";

var content = "give me a random javascript object with 3 keys";
  
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
