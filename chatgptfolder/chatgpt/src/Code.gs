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
  sidebar.setTitle('AI Tool');
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

  var content = "Your response should only include the javascript object such as: " + exampleObj + "\nStep 1: Act as a professional ad copywriter in the email marketing specialization. Here's the subject: " + prompt + ". I will provide you with extra info. Follow it carefuly while crafting your response. If it include dates, promotion details or deadlines, you must include those details. Here's the info: " + info + ". Use the AIDA formula to write an ecommerce-focused newsletter:\n- 1 (Attention): Open with a bang. Grab the reader's attention with a bold statement, fact, or question\n- 2 (Interest): Hook the reader's interest with features and benefits\n- 3 (Desire): Make the reader feel a sense of desire by showing them their life with my solution.\n- 4 (Action): Spur the reader into action and tell them what to do next (a CTA).\n\nStep 2: Based on the email that you have written, extract, refine, and write copy for all the provided elements. Here's the JavaScript Array with elements to write about: " + promptElements + ". You will also be provided with extra info to clarify the subject or give you specific requirements for the copy. Provide creative, engaging, and conversational copy in a new nested JavaScript Object within an object. Please use the same exact name keys as the provided array " + promptElements + ". For example, if promptElements[0] = 'email subject line', please generate " + optionsTotal + " copies for 'email subject line' (using the exact same keys and capitalization) and store them under 'option[i]' in a nested JavaScript object format. For the nested object keys, use exactly 'option[i]'. For example, for option1, the key should be exactly 'option1', same for 'option2', 'option3', etc. Each element should have its own object key-value pairs with the required number of options. Your response should only contain the JavaScript Object. For example: " + exampleObj + ".\n\nStep 3: For all the following steps, we will review your nested JavaScript object as the response. When asked to review and improve your copy, always put it back in the nested JavaScript object at the end. The nested JavaScript object should be your only response in the end.\n\nStep 4: Review each option for each tag copy and pay attention to word repetition. For each section, avoid repeating the same information more than once as it provides a poor user experience. For example, if the hero banner title includes '30% off on product XYZ for 3 days only', the hero banner text will not include '30% off on product XYZ': it's too repetitive and long. Ensure that the copy between tag elements is coherent and connected by maintaining a consistent tone, establishing a clear theme, and using a storytelling approach. Rewrite the copy for any repetitive elements.\n\nStep 5: Are each options for each copies for every element short, engaging, and catchy? Remember that this is an email, and the content should be easily readable on mobile devices. Here's more info for each element. The 'Subject line' should be attention-grabbing and under 6 words. For the 'email subject line' only: Use emoji if it makes the copy better. You will not put emoji in any copy except for the 'email subject line' or 'email preview text'. Use action verbs and emphasis on the gains, desired result, extra value. The 'Preview text' should compliment the subject line, giving more info on the subject of the email. Include urgency or curiosity hooks. Be brief, under 6 words. The hero banner title should be attention-grabbing. Make people dream and create excitement. It should put focus on the main subject of the email. It should be very short with active verbs. The title should be like big brands catchline or movie titles. Deep but focused, make one desire for more. The hero banner text should compliment the hero banner title. It should add urgency if possible or add a touch of details that will excite even more. For promotions, it should indicate the dates, the discount percentage, or the time sensitivity. The hero banner CTA should be short with 2 or 3 words. Use active verbs to invite people to discover the products or use their coupon codes. 'Shop now' or 'See all products' are good examples. Do not go for complicated and lengthier CTAs. The 'descriptive bloc title' is a concise and attention-grabbing headline that introduces the main message or offer of the email. It should capture the recipient's interest and encourage them to continue reading. Best practices for writing 'descriptive bloc titles' are in the between the next triple backticks:\n\n```- Clear and Compelling: Use language that clearly conveys the value or benefit of your message or offer. Make it compelling to pique the reader's curiosity and encourage them to read further.\n- Keep it Concise: Aim for a title that is short and to the point. Avoid long and convoluted sentences that may lose the reader's attention.\n- Create a Sense of Urgency: If applicable, incorporate words or phrases that convey a sense of urgency or exclusivity to prompt immediate action.```\n\nThe 'descriptive bloc text' provides additional information and context about the message or offer presented in the email. It elaborates on the value proposition and helps to engage the reader further. The 'descriptive bloc text' follow the following rules in triple backticks::\n\n```- Focus on Benefits: Highlight the key benefits or advantages of the product, service, or offer you're promoting. Explain how it can solve a problem or improve the recipient's life in a clear and concise manner.\n- Use Persuasive Language: Craft the text using persuasive language, such as power words or emotional triggers, to evoke a response from the reader. Appeal to their desires, aspirations, or pain points.\n- Keep it Scannable: Break the text into shorter paragraphs or bullet points to enhance readability. \n-Include all the details about the sale, promotion, or product launch: promo code, discount percentage, promotion dates, deadlines, conditions, or eligible products. For example, if we have info about the promotion that it will be a 30% Buy One Get One Free from July 15th to July 18th, you must use this info for this copy```\n\nThe 'descriptive bloc CTA' is a compelling button that directs the reader to take a specific action, such as making a purchase, signing up, or exploring more. It should be clear, concise, and enticing. Consider the following best practices for writing 'descriptive bloc CTAs':\n\n```- Use Action-oriented Verbs: Begin the CTA with action-oriented verbs that clearly convey what the reader should do. Examples include \"Shop now,\" \"Discover more,\" \"Get started,\" or \"Claim your discount.\"\n- Highlight Value or Incentives: If applicable, emphasize any discounts, limited-time offers, freebies, or exclusive benefits associated with taking the desired action. This creates a sense of value and urgency.```\n\nFor the 'product tiles bloc title' and the 'product tiles bloc description' always focus the copy on the related theme. For example, if the subject of the email is 'Summer cake sale', the product tiles title and text will have to mention the cakes. If necessary, rewrite the copy for any elements that are too lengthy.\n\nStep 6: Revise the subject line and preheader text to make them excellent and compelling. Craft subject lines and preheader text that are attention-grabbing, compelling, and irresistible. Use powerful and impactful words to create a sense of urgency, curiosity, or value. Continuously refine the copy until it becomes the greatest and most compelling subject line and preheader text possible.\n\nStep 5: Act as a veteran Conversion Rate Optimization Expert and revise the email copy. Ensure that it generates a high number of clicks and frames the readers' mindset to click, shop, and convert. Maximize the conversion rate by optimizing the tag copies.\n\nStep 7: Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n\nStep 8: Use the established and clear theme from Step 1. Identify the main theme or message of the email and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n\nStep 9: Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed. When you are done and ready to respond, please look at the response. Is it a JavaScript object only? If not, please fix it so that it contains ONLY the JavaScript object such as: " + exampleObj;


  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}
        ],
      "model": "gpt-3.5-turbo-0613",

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



function requestTranslation1(data1, lang, platformToServe) {
  // Configure the API request
  var stringToTranslate = JSON.stringify(data1);
  var langToTranslateTo = lang;
  var statusLog = "start of request translation 1";

  // Make the API call to the translation service
  var apiKey = getApiKey();
 var exampleObj = {
    "email subject line": {
      "option1": "translated copy1",
      "option2": "translated copy2",
      "option3": "translated copy3",
    }
  };

   var exampleObj = {
    "Primary Text": {
      "option1": "translated copy1",
      "option2": "translated copy2",
      "option3": "translated copy3",
    }
  };

  if (platformToServe === "Email") {

    var content = "Your response should only include the javascript object such as: " + exampleObj + "Act as an experienced linguist that specializes in translation design guidelines from English to French. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. The language is: " +langToTranslateTo + " and here's the object :" + stringToTranslate + ". Generate compelling marketing translation for an email campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each section of the email, including subject lines, opening lines, body paragraphs, and closing statements. The final translated copy should be ready to use in real email marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'email subject line', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options. Your response should only contain the Javascript Object. For example: " + exampleObj ;

  } else if (platformToServe === "Facebook") {
     
    var content = "Your response should only include the javascript object such as: " + exampleObj + "Act as an experienced linguist that specializes in translation for Facebook Ads from English to French. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. The language is: " +langToTranslateTo + " and here's the object :" + stringToTranslate + ". Generate compelling marketing translation for a Facebook campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each element of the ad. The final translated copy should be ready to use in real facebook marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'Primary Text', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options. Your response should only contain the Javascript Object. For example: " + exampleObj ;
  }
  
  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}],
      "model": "gpt-3.5-turbo-0613",
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
    
    statusLog += "translatedResultString:"+ translatedResultString;
 
    var translatedResultObj = JSON.parse(translatedResultString);

  //return translatedResultObj;
  return {result: translatedResultObj, statusLog: statusLog};
}





function requestDesignTranslation(data, lang) {
  // Configure the API request 
  var stringToTranslate = data;
  var langToTranslateTo = lang;


  // Make the API call to the translation service
  var apiKey = getApiKey();
 
  var exampleObj = {
  "Option1" : {
  "Description":"translateIdea",
  "Background": "translateIdea",
  "DesignElement": "translateIdea",
	}};

  var content = "Your response should only include the javascript object such as: " + exampleObj + "Act as an experienced linguist that specializes in translation marketing copy from English to foreign language. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. The language is: " +langToTranslateTo + " and here's the object :" + stringToTranslate + ". Generate compelling marketing translation for an email campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each section of the email, including subject lines, opening lines, body paragraphs, and closing statements. The final translated copy should be ready to use in real email marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'email subject line', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options. Your response should only contain the Javascript Object. For example: " + exampleObj;
  
  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}],
      "model": "gpt-3.5-turbo-0613",
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
function getGPTDesignResponse(lang, heroBannerTitle, heroBannerText, heroBannerCTA, subject, info){
  var apiKey = getApiKey();
  var exampleObj = {
"Option1" : {
  "Description":"idea",
  "Background": "idea",
  "DesignElement": "idea",
	}
};


var content = "Your response should only include the JavaScript object such as: " + JSON.stringify(exampleObj) + ". Keep the object keys as is but make sure to give the ideas in French (Québec). We're embarking on an electrifying email campaign. Your role as a Marketing Specialist, Motion Designer Team Lead, Hipster Street Graffiti Artist, and JavaScript Programmer is essential. We're focusing on creating a hero banner for an email that instantly engages and grabs the reader's attention in the first 2 seconds. Provide your design guideline options as well as a description of the concept in a nested JavaScript object. For example: " + JSON.stringify(exampleObj) + ". Please use the same keys as the nested JavaScript object: we will access each key, the keys should be identical. For example, your response (in a nested JavaScript object) should include option[i] with 'Description', 'Background', 'DesignElement' - in the same order as provided. For each, provide design guidelines for the hero banner as per your expertise. Your task involves understanding the provided hero banner copy, subject, and extra info, then deciding how to highlight these elements for maximum click-through rate. For all design options and techniques: do not propose custom illustrations or custom photoshoots. We have access to products photos but only on a white background. We may contour and photoshop it, but they will be part of a 'collage' rather than a native photoshoot. Your concepts will take these details into consideration.\n\nRemember, your response should ONLY include the JavaScript object in French (Québec).\n\nHere's the copy for the banner: title: " + heroBannerTitle + ". Here's the text: " + heroBannerText + ". And here's the CTA: " + heroBannerCTA + ". The subject is: "+ subject + ". The Extra info: " + info + ". We're looking for three design guidelines across varying complexity levels and styles. For each option, you can choose between several types of design and animation techniques. Here are some examples to pick and develop on: GIF Animation (example : Text Fade-in/Fade-out, Product Showcase, Text Animation, Highlighting/Underlining, Text Swapping, Progress Bar/Countdown or Particle Effects), Bubble Elements, Typography Effects (example : Bold and Oversized Headlines, Layered Typography, Typography Masks, Handwritten Typography, Contrast and Emphasis), Lifestyle Photos, product images, and colorful background. For each option, you may pick what techniques are most appropriate with your expertise and elaborate on it with examples. For example, for a GIF technique, specify to make a 2-frame GIF with Text Fade-in/Fade-out to help put emphasis on the 'Once in a year' mega sale. Since we want different styles for each option, here are more info for each one of them: \n\n\"Option1\": Use the GIF and choose one of the examples and elaborate.\n\"Option2\": Use the Bubble element and explain what to put in it and how to align the rest of the designs.\n\"Option3\": Choose a Typography effect and explain how to use it with the provided text and info.\n\nProvide your design guideline options in a nested JavaScript object. Remember, your descriptions should be succinct yet vibrant, capturing the design essence in 3 short sentences. Do indicate which elements to focus on for each design. In the 'Description': Use 1 short sentences to explain your concept with emotions and vivid imagination. Call out what techniques you use : GIF, typography, etc.\n\nYour design guidelines should not always include the same elements. Each option should be different to encourage maximum creativity. For example, don't include a Bubble Element in Option1, Option2, and Option3. You may use Bubble in Option1 and Text highlight in Option2, for example. When you are done, review the whole response, make sure you do not include custom illustrations or effects that do not work for an email. The only animations are small GIFs. You may include design ideas for the CTA if you have ideas, but it will always be a focus in the design by default, no need to mention that.\n\nOur goal is to impress and inspire our recipients, encouraging them to click through with your innovative and visually pleasing hero banner designs. Let's create a memorable experience! Remember, your response should ONLY include the JavaScript object and the ideas should be in French (Québec).";


  
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  content}],
      "model": "gpt-3.5-turbo-0613",
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
    var logMessages = [];
    logMessages.push('Result string: ' + resultString);

    var resultObj;
    try {
      resultObj = JSON.parse(resultString);
      logMessages.push('Parsed result object:', resultObj);
    } catch (error) {
      logMessages.push('Error parsing result string:', error);
    }

    if (lang === 'English') {
      return resultObj;
    } else {
      return { result: resultString, logs: logMessages };
    }
  }










function updateDocument(finalObjectResult) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  for (var key in finalObjectResult) {
    var value = finalObjectResult[key];
    if (value !== '') {
      body.replaceText(key, value);
    }
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

function getAsanaApiKey() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('asanakey');
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
    "model": "gpt-3.5-turbo-0613",
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


function addDesignTips(designTips) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
  
  // Create a table
  var table = body.insertTable(1);
    
  // Create the first row with the text "Design ideas"
  var row1 = table.appendTableRow();
  var cell1 = row1.appendTableCell();
  cell1.setText("Design ideas");
  cell1.getChild(0).asText().setFontSize(10); // Set font size to 11
  
  // Create the second row with the "Design Tips" variable
  var row2 = table.appendTableRow();
  var cell2 = row2.appendTableCell();
  cell2.setText("Références glossaire si jamais ça peut vous être utile : https://docs.google.com/document/d/1Ou2kpFCJawtVQSV9FuNZuhIgOnM5hAkS4VgcUlp6YBo/edit \n\n" + designTips.toString());
  cell2.getChild(0).asText().setFontSize(10); // Set font size to 11

  //
}

//------



function getGPTResponseWeather(prompt, promptElements, optionsTotal, lang, info){
  var apiKey = getApiKey();
 
    // configure the API request to OpenAI

    var data = {
      "messages": [
        {"role": "system", "content": ""},

        {"role": "user", "content":  "What is the weather like in Montreal?"}
        ],
      "model": "gpt-3.5-turbo-0613",
       "functions": [
    {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  ],
      "function_call": "get_current_weather"
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





function getGPTResponseSuper(prompt, promptElements, optionsTotal, lang, info, clientTraits, elementCopyExamples, numberOfExamples){
  var apiKey = getApiKey();
  var statusLog = "start of getGPTResponseSuper \n";

  var emailSubjectLineExamples_upvotes;
  var emailPreviewTextExamples_upvotes;
  var heroBannerTitleExamples_upvotes;
  var heroBannerTextExamples_upvotes;
  var heroBannerCTAExamples_upvotes;
  var descriptiveBlockTitleExamples_upvotes;
  var descriptiveBlockTextExamples_upvotes;
  var descriptiveBlockCTAExamples_upvotes;
  var productBlockTitleExamples_upvotes;
  var productBlockTextExamples_upvotes;
  var productBlockCTAExamples_upvotes;

  var emailSubjectLineExamples_downvotes;
  var emailPreviewTextExamples_downvotes;
  var heroBannerTitleExamples_downvotes;
  var heroBannerTextExamples_downvotes;
  var heroBannerCTAExamples_downvotes;
  var descriptiveBlockTitleExamples_downvotes;
  var descriptiveBlockTextExamples_downvotes;
  var descriptiveBlockCTAExamples_downvotes;
  var productBlockTitleExamples_downvotes;
  var productBlockTextExamples_downvotes;
  var productBlockCTAExamples_downvotes;

  var traitsList = "";
  for (var key in clientTraits) {
    if (clientTraits.hasOwnProperty(key)) {
      traitsList += key + ": " + clientTraits[key] + "\n";
    }
  }

  function formatExamples(examplesArray) {
      var formatted = "";
      
      for (var i = 0; i < examplesArray.length; i++) {
        formatted += "- Example " + (i + 1) + ": " + examplesArray[i].trim() + "\n";
      }

      return formatted;
  }
  
  if (elementCopyExamples["Email Subject Line_upvotes"]){
    emailSubjectLineExamples_upvotes = formatExamples(elementCopyExamples["Email Subject Line_upvotes"]);
  }

  if (elementCopyExamples["Email Preview Text_upvotes"]){
    emailPreviewTextExamples_upvotes = formatExamples(elementCopyExamples["Email Preview Text_upvotes"]);
  }

  if (elementCopyExamples["HeroBanner Title_upvotes"]){
    heroBannerTitleExamples_upvotes = formatExamples(elementCopyExamples["HeroBanner Title_upvotes"]);
  }

  if (elementCopyExamples["HeroBanner Text_upvotes"]){
    heroBannerTextExamples_upvotes = formatExamples(elementCopyExamples["HeroBanner Text_upvotes"]);
  }

  if (elementCopyExamples["HeroBanner CTA_upvotes"]){
    heroBannerCTAExamples_upvotes = formatExamples(elementCopyExamples["HeroBanner CTA_upvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock Title_upvotes"]){
    descriptiveBlockTitleExamples_upvotes = formatExamples(elementCopyExamples["DescriptiveBlock Title_upvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock Text_upvotes"]){
    descriptiveBlockTextExamples_upvotes = formatExamples(elementCopyExamples["DescriptiveBlock Text_upvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock CTA_upvotes"]){
    descriptiveBlockCTAExamples_upvotes = formatExamples(elementCopyExamples["DescriptiveBlock CTA_upvotes"]);
  }

  if (elementCopyExamples["ProductBlock Title_upvotes"]){
    productBlockTitleExamples_upvotes = formatExamples(elementCopyExamples["ProductBlock Title_upvotes"]);
  }

  if (elementCopyExamples["ProductBlock Text_upvotes"]){
    productBlockTextExamples_upvotes = formatExamples(elementCopyExamples["ProductBlock Text_upvotes"]);
  }

  if (elementCopyExamples["ProductBlock CTA_upvotes"]){
    productBlockCTAExamples_upvotes = formatExamples(elementCopyExamples["ProductBlock CTA_upvotes"]);
  }


//DOWNVOTES

  if (elementCopyExamples["Email Subject Line_downvotes"]){
  emailSubjectLineExamples_downvotes = formatExamples(elementCopyExamples["Email Subject Line_downvotes"]);
  }

  if (elementCopyExamples["Email Preview Text_downvotes"]){
    emailPreviewTextExamples_downvotes = formatExamples(elementCopyExamples["Email Preview Text_downvotes"]);
  }

  if (elementCopyExamples["HeroBanner Title_downvotes"]){
    heroBannerTitleExamples_downvotes = formatExamples(elementCopyExamples["HeroBanner Title_downvotes"]);
  }

  if (elementCopyExamples["HeroBanner Text_downvotes"]){
    heroBannerTextExamples_downvotes = formatExamples(elementCopyExamples["HeroBanner Text_downvotes"]);
  }

  if (elementCopyExamples["HeroBanner CTA_downvotes"]){
    heroBannerCTAExamples_downvotes = formatExamples(elementCopyExamples["HeroBanner CTA_downvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock Title_downvotes"]){
    descriptiveBlockTitleExamples_downvotes = formatExamples(elementCopyExamples["DescriptiveBlock Title_downvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock Text_downvotes"]){
    descriptiveBlockTextExamples_downvotes = formatExamples(elementCopyExamples["DescriptiveBlock Text_downvotes"]);
  }

  if (elementCopyExamples["DescriptiveBlock CTA_downvotes"]){
    descriptiveBlockCTAExamples_downvotes = formatExamples(elementCopyExamples["DescriptiveBlock CTA_downvotes"]);
  }

  if (elementCopyExamples["ProductBlock Title_downvotes"]){
    productBlockTitleExamples_downvotes = formatExamples(elementCopyExamples["ProductBlock Title_downvotes"]);
  }

  if (elementCopyExamples["ProductBlock Text_downvotes"]){
    productBlockTextExamples_downvotes = formatExamples(elementCopyExamples["ProductBlock Text_downvotes"]);
  }

  if (elementCopyExamples["ProductBlock CTA_downvotes"]){
    productBlockCTAExamples_downvotes = formatExamples(elementCopyExamples["ProductBlock CTA_downvotes"]);
  }


  statusLog += "heroBannerTitleExamples_upvotes:\n" + heroBannerTitleExamples_upvotes +  "\n";
  //statusLog += "all examples: " + JSON.stringify(elementCopyExamples) + "\n";
  //statusLog += typeof(heroBannerTitleExamples_upvotes) +  "\n";
  
  var systemContent = 
    
  "We will work together to write a highly engaging email for my client's ecommerce store.\n" +

     "Here's a list of details I will provide you with for this task:\n" +
    "- The subject that dictates the main theme and hooks of the email\n" +
    "- Extra information (called extra info) give you more details about the theme, the context or the promotional offer such as discount details or promotion dates. Dates, rebate percentage or eligibility conditions must be included in the 'Email Preview Text', the 'HeroBanner Text' and the 'DescriptiveBlock Text'.\n" +
    "- Given the list of client traits below, it is crucial to integrate them accurately into the email copy. Each 'trait[i]' specifies a unique characteristic that the email copy should reflect. It is of utmost importance to include each trait, as these are primary client requests. If a trait suggests a specific format, style, or content (e.g., 'All upper cases' or 'Include a smiley emoji'), the resultant copy should strictly follow it. Please meticulously incorporate every trait while crafting the copy. For instance, if 'trait[1]' is 'Email Subject Line should use all upper cases', a suitable response might be: 'HUGE DISCOUNT: GET 50% OFF NOW!'. Let's make sure each trait is highlighted in the suggested copy.\n" + 
    "- The Email Elements : A JS Array with elements to write copy for. Include only copy for these elements. Do not add or remove any items.\n"+

    "Here's what each element will include based on their role (if requested):\n"+
    "- The 'Email Subject Line': is attention-grabbing and under 6 words. For the 'Email Subject Line' only: Use emoji if it helps to get the reader engaged. Do not use emoji anywhere else. Use action verbs and emphasis on the gains, desired result, perceivable added-value.\n"+
    "- The 'Emai Preview Text': compliments the 'Email Subject Line', giving more info on the goal of the email. Include urgency or curiosity hooks. Be brief, under 6 words. 1 sentence only.\n"+
    "- The 'HeroBanner Title': is scroll-stopping. It makes people dream and creates excitement. Focuses on the main subject and goal of the email. Has 8 words maximum with action verbs such as 'GET', 'WIN', 'SAVE', 'DISCOVER', 'CLAIM'. The 'HeroBanner Title' should be like big brands catchline or movie titles. Deep but focused, makeS one desire for more.\n" +
    "- The 'HeroBanner Text': compliments the 'HeroBanner Title'. The 'HeroBanner Text' is only 1 sentence long with 10-12 words maximum. It should add urgency if possible or add a touch of details that will excite even more. For promotions, it should indicate the dates, the discount percentage, or the time sensitivity.\n"+ 
    "- The 'HeroBanner CTA' : has 2 or 3 words. Use active verbs to invite people to discover the products or use their coupon codes. 'Shop now' or 'See all products' are good examples. Do not go for complicated and lengthier CTAs.\n"+    
    "- The 'DescriptiveBlock Title': is a concise and attention-grabbing headline that introduces the main message or offer of the email. It captures the recipient's interest and encourage them to continue reading. Best practices for writing 'DescriptiveBlock Title' are in the between the next triple backticks:\n\n```- Clear and Compelling: Use language that clearly conveys the value or benefit of your message or offer. Make it compelling to pique the reader's curiosity and encourage them to read further.\n- Keep it Concise: Aim for a title that is short and to the point. Avoid long and convoluted sentences that may lose the reader's attention.\n- Create a Sense of Urgency: If applicable, incorporate words or phrases that convey a sense of urgency or exclusivity to prompt immediate action.```\n"+
    -"The 'DescriptiveBlock Text': additional information and context about the message or offer presented in the email. It elaborates on the value proposition and helps to engage the reader further. The 'DescriptiveBlock Text' follow the rules in triple backticks::\n\n```- Focus on Benefits: Highlight the key benefits or advantages of the product, service, or offer you're promoting. Explain how it can solve a problem or improve the recipient's life in a clear and concise manner.\n- Use Persuasive Language: Craft the text using persuasive language, such as power words or emotional triggers, to evoke a response from the reader. Appeal to their desires, aspirations, or pain points.\n- Keep it Scannable: Break the text into shorter paragraphs or bullet points to enhance readability. \n-Include all the details about the sale, promotion, or product launch: promo code, discount percentage, promotion dates, deadlines, conditions, or eligible products. For example, if we have info about the promotion that it will be a 30% Buy One Get One Free from July 15th to July 18th, you must use this info for this copy```\n"+
    "-The 'DescriptiveBlock CTA': a compelling button that directs the reader to take a specific action, such as making a purchase, signing up, or exploring more. It should be clear, concise, and enticing. Consider the following best practices for writing 'DescriptiveBlock CTA':\n\n```- Use Action-oriented Verbs: Begin the CTA with action-oriented verbs that clearly convey what the reader should do. Examples include \"Shop now,\" \"Discover more,\" \"Get started,\" or \"Claim your discount.\"\n- Highlight Value or Incentives: If applicable, emphasize any discounts, limited-time offers, freebies, or exclusive benefits associated with taking the desired action. This creates a sense of value and urgency.```\n"+
    "- The 'ProductBlock Title' and the 'ProductBlock Text' : always focus the copy on the related theme. For example, if the subject of the email is 'Summer cake sale', the 'ProductBlock Title' and text will have to mention the cakes.\n"+

    "Here's a list of instructions to applies to all of the element copies:\n"+
    "- Follow the instructions from the Client Traits\n"+
    "- Provide creative, engaging, and conversational copy\n"+
    "- Avoid repeating the same information. For example, if the 'HeroBanner Title' includes '30% off on product XYZ for 3 days only', the 'HeroBanner Text' will not include '30% off on product XYZ'. It can include 'For a limited time' or 'While quantities last' or 'HURRY!'\n"+
    "- Every element copy is short, engaging, and catchy. Remember that this is an email, and the content should be easily readable on mobile devices.\n"+
    "- Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use the established and clear theme from Step 1. Identify the main theme or message of the email and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed.\n"+
    
    "Here are the precise step to create our ecommerce email:\n"+
    "- Step1: Combine the 'Subject', the 'client traits' and the Extra Info and use the AIDA formula to write an ecommerce-focused newsletter:\n- 1 (Attention): Open with a bang. Grab the reader's attention with a bold statement, fact, or question\n- 2 (Interest): Hook the reader's interest with features and benefits\n- 3 (Desire): Make the reader feel a sense of desire by showing them their life with my solution.\n- 4 (Action): Spur the reader into action and tell them what to do next (a CTA).\n"+
    "- Step 2: Based on the email that you have written, extract, refine, and write copy for all the provided 'Email Elements'. Follow every details requested in the 'Client Traits' Stringified Object.\n"+
    "- Step 3: Review the elements as a whole, make sure no repetition of information is made\n"+
    "- Step 4: Act as a veteran Conversion Rate Optimization Expert and revise the email copy. Ensure that it generates a high number of clicks and frames the readers' mindset to click, shop, and convert. Maximize the conversion rate by optimizing the tag copies.\n"+
    "- Step 5: Follow the instructions from the Client Traits and make sure every element copy respect the instructions\n"+

    "Here are concrete examples of my favorite copies that have proven very effective in our emails. Please use these as a reference and inspiration to craft your copies. Below are the examples for each email element:\n\n"+

    "- Email Subject Line:\n" + emailSubjectLineExamples_upvotes + "\n"+
    "- Email Preview Text:\n" + emailPreviewTextExamples_upvotes + "\n"+
    "- HeroBanner Title:\n" + heroBannerTitleExamples_upvotes + "\n"+
    "- HeroBanner Text:\n" + heroBannerTextExamples_upvotes + "\n"+
    "- HeroBanner CTA:\n" + heroBannerCTAExamples_upvotes + "\n"+
    "- DescriptiveBlock Title:\n" + descriptiveBlockTitleExamples_upvotes + "\n"+
    "- DescriptiveBlock Text:\n" + descriptiveBlockTextExamples_upvotes + "\n"+
    "- DescriptiveBlock CTA:\n" + descriptiveBlockCTAExamples_upvotes + "\n"+
    "- ProductBlock Title:\n" + productBlockTitleExamples_upvotes + "\n"+
    "- ProductBlock Text:\n" + productBlockTextExamples_upvotes + "\n"+
    "- ProductBlock CTA:\n" + productBlockCTAExamples_upvotes +

     "Here's a list of copy examples that have proven to be ineffective and have received negative feedback. It's crucial that future copies do not resemble these. Kindly steer clear from creating anything similar. Avoid these examples for each element:\n" +

    "- Email Subject Line (Avoid these):\n" + emailSubjectLineExamples_downvotes + "\n"+
    "- Email Preview Text (Avoid these):\n" + emailPreviewTextExamples_downvotes + "\n"+
    "- HeroBanner Title (Avoid these):\n" + heroBannerTitleExamples_downvotes + "\n"+
    "- HeroBanner Text (Avoid these):\n" + heroBannerTextExamples_downvotes + "\n"+
    "- HeroBanner CTA (Avoid these):\n" + heroBannerCTAExamples_downvotes + "\n"+
    "- DescriptiveBlock Title (Avoid these):\n" + descriptiveBlockTitleExamples_downvotes + "\n"+
    "- DescriptiveBlock Text (Avoid these):\n" + descriptiveBlockTextExamples_downvotes + "\n"+
    "- DescriptiveBlock CTA (Avoid these):\n" + descriptiveBlockCTAExamples_downvotes + "\n"+
    "- ProductBlock Title (Avoid these):\n" + productBlockTitleExamples_downvotes + "\n"+
    "- ProductBlock Text (Avoid these):\n" + productBlockTextExamples_downvotes + "\n"+
    "- ProductBlock CTA (Avoid these):\n" + productBlockCTAExamples_downvotes;
   

  var content = "Here's the subject: " + prompt + ". Here's the extra info: " + info + ". If the extra info includes promotion dates, promo code, discount percentage or other offer specificity, include those info in your copy. Here's the JavaScript Array with elements to write about: " + promptElements +". Before proceeding, it's vital to thoroughly understand the following CLIENT TRAITS. These traits serve as guidelines, and each one is integral to crafting the email copy. Please ensure that you incorporate every single trait meticulously in the output:\n\n" + traitsList + "\nRemember, each trait plays a significant role, so it's crucial not to overlook any of them. The 'Email Preview Text', 'HeroBanner Text' and the 'ProductBlock Text' will be only 1 sentence long, keep them short and sweet.";

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "get_varied_personality_responses",
            "description": "ingest the various personality responses and provide a response for each personality",
            "parameters": {
                "type": "object",
                "properties": {
                    "dumb_and_mean": {
                        "type": "string",
                        "description": "A dumb and mean version of the response to a user's query"
                    },
                    "happy_and_helpful": {
                        "type": "string",
                        "description": "A happy and helpful version of the response to a user's query"
                    }
                },
                "required": ["dumb_and_mean", "happy_and_helpful"]
            }
        },
        {
            "name": "get_email_element_responses",
            "description": "ingest the various copywriting style and for each element requested provide a response for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                      "happy_and_helpful": {
                        "type": "array",
                        "description": "Style 2: A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["happy_and_helpful"]
                //"required": ["overexcited_and_extravagant", "happy_and_helpful", "playful_and_chill"]
            }
        },
        {
            "name": "BACKUP",
            "description": "ingest the various copywriting style and for each element requested provide a response for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "overexcited_and_extravagant": {
                        "type": "array",
                        "description": "Style 1: A overexcited and extravagant version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                    "happy_and_helpful": {
                        "type": "array",
                        "description": "Style 2: A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                        "playful_and_chill": {
                        "type": "array",
                        "description": "Style 3: A playful and chill version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["overexcited_and_extravagant", "happy_and_helpful", "playful_and_chill"]
            }
        }
    ],  
    "function_call": {"name": "get_email_element_responses"},
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    //statusLog += "replyContent: " + JSON.stringify(replyContent) + "\n";

    var rawArguments = replyContent['function_call']['arguments'];
    //statusLog += "Raw 'function_call' arguments: " + rawArguments + "\n";
    //statusLog += "Type of 'function_call' arguments: " + typeof rawArguments + "\n";

    try {
      // Replace all double backslashes with single ones, then parse the arguments
      //var responseOptions = JSON.parse(rawArguments.replace(/\\n/g, "").replace(/\\"/g, "\""));
      var responseOptions = JSON.parse(replyContent['function_call']['arguments']);
    } catch (error) {
      //statusLog += "Error parsing 'function_call' arguments: " + error + "\n";
      //statusLog += "'function_call' arguments value after error: " + rawArguments + "\n";
    }

  
    //statusLog += "responseOptions: " + JSON.stringify(responseOptions) + "\n";
    //statusLog += "clientTraits: " + JSON.stringify(clientTraits) + "\n";
  

    var result = {};
    var optionCount = 1;

    for (var personality in responseOptions) {
        var elements = responseOptions[personality];
        for (var i = 0; i < elements.length; i++) {
            var elementType = elements[i]["element type"];
            var content = elements[i]["content"];
            if (!result[elementType]) {
                result[elementType] = {};
            }
            result[elementType]["option" + optionCount] = content;
        }
        optionCount++;
    }

      if (lang === "English") {
        //return result;
        return {result: result, statusLog: statusLog};
      } else {
        return {result: result, statusLog: statusLog};
      }
  }
}

function getGPTResponseSuper_fb(prompt, promptElements, optionsTotal, lang, info, clientTraits, elementCopyExamples, numberOfExamples, theme, themeExamples) {
  var apiKey = getApiKey();
  var statusLog = "start of getGPTResponseSuper_fb \n";

  var primaryTextExamples_upvotes;
  var headlineExamples_upvotes;
  var descriptionExamples_upvotes;

  var primaryTextExamples_downvotes;
  var headlineExamples_downvotes;
  var descriptionExamples_downvotes;

  var traitsList = "";
  for (var key in clientTraits) {
    if (clientTraits.hasOwnProperty(key)) {
      traitsList += key + ": " + clientTraits[key] + "\n";
    }
  }

  function formatExamples(examplesArray) {
      var formatted = "";
      
      for (var i = 0; i < examplesArray.length; i++) {
        formatted += "- Example " + (i + 1) + ": " + examplesArray[i].trim() + "\n";
      }

      return formatted;
  }
  
  var formattedPrimary = formatExamples(themeExamples.primary);
  var formattedHeadline = formatExamples(themeExamples.headline);
  var formattedDescription = formatExamples(themeExamples.description);

  //statusLog += "formattedPrimary:\n" + formattedPrimary + "\n";
  //statusLog += "formattedHeadline:\n" + formattedHeadline + "\n";
  //statusLog += "formattedDescription:\n" + formattedDescription + "\n";

  if (elementCopyExamples["Primary Text_upvotes"]){
    primaryTextExamples_upvotes = formatExamples(elementCopyExamples["Primary Text_upvotes"]);
  }

  if (elementCopyExamples["Headline_upvotes"]){
    headlineExamples_upvotes = formatExamples(elementCopyExamples["Headline_upvotes"]);
  }

  if (elementCopyExamples["Description_upvotes"]){
    descriptionExamples_upvotes = formatExamples(elementCopyExamples["Description_upvotes"]);
  }

//DOWNVOTES

  if (elementCopyExamples["Primary Text_downvotes"]){
  primaryTextExamples_downvotes = formatExamples(elementCopyExamples["Primary Text_downvotes"]);
  }

  if (elementCopyExamples["Headline_downvotes"]){
    headlineExamples_downvotes = formatExamples(elementCopyExamples["Headline_downvotes"]);
  }

  if (elementCopyExamples["Description_downvotes"]){
    descriptionExamples_downvotes = formatExamples(elementCopyExamples["Description_downvotes"]);
  }

  var systemContent = 
    
  "Take the role of a senior Facebook Ad Manager. You manage of a big portfolio of cliens. We will work together to write a highly engaging Facebook Ad for my client's ecommerce store.\n" +

     "Here's a list of details I will provide you with for this task:\n" +
    "- The subject dictates the main hooks of the Facebook Ad\n" +
    "- The theme which is the occasion why the Facebook Ad is made for. It can be Valentine's Day, for Black Friday, for Christmas or simply for Spring Season. This will help you put context around the copy.\n" +
    "- Extra information (called extra info) give you more details about the context or the promotional offer such as discount details or promotion dates. Dates, rebate percentage or eligibility conditions must be included in the 'Primary Text'\n" +
    "- Given the list of client traits below, it is crucial to integrate them accurately into the ad copy. Each 'trait[i]' specifies a unique characteristic that the ad copy should reflect. It is of utmost importance to include each trait, as these are primary client requests. If a trait suggests a specific format, style, or content (e.g., 'All upper cases' or 'Include a smiley emoji'), the resultant copy should strictly follow it. Please meticulously incorporate every trait while crafting the copy. Let's make sure each trait is highlighted in the generated copy.\n" + 
    "- The Facebook Ad Elements : A JS Array with elements to write copy for. Include only copy for these elements. Do not add or remove any items.\n"+

    "Here's what each element will include based on their role (if requested):\n"+
    "- The 'Primary Text': This is the first piece of content users see when they scroll past your ad. It should grab attention, be engaging, and reflect the core message or offer. Use action verbs and emphasize gains, desired result, or perceivable added-value. Refer to the following examples for the format, length and style:\n" +
        "Example:" + formattedPrimary + "\n"+
        
    "- The 'Headline': This appears right below the visual content (image or video) and is bolded. The 'Headline' should be short, direct, and highlight the main offer or call to action. It has around 25 characters to make an impact. Please refer to the following examples for the format, length and style:\n" +
        "Example:" + formattedHeadline + "\n"+
        
    "- The 'Description': This is a smaller text (30 characters maximum) that appears below the 'Headline'. The 'Description' gives additional details about the offer or product. It should add urgency if possible or provide a touch of detail that will further entice the user. This should be concise with around 30 characters. Please refer to the following examples for the format, length and style:\n" +
        "Example:" + formattedDescription + "\n"+


    "Here's a list of instructions to applies to all of the element copies:\n"+
    "- Follow the instructions from the Client Traits\n"+
    "- Provide creative, engaging, and conversational copy\n"+
    "- Avoid repeating the same information. For example, if the 'Primary Text' includes '30% off on product XYZ for 3 days only', the 'Headline' will not include '30% off on product XYZ'. It can include 'For a limited time' or 'While quantities last' or 'HURRY!'\n"+
    "- Every element copy is short, engaging, and catchy. Remember that this is an ad, and the content should be easily readable on mobile devices.\n"+
    "- Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use the established and clear theme from Step 1. Identify the main theme or message of the ad and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed.\n"+

    "Here are concrete examples of my favorite copies that have proven very effective in our Facebook Ads. Please use these as a reference and inspiration to craft your copies. Below are the examples for each Ads element:\n\n"+

    "- Primary Text:\n" + primaryTextExamples_upvotes + "\n"+
    "- Headline:\n" + headlineExamples_upvotes + "\n"+
    "- Description:\n" + descriptionExamples_upvotes + "\n"+
    
     "Here's a list of copy examples that have proven to be ineffective and have received negative feedback. It's crucial that future copies do not resemble these. Kindly steer clear from creating anything similar. Avoid these examples for each element:\n" +

    "- Primary Text (Avoid these):\n" + primaryTextExamples_downvotes + "\n"+
    "- Headline (Avoid these):\n" + headlineExamples_downvotes + "\n"+
    "- Description (Avoid these):\n" + descriptionExamples_downvotes;
   

  var content =   "Based on the following example copies for a " + theme + " theme, generate a new promotional facebook ad copy. If you have the info, you may replace the placeholder [discount] or [client name] or [product] with the real info.\n" + 
    "- Primary Text:\n" + formattedPrimary + "\n"+
    "- Headline:\n" + formattedHeadline + "\n"+
    "- Description:\n" + formattedDescription + "\n"+
    "Here's the subject: " + prompt + ". Here's the theme: " + theme + ". Here's the extra info: " + info + ". If the extra info includes promotion dates, promo code, discount percentage or other offer specificity, include those info in your copy. Here's the JavaScript Array with elements to write about: " + promptElements +". Before proceeding, it's vital to thoroughly understand the following CLIENT TRAITS. These traits serve as guidelines, and each one is integral to crafting the ad copy. Please ensure that you incorporate every single trait meticulously in the output:\n\n" + traitsList + "\nRemember, each trait plays a significant role, so it's crucial not to overlook any of them.";

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "get_varied_personality_responses",
            "description": "ingest the various personality responses and provide a response for each personality",
            "parameters": {
                "type": "object",
                "properties": {
                    "dumb_and_mean": {
                        "type": "string",
                        "description": "A dumb and mean version of the response to a user's query"
                    },
                    "happy_and_helpful": {
                        "type": "string",
                        "description": "A happy and helpful version of the response to a user's query"
                    }
                },
                "required": ["dumb_and_mean", "happy_and_helpful"]
            }
        },
        {
            "name": "get_facebook_ad_element_responses",
            "description": "Be in character and create a compelling Facebook ad copy using the provided information about the client, the theme and the preferences. Each tone should be unique and extreme",
            "parameters": {
                "type": "object",
                "properties": {
                      "happy_and_helpful": {
                        "type": "array",
                        "description": "A happy and helpful version of the facebook ad copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                      "overexcited_and_extravagant": {
                        "type": "array",
                        "description": "An overexcited and extravagant version of the facebook ad copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                        "playful_and_chill": {
                        "type": "array",
                        "description": "A playful and chill version of the facebook ad copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                },
                "required": ["happy_and_helpful", "overexcited_and_extravagant", "playful_and_chill"]
                //"required": ["overexcited_and_extravagant", "happy_and_helpful", "playful_and_chill"]
            }
        },
        {
            "name": "BACKUP",
            "description": "ingest the various copywriting style and for each element requested provide a response for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "overexcited_and_extravagant": {
                        "type": "array",
                        "description": "Style 1: A overexcited and extravagant version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                    "happy_and_helpful": {
                        "type": "array",
                        "description": "Style 2: A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                        "playful_and_chill": {
                        "type": "array",
                        "description": "Style 3: A playful and chill version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["overexcited_and_extravagant", "happy_and_helpful", "playful_and_chill"]
            }
        }
    ],  
    "function_call": {"name": "get_facebook_ad_element_responses"},
    //"function_call": "auto",
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    statusLog += "replyContent: " + JSON.stringify(replyContent) + "\n";

    var rawArguments = replyContent['function_call']['arguments'];
    statusLog += "Raw 'function_call' arguments: " + rawArguments + "\n";
    //statusLog += "Type of 'function_call' arguments: " + typeof rawArguments + "\n";

    try {
      // Replace all double backslashes with single ones, then parse the arguments
      //var responseOptions = JSON.parse(rawArguments.replace(/\\n/g, "").replace(/\\"/g, "\""));
      var responseOptions = JSON.parse(replyContent['function_call']['arguments']);
    } catch (error) {
      //statusLog += "Error parsing 'function_call' arguments: " + error + "\n";
      //statusLog += "'function_call' arguments value after error: " + rawArguments + "\n";
    }

  
    statusLog += "responseOptions: " + JSON.stringify(responseOptions) + "\n";
    //statusLog += "clientTraits: " + JSON.stringify(clientTraits) + "\n";
  

    var result = {};
    var optionCount = 1;

    for (var personality in responseOptions) {
        var elements = responseOptions[personality];
        for (var i = 0; i < elements.length; i++) {
            var elementType = elements[i]["element type"];
            var content = elements[i]["content"];
            if (!result[elementType]) {
                result[elementType] = {};
            }
            result[elementType]["option" + optionCount] = content;
        }
        optionCount++;
    }

      if (lang === "English") {
        //return result;
        return {result: result, statusLog: statusLog};
      } else {
        return {result: result, statusLog: statusLog};
      }
  }
}


var systemContent = 
    
  "We will work together to write a highly engaging Facebook Ad for my client's ecommerce store.\n" +

     "Here's a list of details I will provide you with for this task:\n" +
    "- The subject dictates the main hooks of the Facebook Ad\n" +
    "- The theme which is the occasion why the Facebook Ad is made for. It can be Valentine's Day, for Black Friday, for Christmas or simply for Spring Season. This will help you put context around the copy.\n" +
    "- Extra information (called extra info) give you more details about the context or the promotional offer such as discount details or promotion dates. Dates, rebate percentage or eligibility conditions must be included in the 'Primary Text'\n" +
    "- Given the list of client traits below, it is crucial to integrate them accurately into the ad copy. Each 'trait[i]' specifies a unique characteristic that the ad copy should reflect. It is of utmost importance to include each trait, as these are primary client requests. If a trait suggests a specific format, style, or content (e.g., 'All upper cases' or 'Include a smiley emoji'), the resultant copy should strictly follow it. Please meticulously incorporate every trait while crafting the copy. Let's make sure each trait is highlighted in the generated copy.\n" + 
    "- The Facebook Ad Elements : A JS Array with elements to write copy for. Include only copy for these elements. Do not add or remove any items.\n"+

    "Here's what each element will include based on their role (if requested):\n"+
//stuff


    "Here's a list of instructions to applies to all of the element copies:\n"+
    "- Follow the instructions from the Client Traits\n"+
    "- Provide creative, engaging, and conversational copy\n"+
    "- Avoid repeating the same information. For example, if the 'Primary Text' includes '30% off on product XYZ for 3 days only', the 'Headline' will not include '30% off on product XYZ'. It can include 'For a limited time' or 'While quantities last' or 'HURRY!'\n"+
    "- Every element copy is short, engaging, and catchy. Remember that this is an ad, and the content should be easily readable on mobile devices.\n"+
    "- Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use the established and clear theme from Step 1. Identify the main theme or message of the ad and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n"+
    "- Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed.\n"

    //real examples
    //upvotes
    //Downvotes
    ;

function requestTranslation(dataToTranslate, lang){
  // Configure the API request
  
  var objectToTranslate = dataToTranslate
  var langToTranslateTo = lang;
  
  var apiKey = getApiKey();

  var systemContent = "Act as an experienced linguist that specializes in translation design guidelines from English to French. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. Generate compelling marketing translation for an email campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each section of the email. The final translated copy should be ready to use in real email marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'email subject line', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options.";

  var content = "The language is: " +langToTranslateTo + " and here's the stringified javascript object :" + objectToTranslate + ". Please translate the values in this object in the right language while keeping to essence of the copy and adapting it to the new culture and expressions. Use the same keys provided. For example, 'Email Subject Line' should be the same key used in your response.";

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "get_email_element_translated",
            "description": "ingest the various copywriting style and for each element requested provide a translated response for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "happy_and_helpful": {
                        "type": "array",
                        "description": "Style 2: A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["happy_and_helpful"]
            }
        },
        {
            "name": "backup",
            "description": "ingest the various copywriting style and for each element requested provide a translated response for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "overexcited_and_extravagant": {
                        "type": "array",
                        "description": "Style 1: A overexcited and extravagant version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                    "happy_and_helpful": {
                        "type": "array",
                        "description": "Style 2: A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    },
                        "playful_and_chill": {
                        "type": "array",
                        "description": "Style 3: A playful and chill version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["overexcited_and_extravagant", "happy_and_helpful", "playful_and_chill"]
            }
        }
    ],  
    "function_call": ["get_email_element_translated"],
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    var responseOptions = JSON.parse(replyContent['function_call']['arguments']);
  
    var result = {};
    var optionCount = 1;

    for (var personality in responseOptions) {
        var elements = responseOptions[personality];
        for (var i = 0; i < elements.length; i++) {
            var elementType = elements[i]["element type"];
            var content = elements[i]["content"];
            if (!result[elementType]) {
                result[elementType] = {};
            }
            result[elementType]["option" + optionCount] = content;
        }
        optionCount++;
    }


  return result;
  }

  return null;
}



function getGPTCorrection(subject, lang, info, promptElements, traitsArray, clientTraits, storedFinalObjectResult){
  var apiKey = getApiKey();
  var statusLog = "start off getGPTCorrection ___";
  
  var systemContent = "Act as a professional email manager with 10 years of experience in email creation. Your task is to review this email copy element type by element type. To give you more context, here's a list to help you understand the task: \n" +
  
    "(1) The subject that dictates the main theme and hooks of the email\n" +
    "(2) Extra information (called extra info) about the theme, the context or the promotional offer such as discount details or promotion dates. Dates, rebate percentage or eligiƒbility conditions must be included in the 'Email Preview Text', the 'HeroBanner Text' and the 'DescriptiveBlock Text'.\n" +
    "(3) The Email Elements : A JS Array with all the elements included in this task. If a correction is requested, you will use these as the object keys and include only copy for these elements. Do not add or remove any items.\n" +
    "(4) The Client Traits : **[IMPORTANT]** a stringified object that contains a list of specific details about the industry, the client's needs and the client's special requests. Each key-value pair will give you a trait to respect for all copies. ALWAYS **prioritize** and ALWAYS **adhere** to every trait mentioned in this object. Pay **utmost attention** to the client's desired copy tone, brand guide, words to avoid, and copy length, as specified in this object.\n" + 
    "(5) The Email Elements Copy: An object with all the elements and their corresponding copy.\n" +
    "(6) The Requested Corrections Array : A JS Array with all the requested corrections for the Email Elements Copy. Each elements of the array must ALWAYS be respected. For example, if the first element indicate to include a 'sun emoji' and the second element indicates 'please use upper case letters', you must include the 'sun emoji' AND 'use upper case letters'.\n" +

  "Your task is to improve the elements copy as requested by the corrections and return the same object with the updated copies along with the unchanged elements.";
  
  var content = "Here's the (1) Subject: " + subject + ". Here's the (2) extra info: " + info + ". If the extra info includes promotion dates, promo code, discount percentage or other offer specificity, include those info in your copy. Here's the (3) JavaScript Array with elements to be use as the response object 'keys' if a correction if requested: " + promptElements +". Here's an important piece of context regarding the (4) Client Traits that you must follow carefully:" + JSON.stringify(clientTraits) +". Here are the (5) Email Elements Copy:" + storedFinalObjectResult + ". And here is the (6) Requested Corrections Array:" + traitsArray + ". Return the requested elements with their respective corrections only. You will only modify the requested corrections.";

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "get_email_element_corrections",
            "description": "ingest the various copywriting style and for each element requested, provide element corrections for each style. Each style should be unique and will influence greatly the copy output. Be in caracter.",
            "parameters": {
                "type": "object",
                "properties": {
                      "happy_and_helpful": {
                        "type": "array",
                        "description": "A happy and helpful version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["happy_and_helpful"]
            }
        },
        {
            "name": "review_and_edit_email_element_copy",
            "description": "For each element requested and based on the client traits and correction requests, provide element copy corrections.",
            "parameters": {
                "type": "object",
                "properties": {
                      "email_correction": {
                        "type": "array",
                        "description": "A new and revised version of the email copy.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "element type": {"type": "string"},
                                "content": {"type": "string"}
                            },
                            "required": ["element type", "content"]
                        }
                    }
                },
                "required": ["email_correction"]
            }
        },

    ],  
    "function_call": {"name": "review_and_edit_email_element_copy"},
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    //statusLog += "replyContent: " + JSON.stringify(replyContent) + "\n";

    var rawArguments = replyContent['function_call']['arguments'];
    //statusLog += "Raw 'function_call' arguments: " + rawArguments + "\n";
    //statusLog += "Type of 'function_call' arguments: " + typeof rawArguments + "\n";

    try {
      // Replace all double backslashes with single ones, then parse the arguments
      //var responseOptions = JSON.parse(rawArguments.replace(/\\n/g, "").replace(/\\"/g, "\""));
      var responseOptions = JSON.parse(replyContent['function_call']['arguments']);
    } catch (error) {
      statusLog += "Error parsing 'function_call' arguments: " + error + "\n";
      statusLog += "'function_call' arguments value after error: " + rawArguments + "\n";
    }

  
    //statusLog += "responseOptions: " + JSON.stringify(responseOptions) + "\n";
    //statusLog += "clientTraits: " + JSON.stringify(clientTraits) + "\n";
    statusLog += "Prompt elements: " + JSON.stringify(promptElements) + "___";
    statusLog += "storedFinalObjectResult: " + JSON.stringify(storedFinalObjectResult) + "___";
    
    var result = {};
    var optionCount = 1;

    for (var personality in responseOptions) {
        var elements = responseOptions[personality];
        for (var i = 0; i < elements.length; i++) {
            var elementType = elements[i]["element type"];
            var content = elements[i]["content"];
            if (!result[elementType]) {
                result[elementType] = {};
            }
            result[elementType]["option" + optionCount] = content;
        }
        optionCount++;
    }


    return {result: result, statusLog: statusLog};

  }
}

function getGPTTraits(userInput, ClientTraits){
  var apiKey = getApiKey();
  var statusLog = "start of getGPTTraits ___";
  
  var systemContent = "Act as a professional account director that has front-faced marketing agency clients everyday for the last 25 years. You know how to read people and how to interpret their requests and demands. Your task is to takes their requests and queries and steamline them into general bullet points for your agency staff to work on their projects. The project includes 100% marketing copywritting (emails, ads, etc.) Be as general as possible to keep the list as open and flexible as possible. Here's what I will give you to help you extract the client's copywritting preferences and traits:\n" +
  
    "(1) The input for modifications on current projects : these will be very specific to the current projects, you must steamline and generalize the preference and general idea behind it. You may add a note in parenthesis like (SPECIFIC) to the requests that specific to one projet which should not affect futurs projects. For example, if the requests asks you to mention the color RED, this is too specific, you may add the preference with a note like : Mention the model with the color red (SPECIFIC)\n" +
    "(2) The existing Client Traits object : this will give you a better idea of what they usual prefer and like.\n";
  
  var content = "Here's the (1) input: " + userInput + ". Here's the (2) Client Traits: " + ClientTraits;

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "get_copywriting_trait",
            "description": "Extract copywritting traits and preferences from a given input.",
            "parameters": {
                "type": "object",
                "properties": {
                      "steamlined_and_helpful": {
                        "type": "array",
                        "description": "A streamlined and helpful rephrasing of an account copywritting traits and preferences.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "preference": {"type": "string"}
                            },
                            "required": ["preference"]
                        }
                    }
                },
                "required": ["steamlined_and_helpful"]
            }
        },
    ],  
    "function_call": {"name": "get_copywriting_trait"},
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    //statusLog += "replyContent: " + JSON.stringify(replyContent) + "\n";

    var rawArguments = replyContent['function_call']['arguments'];
    statusLog += "Raw 'function_call' arguments: " + rawArguments + "\n";
    statusLog += "Type of 'function_call' arguments: " + typeof rawArguments + "\n";

    var result = rawArguments;

    return {result: result, statusLog: statusLog};

  } else {
    statusLog += "not a function call from api"
    return {result: result, statusLog: statusLog};
  }
}


function cleanUpTraits(traitsArray){
  var apiKey = getApiKey();
  var statusLog = "start of cleanUpTraits ___";
  
  var systemContent = "Act as a professional business analyst. We are profiling our clients and cleaning up our databases. You will be given a list of copywritting preferences that help our teams understand the client's needs faster when we need to create copy for marketing material. Each element will be separated by a coma in the provided Array. Your task is to synthetise the preferences to reduce element count. Here's a list of example to help you : \n" +
  
  "- Remove any preference that does not add anything to guide a future copywritting task. For example, if one preference is 'Trampoline', it doesn't mean anything without context, you will remove it completely.\n" + 
  "- Remove any preference or trait that is a repetition of another one. For example, if you have one preference that is 'focus on the benefits' and another one that is 'put emphasis on the benefits of the products', you may remove both and rephrase both in 1 single preference that wil lbe meaningful. \n"+
  "- Remove any preference that are marked (SPECIFIC) which means they were added for 1 specific projet but should not be kept for the future ones.";
  
  var content = "Here's the array that contains all the info about the client: " + traitsArray + ". Your ask is to analyse the preferences and regroup the ones that are similar to make a more concise preference trait. By grouping several preferences together, you will reduce the total number of preferences.";

  // configure the API request to OpenAI
  var data = {
    "messages": [
      {"role": "system", "content": systemContent},
      {"role": "user", "content": content}
    ],
    "model": "gpt-3.5-turbo-0613",
    "functions": [
        {
            "name": "synthetise_client_profile_preferences",
            "description": "Extract and condense the client's traits and preference to be more clear and concise. Reduce repetition of the same concepts and requests. Reduce the total number of preferences.",
            "parameters": {
                "type": "object",
                "properties": {
                      "clear_and_concise": {
                        "type": "array",
                        "description": "A clear, concise but precise rephrasing of a client copywritting traits and preferences.",
                        "items": {
                            "type": "string",
                            "properties": {
                                "preference_list": {"type": "string"},
                            },
                            "required": ["preference_list"]
                        }
                    }
                },
                "required": ["clear_and_concise"]
            }
        },
    ],  
    "function_call": {"name": "synthetise_client_profile_preferences"},
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

  // Check if there is a function call in the response
  var responseData = JSON.parse(response.getContentText());
  if(responseData['choices'][0]['message']['function_call']){
    // Function call handling
    var replyContent = responseData['choices'][0]['message'];
    //statusLog += "replyContent: " + JSON.stringify(replyContent) + "\n";

    var rawArguments = replyContent['function_call']['arguments'];
    statusLog += "Raw 'function_call' arguments: " + rawArguments + "\n";
    statusLog += "Type of 'function_call' arguments: " + typeof rawArguments + "\n";

    var result = rawArguments;

    return {result: result, statusLog: statusLog};

  } else {
    statusLog += "not a function call from api"
    return {result: result, statusLog: statusLog};
  }
}











function createTables(elementsArray, lang) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  // Append the H1 styled paragraph with "EMAILS FOR {lang}" text
  var headerParagraph = body.appendParagraph("Email for " + lang);
  headerParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);

  // Loop through elementsArray to create the tables
  for (var i = 0; i < elementsArray.length; i++) {
    var category = elementsArray[i][0];
    var elements = elementsArray[i].slice(1);  // Exclude the category from the elements
    
    // Create the table
    var table = body.appendTable();
    var row = table.appendTableRow();
    var headerCell = row.appendTableCell(category);

    // Apply styling to the header cell
    headerCell.setFontSize(10);
    headerCell.setFontFamily("Nunito");
    headerCell.setBold(false);
    
    
  // Loop through the elements in the category
  for (var j = 0; j < elements.length; j++) {
    var elementName = elements[j][0];
    var elementValue = elements[j][1];
    
          // If the element name contains "product", add an extra row with "PRODUCTS" in the right column
      if (elementName.toLowerCase().includes("productblock cta")) {
        var extraRow = table.appendTableRow();
        extraRow.appendTableCell(""); // Empty left column
        extraRow.appendTableCell("//PRODUCTS"); // "PRODUCTS" in the right column
      }

    // Ensure elementName and elementValue are not null and are strings
    if (elementName && typeof elementName === 'string' && elementValue && typeof elementValue === 'string') {
      // Append a new row with the element name and value
      var elementRow = table.appendTableRow();
      elementRow.appendTableCell(elementName);
      elementRow.appendTableCell(elementValue);
    }
  }
}
}













// MONGODB


function getMongoApiKey() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('mongodb');
  return apiKey;
}

function findAllDataFromMongoDB() {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call..."
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/find';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {},
    "limit": 50,
    "projection": {
      "_id": 1,
      "name": 1
    }
  });

  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function findOneDataFromMongoDB(clientName) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n";
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/findOne';
  
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      "name": clientName
    },
    "projection": {
      "_id": 1,
      "name": 1,
      "traits": 1,
      "upvotes":1,
      "downvotes":1,
      "traits_fb": 1,
      "traits_google": 1
    }
  });
  statusLog += "Data:" + data +"\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData +"\n";
  // Process the response data as needed

  //return {result: responseData, statusLog: statusLog};
  return responseData
}


function createDataFromMongoDB(clientName) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call..."
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/insertOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "document": {
      // Add the fields and values for the document you want to insert
      "name": clientName,
      // ...
    }
  });

  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function updateDataFromMongoDB(clientName, traitsString, platformToServe) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/updateOne';
  let traitUpdate = {
        "$set": {
          "name": clientName
        }
      };

      switch (platformToServe) {
        case "Email":
          traitUpdate["$set"]["traits"] = traitsString;
          break;
        case "Facebook":
          traitUpdate["$set"]["traits_fb"] = traitsString;
          break;
        case "Google":
          traitUpdate["$set"]["traits_google"] = traitsString;
          break;
        default:
          // handle other cases or throw an error
          break;
      }

  
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to update
      "name": clientName
    },
    "update": traitUpdate
  });
  statusLog += "Data:" + data + "\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function updateDownvotes(clientName, downvotes, tag) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/updateOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to update
      "name": clientName
    },
    "update": {
      "$push": {
        ["downvotes." + tag + "_downvotes"]: downvotes
        }
    }
  });
  statusLog += "Data:" + data + "\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function updateUpvotes(clientName, upvotes, tag) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/updateOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to update
      "name": clientName
    },
  "update": {
    "$push": {
      ["upvotes." + tag + "_upvotes"]: upvotes
        }}})
  
  statusLog += "Data:" + data + "\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function deleteDataFromMongoDB(clientName) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/deleteOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to delete
      "name": clientName
    }
  });
  statusLog += "Data:" + data + "\n";

  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function removeLastUpvote(clientName, tag) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/updateOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to update
      "name": clientName
    },
    "update": {
      "$pop": {
        ["upvotes." + tag + "_upvotes"]: 1
      }
    }
  });
  statusLog += "Data:" + data + "\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function removeLastDownvote(clientName, tag) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of mongo api call...\n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/updateOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      // Add the filter criteria to identify the document(s) to update
      "name": clientName
    },
    "update": {
      "$pop": {
        ["downvotes." + tag + "_downvotes"]: 1
      }
    }
  });
  statusLog += "Data:" + data + "\n";
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return {result: responseData, statusLog: statusLog};
}

function logUsageOnServer11(prompt, timeStamp, version, lang, info, requestedCorrections, clientName) {
  var statusLog = "Start of logUsageOnServer function \n";
  statusLog += "prompt:" + prompt + " \n";
  statusLog += "timeStamp:" + timeStamp + " \n";
  statusLog += "version:" + version + " \n";
  statusLog += "lang:" + lang + " \n";
  statusLog += "info:" + info + " \n";
  statusLog += "requestedCorrections:" + requestedCorrections + " \n";
  statusLog += "clientName:" + clientName + " \n";
  return statusLog
}

function logUsageOnServer(prompt, timeStamp, version, lang, info, requestedCorrections, clientName) {
  const apiKey = getMongoApiKey();
  var statusLog = "Start of logUsageOnServer function \n"
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/insertOne';
  const data = JSON.stringify({
    "collection": "usageCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "document": {
      // Add the fields and values for the document you want to insert
      "version": version,
      "clientName": clientName,
      "prompt": prompt,
      "timeStamp": timeStamp,
      "lang": lang,
      "info": info,
      "requestedCorrections": requestedCorrections
    }
  });

  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  statusLog += "responseData:" + responseData;
  // Process the response data as needed

  return statusLog
}

function createBugReportAsanaTask(title, text, logs, bugReporter) {
  var asanaAccessToken = getAsanaApiKey(); 
  var workspaceId = '456872174481206'; 
  var projectId = '1205269472499229'; 

  var taskDetails = {
    name: `[bug report] ${title}`,
    notes: `Bug report by ${bugReporter}\n\n${text}\n\nLogs:\n${logs}`,
    projects: [projectId],
    "due_on": new Date().toISOString().split('T')[0],
    "assignee": "1200208858135731"
  };

  var options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${asanaAccessToken}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      data: {
        ...taskDetails,
        workspace: workspaceId
      }
    })
  };
  
  var response = UrlFetchApp.fetch('https://app.asana.com/api/1.0/tasks', options);
  return JSON.parse(response.getContentText());
}

function doesClientExist(clientName) {
  const apiKey = getMongoApiKey();
  const url = 'https://us-east-1.aws.data.mongodb-api.com/app/data-gkvfy/endpoint/data/v1/action/findOne';
  const data = JSON.stringify({
    "collection": "clientsCollection",
    "database": "clientsDB",
    "dataSource": "Cluster0",
    "filter": {
      "name": clientName
    },
    "projection": {
      "_id": 1,
      "name": 1
    }
  });

  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': apiKey
    },
    payload: data
  };

  const response = UrlFetchApp.fetch(url, config);
  const responseData = JSON.parse(response.getContentText());

  // Check if "document" key is present and is not null
  if (responseData.document !== null) {
    return true;  // Client exists
  }
  
  return false; // Client does not exist
}
