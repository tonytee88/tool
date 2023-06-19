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

  var content = "Your response should only include the javascript object such as: " + exampleObj + "\nStep 1: Act as a professional ad copywriter in the email marketing specialization. Here's the subject: " + prompt + ". I will provide you with extra info. Follow it carefuly while crafting your response. If it include dates, promotion details or deadlines, you must include those details. Here's the info: " + info + ". Use the AIDA formula to write an ecommerce-focused newsletter:\n- 1 (Attention): Open with a bang. Grab the reader's attention with a bold statement, fact, or question\n- 2 (Interest): Hook the reader's interest with features and benefits\n- 3 (Desire): Make the reader feel a sense of desire by showing them their life with my solution.\n- 4 (Action): Spur the reader into action and tell them what to do next (a CTA).\n\nStep 2: Based on the email that you have written, extract, refine, and write copy for all the provided elements. Here's the JavaScript Array with elements to write about: " + promptElements + ". You will also be provided with extra info to clarify the subject or give you specific requirements for the copy. Provide creative, engaging, and conversational copy in a new nested JavaScript Object within an object. Please use the same exact name keys as the provided array " + promptElements + ". For example, if promptElements[0] = 'email subject line', please generate " + optionsTotal + " copies for 'email subject line' (using the exact same keys and capitalization) and store them under 'option[i]' in a nested JavaScript object format. For the nested object keys, use exactly 'option[i]'. For example, for option1, the key should be exactly 'option1', same for 'option2', 'option3', etc. Each element should have its own object key-value pairs with the required number of options. Your response should only contain the JavaScript Object. For example: " + exampleObj + ".\n\nStep 3: For all the following steps, we will review your nested JavaScript object as the response. When asked to review and improve your copy, always put it back in the nested JavaScript object at the end. The nested JavaScript object should be your only response in the end.\n\nStep 4: Review each option for each tag copy and pay attention to word repetition. For each section, avoid repeating the same information more than once as it provides a poor user experience. For example, if the hero banner title includes '30% off on product XYZ for 3 days only', the hero banner text will not include '30% off on product XYZ': it's too repetitive and long. Ensure that the copy between tag elements is coherent and connected by maintaining a consistent tone, establishing a clear theme, and using a storytelling approach. Rewrite the copy for any repetitive elements.\n\nStep 5: Are each options for each copies for every element short, engaging, and catchy? Remember that this is an email, and the content should be easily readable on mobile devices. Here's more info for each element. The 'Subject line' should be attention-grabbing and under 6 words. For the 'email subject line' only: Use emoji if it helps to get the open. Do not use emoji anywhere else. Use action verbs and emphasis on the gains, desired result, extra value. The 'Preview text' should compliment the subject line, giving more info on the subject of the email. Include urgency or curiosity hooks. Be brief, under 6 words. The hero banner title should be attention-grabbing. Make people dream and create excitement. It should put focus on the main subject of the email. It should be very short with active verbs. The title should be like big brands catchline or movie titles. Deep but focused, make one desire for more. The hero banner text should compliment the hero banner title. It should add urgency if possible or add a touch of details that will excite even more. For promotions, it should indicate the dates, the discount percentage, or the time sensitivity. The hero banner CTA should be short with 2 or 3 words. Use active verbs to invite people to discover the products or use their coupon codes. 'Shop now' or 'See all products' are good examples. Do not go for complicated and lengthier CTAs. The 'descriptive bloc title' is a concise and attention-grabbing headline that introduces the main message or offer of the email. It should capture the recipient's interest and encourage them to continue reading. Best practices for writing 'descriptive bloc titles' are in the between the next triple backticks:\n\n```- Clear and Compelling: Use language that clearly conveys the value or benefit of your message or offer. Make it compelling to pique the reader's curiosity and encourage them to read further.\n- Keep it Concise: Aim for a title that is short and to the point. Avoid long and convoluted sentences that may lose the reader's attention.\n- Create a Sense of Urgency: If applicable, incorporate words or phrases that convey a sense of urgency or exclusivity to prompt immediate action.```\n\nThe 'descriptive bloc text' provides additional information and context about the message or offer presented in the email. It elaborates on the value proposition and helps to engage the reader further. The 'descriptive bloc text' follow the following rules in triple backticks::\n\n```- Focus on Benefits: Highlight the key benefits or advantages of the product, service, or offer you're promoting. Explain how it can solve a problem or improve the recipient's life in a clear and concise manner.\n- Use Persuasive Language: Craft the text using persuasive language, such as power words or emotional triggers, to evoke a response from the reader. Appeal to their desires, aspirations, or pain points.\n- Keep it Scannable: Break the text into shorter paragraphs or bullet points to enhance readability. \n-Include all the details about the sale, promotion, or product launch: promo code, discount percentage, promotion dates, deadlines, conditions, or eligible products. For example, if we have info about the promotion that it will be a 30% Buy One Get One Free from July 15th to July 18th, you must use this info for this copy```\n\nThe 'descriptive bloc CTA' is a compelling button that directs the reader to take a specific action, such as making a purchase, signing up, or exploring more. It should be clear, concise, and enticing. Consider the following best practices for writing 'descriptive bloc CTAs':\n\n```- Use Action-oriented Verbs: Begin the CTA with action-oriented verbs that clearly convey what the reader should do. Examples include \"Shop now,\" \"Discover more,\" \"Get started,\" or \"Claim your discount.\"\n- Highlight Value or Incentives: If applicable, emphasize any discounts, limited-time offers, freebies, or exclusive benefits associated with taking the desired action. This creates a sense of value and urgency.```\n\nFor the 'product tiles bloc title' and the 'product tiles bloc description' always focus the copy on the related theme. For example, if the subject of the email is 'Summer cake sale', the product tiles title and text will have to mention the cakes. If necessary, rewrite the copy for any elements that are too lengthy.\n\nStep 6: Revise the subject line and preheader text to make them excellent and compelling. Craft subject lines and preheader text that are attention-grabbing, compelling, and irresistible. Use powerful and impactful words to create a sense of urgency, curiosity, or value. Continuously refine the copy until it becomes the greatest and most compelling subject line and preheader text possible.\n\nStep 5: Act as a veteran Conversion Rate Optimization Expert and revise the email copy. Ensure that it generates a high number of clicks and frames the readers' mindset to click, shop, and convert. Maximize the conversion rate by optimizing the tag copies.\n\nStep 7: Maintain a consistent tone throughout the copy, whether it's friendly, conversational, or persuasive. Ensure that the tone remains consistent and cohesive. Review and rewrite the targeted tag elements as needed.\n\nStep 8: Use the established and clear theme from Step 1. Identify the main theme or message of the email and ensure that it is reflected in all tag elements. Consistency in theme helps reinforce the central idea and makes the email more impactful. Review and rewrite the targeted tag elements as needed.\n\nStep 9: Use a storytelling approach. Frame the copy within a narrative or storytelling framework. Connect the different tag elements by weaving a coherent story or progression that flows smoothly from one element to another. This approach maintains engagement and coherence. Review and rewrite the targeted tag elements as needed. When you are done and ready to respond, please look at the response. Is it a JavaScript object only? If not, please fix it so that it contains ONLY the JavaScript object such as: " + exampleObj;


  
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
  var exampleObj = {
  "Option1" : {
  "Description":"translateIdea",
  "Background": "translateIdea",
  "DesignElement": "translateIdea",
	}
  };

  var content = "Your response should only include the javascript object such as: " + exampleObj + "Act as an experienced linguist that specializes in translation design guidelines from English to French. I will provide you with a stringified javascript object in English and your task is to translate it in the requested language. The language is: " +langToTranslateTo + " and here's the object :" + stringToTranslate + ". Generate compelling marketing translation for an email campaign. The goal is to create catchy, short, engaging, and conversational copy that native speakers of the target language can easily understand. The translated copy should maintain the same level of impact, persuasion, and clarity as the original English version. Please ensure that the translated copy resonates with the target audience, captures their attention, and motivates them to take action. Pay attention to cultural nuances and adapt the language style to suit the preferences and communication style of the target audience. Provide multiple options for each section of the email, including subject lines, opening lines, body paragraphs, and closing statements. The final translated copy should be ready to use in real email marketing campaigns. Your expertise in translation and creativity in crafting compelling content are highly valued! You might get specific regional requests. For example, if you get Français (Québec) as the language, you must use words and expressions that are localized for Québec (as opposed to France). Translate only the values of the options in the provided objectif. Your response should have the same exact name keys as the provided stringied object. For example, if promptElements[0] = 'email subject line', please translate the 'option[i]' nested in the javascript object only. Each element should have its own object key-value pairs with the required number of translated options. Your response should only contain the Javascript Object. For example: " + exampleObj ;
  
  
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

function requestDesignTranslation(data, lang) {
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