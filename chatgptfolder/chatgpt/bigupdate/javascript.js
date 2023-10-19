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


var optionsCount = 1;
const optionsTotal = 1;
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
let currentSection = 1;
const totalSections = 5;
let platformToServe = "";
const version = "1.7.2";
var notifText = "Release v1.7.2 - Aug 25th \n"+
"- New notification system implemented! \n" +
"- New tooltip system added to help you use the tool (hover the ⊕) \n" +
"- From your feedback: please make sure to use the 'Extra Info' as much as you can. See its tooltip for more info! \n";

console.log("v"+version);

window.addEventListener('load', function() {
  sidebarInit();
  createPlatformSelection();
  initUISteps();





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

function moveElementButton(button, fromSection, toSection) {
  fromSection.removeChild(button);
  toSection.appendChild(button);
}

function addClickToMoveFeature() {
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
}

async function initUIAndTooltips() {
  try {
    var step1 = await initTooltips();
    var step2 = initUISteps();
    initStep1();

  } catch (error) {
  console.error('An error occurred:', error);
      }
  }

function initStep2(platformToServe) {
  let chosenContainer = document.getElementById('chosenContainer');
  let recommendedSection = document.getElementById('recommendedSection');
  if (platformToServe === "Google") {
      chosenContainer.innerHTML = `
          <div class="label" id="chosen">Chosen Elements:</div>
          <div><button class="element-button">Headlines [kw]</button></div>
          <div><button class="element-button">Headlines [social proof]</button></div>
          <div><button class="element-button">Headlines [gen USP]</button></div>
          <div><button class="element-button">Headlines [CTA]</button></div>
          <div><button class="element-button">Descrip [kw][prod USP][CTA]</button></div>
          <div><button class="element-button">Descrip [kw][gen USP]</button></div>
          <div class="element-buttons" id="chosenSection"></div>
      `;
      recommendedSection.innerHTML = `
          <div><button class="element-button">test 123</button></div>
      `;
    addClickToMoveFeature();
    addTextFieldsForGoogle();
  } else {
    chosenContainer.innerHTML = `
        <div class="label" id="chosen">Chosen Elements:</div>
        <button class="element-button">Email Subject Line</button>
        <button class="element-button">Email Preview Text</button>
        <button class="element-button">HeroBanner Title</button>
        <button class="element-button">HeroBanner Text</button>
        <button class="element-button">HeroBanner CTA</button>
        <button class="element-button">DescriptiveBlock Title</button>
        <button class="element-button">DescriptiveBlock Text</button>
        <button class="element-button">DescriptiveBlock CTA</button>
        <button class="element-button">ProductBlock Title</button>
        <button class="element-button">ProductBlock Text</button>
        <button class="element-button">ProductBlock CTA</button>
        <div class="element-buttons" id="chosenSection"></div>
    `;
    recommendedSection.innerHTML = `
        <button class="element-button">Benefits1 Title</button>
        <button class="element-button">Benefits1 Text</button>
        <button class="element-button">Tip1 Title</button>
        <button class="element-button">Tip1 Text</button>
    `;
    addClickToMoveFeature();
    removeTinyTextFields();
  }
}

// create the platform selection screen
function createPlatformSelection() {
  // Create main container
  const containerCard = document.createElement('div');
  containerCard.id = "platformCardContainer";

  const containerTitle = document.createElement('div');
  containerTitle.id = "titleContainer";

  // Add a title above the platform cards
  const title = document.createElement('h1');
  title.textContent = "What platform do you require copy for?";
  containerTitle.appendChild(title); // Appending title to the container

  // Define platforms
  const platforms = ['Email', 'Facebook', 'Google'];

  platforms.forEach((platform) => {
      const platformDiv = document.createElement('div');
      platformDiv.className = "platformCard";
      platformDiv.textContent = platform;

      // Event listener to start workflow
      platformDiv.addEventListener('click', async function() {
        startWorkflow(platform);
        initStep2(platform);
        initUIAndTooltips();

      });

      containerCard.appendChild(platformDiv);
  });

  let midContainer = document.getElementById('midContainer');
  midContainer.insertBefore(containerCard, midContainer.firstChild);
  midContainer.insertBefore(containerTitle, midContainer.firstChild);
  
}

function startWorkflow(platform) {
  document.getElementById("navigation").style.display = 'block';
  if (platform === "Email") {
    platformToServe = "Email";
    initNavSystemEmail(); 
  } else if (platform === "Facebook") {
    platformToServe = "Facebook";
    addThemeDropdown();
    initNavSystemFacebook();
  } else if (platform === "Google") {
    platformToServe = "Google";
    addThemeDropdown();
    addKeywordInput();
    addCampaignObjectiveInput();
    addUSPInput();
    removeSubjectField();
    initNavSystemGoogle();

  }
  console.log("Selected Platform: " + platform);
}

function addThemeDropdown() {
  console.log("platformToServe: " + platformToServe)
  // Declare themeList
  let themeList;
  if (platformToServe === "Facebook") {
    themeList = ["NONE", "BF - Early Access VIP", "Black Friday week", "Black Friday","Cyber Monday","BFCM - Last Chance","BFCM - Extended"];
  } else if (platformToServe === "Google") {
    themeList = ["RSA"];
  }
  
  // Create the container div with id="adType"
  const adTypeDiv = document.createElement('div');
  adTypeDiv.id = "adType";

  // Create div with class="label"
  const labelDiv = document.createElement('div');
  labelDiv.className = "label";
  labelDiv.id="labelText";
  if (platformToServe === "Facebook") {
    labelDiv.textContent = "Theme : ";
  } else if (platformToServe === "Google") {
    labelDiv.textContent = "Ad Type : ";;
  }
  
  // Append label to adTypeDiv
  adTypeDiv.appendChild(labelDiv);

  // Create dropdown div with id="themeDropdown"
  const dropdownDiv = document.createElement('div');
  
  // Create the dropdown list (select element)
  const selectList = document.createElement('select');
  selectList.id = "themeDropdown";

  // Populate the selectList with themeList
  themeList.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme;
    selectList.appendChild(option);
  });

  // Append selectList to dropdownDiv
  dropdownDiv.appendChild(selectList);

  // Append dropdownDiv to adTypeDiv
  adTypeDiv.appendChild(dropdownDiv);

  // Insert adTypeDiv right before the div with id=subjectLabel
  const subjectLabelDiv = document.getElementById('subjectLabel');
  subjectLabelDiv.parentNode.insertBefore(adTypeDiv, subjectLabelDiv);
}

function addKeywordInput() {
  // Create a new div element to hold the label and the input field
  const newDiv = document.createElement('div');
  newDiv.id = 'keywordDiv';

  // Create a new label element and set its text content and class
  const label = document.createElement('div');
  label.textContent = 'Main Keywords';
  label.className = 'label';
  label.id = 'keywordLabel';

  // Create a new input element and set its attributes and class
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'mainKeywords';
  input.className = 'form-control';
  input.placeholder = 'Enter main keywords';

  // Append the label and input elements to the new div
  newDiv.appendChild(label);
  newDiv.appendChild(input);

  // Get the reference to the div before which we want to insert the new div
  const subjectLabelDiv = document.getElementById('subjectLabel');

  // Insert the new div right before the subjectLabelDiv
  subjectLabelDiv.parentNode.insertBefore(newDiv, subjectLabelDiv);
}

function addCampaignObjectiveInput() {
  // Create a new div element to hold the label and the input field
  const newDiv = document.createElement('div');
  newDiv.id = 'campaignObjectiveDiv';

  // Create a new label element and set its text content and class
  const label = document.createElement('div');
  label.textContent = 'Campaign Objective';
  label.className = 'label';
  label.id = 'campaignObjectiveLabel';

  // Create a new input element and set its attributes and class
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'campaignObjective';
  input.className = 'form-control';
  input.placeholder = 'Enter campaign objective';
  
  // Prefill the input field with "sell more products"
  input.value = 'sell more products';

  // Append the label and input elements to the new div
  newDiv.appendChild(label);
  newDiv.appendChild(input);

  // Get the reference to the div before which we want to insert the new div
  const subjectLabelDiv = document.getElementById('subjectLabel');

  // Insert the new div right before the subjectLabelDiv
  subjectLabelDiv.parentNode.insertBefore(newDiv, subjectLabelDiv);
}

function addUSPInput() {
  // Create a new div element to hold the label and the input field
  const newDiv = document.createElement('div');
  newDiv.id = 'uspDiv';

  // Create a new label element and set its text content and class
  const label = document.createElement('div');
  label.textContent = 'USPs';
  label.className = 'label';
  label.id = 'uspLabel';

  // Create a new textarea element and set its attributes and class
  const textarea = document.createElement('textarea');
  textarea.id = 'usp';
  textarea.className = 'form-control large-input';  // Use 'large-input' class to make it bigger
  textarea.placeholder = 'Enter USPs here... Include at least 1 social proof, 1 generic USP about the business and a product-specific one';

  // Prefill the textarea with a default value
  textarea.textContent = 'Expert knowledge, Customer focused, 4.7 ratings, best price on wooden chairs on the market'; 

  // Append the label and textarea elements to the new div
  newDiv.appendChild(label);
  newDiv.appendChild(textarea);

  // Get the reference to the div before which we want to insert the new div
  const subjectLabelDiv = document.getElementById('subjectLabel');

  // Insert the new div right before the subjectLabelDiv
  subjectLabelDiv.parentNode.insertBefore(newDiv, subjectLabelDiv);
}

function removeSubjectField() {
  // Get the element for the subject label and subject input field
  const subjectLabel = document.getElementById('subjectLabel');
  const subjectInput = document.getElementById('subject');

  // Remove the subject label and subject input field from the DOM
  subjectLabel.remove();
  subjectInput.remove();
}

// Call the function to create platform selection UI
function initStep1() {
  document.getElementById("step1").style.display = 'block';
  document.getElementById("platformCardContainer").style.display = 'none';
  document.getElementById("titleContainer").style.display = 'none';
}

function getNamesArray() {
  //console.log("documentNamesObj: " + documentNamesObj)
  namesArray = documentNamesObj.documents.map(function(doc) {
  return doc.name;
  })
}

//notification management system
function setupNotification() {
  // Create new div with id = notification
  var notificationDiv = document.createElement('div');
  notificationDiv.id = 'notification';

  // Set the initial content as the bell icon
  notificationDiv.innerHTML = "☼";
  
  // Find div with id = topContainer and append notificationDiv
  document.getElementById('topContainer').appendChild(notificationDiv);

  // Create new div with id = notifOnHover
  var notifOnClickDiv = document.createElement('div');
  notifOnClickDiv.id = 'notifOnClick';

  // Set var NotifText = "HELLO WORLD"

  notifOnClickDiv.innerText = notifText;

  // Append notifOnHoverDiv to topContainer
  document.getElementById('topContainer').appendChild(notifOnClickDiv);

  // Function to handle the click event
  notificationDiv.addEventListener('click', function() {
    if (notifOnClickDiv.style.display === 'block') {
      // If notifOnHoverDiv is showing, hide it and change the icon to a bell
      notifOnClickDiv.style.display = 'none';
      notificationDiv.innerHTML = "☼";
    } else {
      // If notifOnHoverDiv is hidden, show it and change the icon to an X
      notifOnClickDiv.style.display = 'block';
      notificationDiv.innerHTML = "×";
    }
  });
}

// Call the function to setup everything.
setupNotification();

//Setup tooltip system

function createTooltip(name, targetElementId, tooltipMessageVar, step, offsetX, offsetY, effect) {
  var targetElement = document.getElementById(targetElementId);

  // Create a wrapper div
  var wrapperDiv = document.createElement('div');
  wrapperDiv.style.position = 'relative';
  wrapperDiv.style.display = 'inline-block'; // Assuming you want to keep the element inline. Change if required.

  // Wrap the targetElement with the wrapperDiv
  targetElement.parentNode.insertBefore(wrapperDiv, targetElement);
  wrapperDiv.appendChild(targetElement);

  var tooltipDiv = document.createElement('div');
  var tooltipDivId = "tooltip" + name;
  tooltipDiv.id = tooltipDivId;
  tooltipDiv.className = "tooltipDiv tooltipStep" + step;
  if (effect !== "noeffect") {
  tooltipDiv.classList.add(effect);
  }

  tooltipDiv.innerHTML = "⊕";

  if (currentSection !== parseInt(step)) {
      tooltipDiv.style.display = 'none';
  } else {
      tooltipDiv.style.display = 'block';
  }

  // Position the tooltip icon to the top-right corner of the wrapper
  tooltipDiv.style.position = 'absolute';
  tooltipDiv.style.right = offsetX + "px";
  tooltipDiv.style.top = offsetY + "px";

  wrapperDiv.appendChild(tooltipDiv);

  var tooltipOnHoverDiv = document.createElement('div');
  var tooltipOnHoverDivId = "tooltip" + name + "OnHover";
  tooltipOnHoverDiv.id = tooltipOnHoverDivId;
  tooltipOnHoverDiv.className = "tooltip";

  tooltipOnHoverDiv.innerText = tooltipMessageVar;
  tooltipOnHoverDiv.style.fontSize = "12px";
  tooltipOnHoverDiv.style.display = 'none';

  document.body.appendChild(tooltipOnHoverDiv);

  tooltipDiv.addEventListener('mouseover', function(event) {
    // Get current position of the tooltipDiv
    var rect = wrapperDiv.getBoundingClientRect();

    // Calculate the center position for the tooltipOnHover
    var viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    var tooltipWidth = tooltipOnHoverDiv.offsetWidth;
    var centeredLeft = (viewportWidth - tooltipWidth) / 2;

    tooltipOnHoverDiv.style.left = centeredLeft + 'px';  // Center it on the x-axis
    tooltipOnHoverDiv.style.top = (rect.bottom + 10) + 'px';  // Position it 10px below the tooltipDiv
    console.log("tooltipOnHoverDiv.style.top: " + tooltipOnHoverDiv.style.top);
    
    tooltipOnHoverDiv.style.display = 'block';
});

  tooltipDiv.addEventListener('mouseout', function() {
      tooltipOnHoverDiv.style.display = 'none';
  });
}




// Create each tooltips
function initTooltips() {
  return new Promise((resolve, reject) => {
    try {
      var tooltipPickClient = "If your client is not here, create a new one! Go to 🧠 --> CREATE NEW CLIENT.";
      createTooltip("PickClient", "clientDiv", tooltipPickClient, "1","-10","5","noeffect");

      var tooltipMoreInfo = "**THIS IS THE MOST IMPORTANT FIELD : Take your time and add as much info as possible.**\n\n Note Aug 24th : \n\n Until I add the 'industry' feature to the brain, please include more info about the client: \n\n - L'industrie\n - La clientèle cible \n- Le ton \n- L'objectif de l'email";
      createTooltip("ExtraInfo", "infoTitle", tooltipMoreInfo, "1","-15","0","pulse-effect");

      var tooltipChosen = "The order of the elements displayed here will be the order used to create the brief tables.";
      createTooltip("Chosen", "chosen", tooltipChosen, "2","-15","10","noeffect");

      var tooltipOtherElements = "The characters BEFORE the first SPACE will be the category of the elements, be mindful.";
      createTooltip("OtherElements", "otherElements", tooltipOtherElements, "2","-15","10","noeffect");

      var tooltipRefreshButton = "Make another request to GPT for new copies, if you are not satisfied with the whole thing, click this!";
      createTooltip("RefreshButton", "qaButton", tooltipRefreshButton, "3","-10","0","noeffect");

      var tooltipUpdateButton = "This will create the tables and transpose your current copies. If you also want the French version, check the next button below.";
      createTooltip("UpdateButton", "update", tooltipUpdateButton, "3","-10","0","noeffect");

      var tooltipUpdateFRButton = "Create tables + transpose current text and will make another request for a French (Québec) version of the email";
      createTooltip("UpdateFRButton", "updateBilingual", tooltipUpdateFRButton, "3","-10","0","noeffect");

      resolve("Tooltips initialized");
    } catch (error) {
      reject(error);
    }
  });
}


//init UI for steps
function initUISteps() {
  
  let numberOfStepsToHide = 7;
  for (var i = 1; i < (numberOfStepsToHide+1); i++) {
  document.getElementById("step"+[i]).style.display = 'none';
  }
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

// setting the themes and their examples copy
function getThemeExamples(theme) {
  if (theme === "BF - Early Access VIP") {
      let primaryText_CopyExamples = [
          `Notre Vente VIP du Black Friday est en cours! 😍\n\nProfitez dun rabais de X% sur [PRODUITS]… ou pour faire vos achats des Fêtes à l'avance!\n\nCODE: XXXX.\n\n🚨 Offre d'une durée limitée. Magasinez nos rabais du Black Friday maintenant 👇`,
          `Ton accès VIP à notre vente du Black Friday, c'est MAINTENANT!\n\n- Profite d'un rabais privilégié de X% sur [PRODUITS] avec le code XXXX (optionnel)\n- (autre perk si applicable)\n\nDépêche-toi de mettre la main sur [PRODUIT] avant qu'il soit épuisé, il ne te reste que X heures (ou autre urgency).\n\nClique ici pour magasiner nos meilleurs prix en primeur.`,
          `👟BLACK FRIDAY VIP 👟\nNos membres VIP économisent X% sur [PRODUITS] dès aujourd'hui!\n\nUtilise ton code promo exclusif XXXX (optionnel) pour profiter de notre meilleure offre de l'année avant tout le monde!\n\nTu éviteras les ruptures de stock et t'assureras de te procurer tes [PRODUITS] préférés. (ou autre phrase en lien avec le client)\n\nClique ici pour économiser dès maintenant. 👇`
      ];
      let headline_CopyExamples = [
          "X% pour les membres VIP",
          "Profite de ton rabais VIP dès aujourd'hui!",
          "Black Friday VIP en cours"
      ];
      let description_CopyExamples = [
          "Magasine maintenant",
          "Économise dès maintenant",
          "Commande maintenant"
      ];
      return {
          primary: primaryText_CopyExamples,
          headline: headline_CopyExamples,
          description: description_CopyExamples
      };

  } else if (theme === "Black Friday week") {
      let primaryText_CopyExamples = [
          `C'est le pré-Black Friday chez [NOM DU CLIENT]!\n\nProfitez de rabais allant jusqu'à X% dès maintenant sur [PRODUITS] durant toute la semaine.\n\nPourquoi attendre à vendredi quand vous pouvez économiser dès aujourd'hui?\n\nCliquez ici pour découvrir tous nos bas prix.👇`,
          `⚡VENDREDI FOU À L'AVANCE ⚡\nNos meilleures offres de 2022 sont commencées!\n\nProfitez-en pour mettre la main sur nos [PRODUITS] à X% de rabais jusqu'au X novembre.\n\n(Phrase sur les bénéfices des produits ou par rapport au client).\n\nDécouvrez tous nos produits en promotion ici. 👇`
      ];
      let headline_CopyExamples = [
          "LE VENDREDI FOU À L'AVANCE | Jusqu'à -X% sur [produits]",
          "Vente du Pré-Black Friday | [RABAIS] | Jusqu'au X novembre",
          "Semaine du Black Friday | [RABAIS] | Code XXXX"
      ];
      let description_CopyExamples = [
          "Le Pré-Black Friday est commencé!",
          "Nos meilleures offres de 2023!",
          "Semaine du Black Friday : Jusqu'à -X%"
      ];
      return {
          primary: primaryText_CopyExamples,
          headline: headline_CopyExamples,
          description: description_CopyExamples
      }
  } else if (theme === "Black Friday") {
        let primaryText_CopyExamples = [
            `🥳 BLACK FRIDAY 🥳\nÉconomise jusqu'à X% sur [PRODUITS]!\n\n[Énumération des produits en solde + bénéfices ou phrase à propos de la marque/du client].\n\nFais vite, le code promo XXXX est valide jusqu'au X novembre seulement!\n\nClique ici pour profiter des meilleurs prix de l'année maintenant. 👇`,
            `🤑 BLACK FRIDAY 🤑\nNos plus GROS rabais de l'année sont en cours!\n\n- [énumération des rabais/offres]\n- [énumération des rabais/offres]\n- [énumération des rabais/offres]\n\nC'est le moment idéal pour faire le plein de [produits + leurs bénéfices ou phrase inspirante qui donne envie d'acheter].\n\nCliquez ici pour profiter de notre méga vente!`,
            `BLACK FRIDAY\nTous les [produits] sont à X% de rabais avec le code promo XXXX (optionnel)!\n\n[Produits + leurs bénéfices ou phrase inspirante qui donne envie d'acheter].\n\nCommandez vos [produits] favoris à bas prix sans plus attendre 👇\n\n*Jusqu'au X novembre seulement.`
        ];
        let headline_CopyExamples = [
            "Les plus gros rabais de 2023 sont là! 💸",
            "Nos MEILLEURES offres de l'année! 😮",
            "Jusqu'à -X% pour le Black Friday",
            "BLACK FRIDAY : jusqu'à -X%!"
        ];
        let description_CopyExamples = [
            "Magasine maintenant",
            "Fais vite avant que la vente se termine!",
            "Commande à rabais"
        ];
        return {
            primary: primaryText_CopyExamples,
            headline: headline_CopyExamples,
            description: description_CopyExamples
        };

    } else if (theme === "Cyber Monday") {
        let primaryText_CopyExamples = [
            `LE CYBER MONDAY BAT SON PLEIN!\n\nPour l'occasion, [NOS PRODUITS] sont offerts à prix imbattables.\n\n[Énumération de produits en rabais], etc., économisez jusqu'à X% sur les produits qui vous font de l'œil avec le code promo XXXX.\n\nCliquez ici pour explorer nos rabais et profiter de notre plus grande vente de l'année. Les quantités sont limitées!`,
            `🙌CYBER LUNDI 🙌\nNos meilleures offres de 2022 se poursuivent!\n\nNos rabais allant jusqu'à X% sur une variété de produits sont encore valides jusqu'au X novembre.\n\n(Phrase par rapport au produit ou au client).\n\nC'est votre toute dernière chance d'en profiter. Cliquez ici pour magasiner à bas prix avant que notre plus grande vente de l'année se termine 👇\n\n*Jusqu'au X novembre seulement.`
        ];
        let headline_CopyExamples = [
            "Profitez des plus gros rabais de l'année!",
            "Nos meilleures offres de 2023 continuent!",
            "Bas prix jusqu'au X novembre seulement"
        ];
        let description_CopyExamples = [
            "Magasine maintenant",
            "Fais vite avant que la vente se termine!",
            "Commande à rabais"
        ];
        return {
            primary: primaryText_CopyExamples,
            headline: headline_CopyExamples,
            description: description_CopyExamples
        };

    } else if (theme === "BFCM - Last Chance") {
        let primaryText_CopyExamples = [
            `🚨DERNIÈRE CHANCE 🚨\nOFFRE VENDREDI FOU : jusqu'à X % de rabais sur les articles sélectionnés 🎉\nC'est votre chance de profiter des meilleurs soldes de l'année sur une large sélection [PRODUITS DÉTAIL] et plus encore!\nCliquez ici pour économiser dès maintenant!👇`,
            `🚨DERNIÈRE CHANCE 🚨\nOFFRE VENDREDI FOU : jusqu'à X % de rabais sur les articles sélectionnés 🎉\nC'est votre chance de profiter des meilleurs soldes de l'année sur une large sélection [PRODUITS DÉTAIL] et plus encore!\nCliquez ici pour économiser dès maintenant!👇`
        ];
        let headline_CopyExamples = [
            "DERNIÈRE CHANCE : -X% de rabais!",
            "Nos offres du Black Friday se terminent",
            "Derniers jours : promos du Black Friday",
            "Jusqu'à X % de rabais"
        ];
        let description_CopyExamples = [
            "Économisez gros!",
            "Faites-vite avant la rupture de stock!",
            "Offre d'une durée limitée"
        ];
        return {
            primary: primaryText_CopyExamples,
            headline: headline_CopyExamples,
            description: description_CopyExamples
        };

    } else if (theme === "BFCM Extended") {
        let primaryText_CopyExamples = [
            `🙌LE CYBER MONDAY EST PROLONGÉ 🙌\nLe code promo XXXX pour économiser X% sur [PRODUITS] est encore valide!\n\nNotre vente a été un tel succès qu'on a décidé de t'en faire profiter jusqu'au X décembre.\n\nC'est l'occasion de cocher quelques cadeaux sur ta liste de Noël ou de t'offrir un [produit vraiment cool + bénéfice].\n\nClique ici pour commander aux meilleurs prix de l'année avant qu'il soit trop tard. 👇`,
            `🙌LE BLACK FRIDAY SE POURSUIT 🙌\nNos MEILLEURES offres de l'année sont prolongées jusqu'au X décembre!\n\nSi vous avez manqué notre vente, c'est le moment de vous rattraper et de mettre la main sur des économies de X% sur [PRODUITS].\n\nQue ce soit pour [bénéfice du produit] ou pour cocher quelques cadeaux sur votre liste des fêtes, c'est le meilleur moment pour faire le plein!\n\nCliquez ici pour profiter de nos promotions limitées!`
        ];
        let headline_CopyExamples = [
            "Profitez des plus gros rabais de l'année!",
            "Le Black Friday/Cyber Monday continue! 🤑",
            "Nos MEILLEURES offres de 2023 continuent!",
            "Bas prix jusqu'au X décembre seulement"
        ];
        let description_CopyExamples = [
            "Magasine maintenant",
            "Fais vite avant que la vente se termine!",
            "Commande à rabais"
        ];
        return {
            primary: primaryText_CopyExamples,
            headline: headline_CopyExamples,
            description: description_CopyExamples
        };
    }
    // If the theme doesn't match any of the above, return an empty object.
    return {};
}

document.getElementById("clients").addEventListener("change", function() {
  var selectedClientName = this.options[this.selectedIndex].text;
  document.getElementById("clientNameStep5").value = selectedClientName;
  var statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "";
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
  
  // Clear existing options from dropdown
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  
  // Create and add the "Select One" option
  var selectOneOption = document.createElement('option');
  selectOneOption.text = "Select One";
  selectOneOption.value = "INVALID"; // You might want to set a specific value for this option
  dropdown.add(selectOneOption);

  namesArray.sort();

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
  if (platformToServe === "Email") {
    var chosenDiv = document.getElementById("chosenContainer");
    var elementButtons = chosenDiv.getElementsByClassName("element-button");
    var tags = [];

    // Convert HTMLCollection to array using spread operator
    buttonArray = [...elementButtons];

    buttonArray.forEach(function(button) {
      tags.push(button.textContent);
    });
    setTimeout(() => {}, 1000)
    
    //console.log(tags);
    // Step 2
    processTags(tags);
  } else if (platformToServe === "Facebook") {
    var tags = ["Primary Text", "Headline", "Description"];
    processTags(tags);
  } else if (platformToServe === "Google") {
    const buttons = document.querySelectorAll('.element-button');
    const tags = [];

    buttons.forEach(button => {
      const tagText = button.textContent;
      const inputField = button.previousSibling;  // Since we inserted the input field before the button
      const repetitionCount = parseInt(inputField.value) || 0;

      tags.push({
        name: tagText,
        count: repetitionCount
      });
    });

    processTags(tags);  // Note: Make sure processTags can handle this new format!
  }
});
  
function createTablesInDoc() { 
  if (platformToServe === "Email") {
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
  } else if (platformToServe === "Facebook") {
    return new Promise((resolve, reject) => {
      function getElementsArray() {
        var elementsArray = [
          [
            "Facebook Ad", 
            ["Primary Text", "{Primary Text}"], 
            ["Headline", "{Headline}"], 
            ["Description", "{Description}"]
          ]
        ]
      }
      // Create the table via Code.gs
      var lang = getLang();
      google.script.run.withSuccessHandler(function(statusLog) {
        resolve();
      }).createTables(elementsArray, lang);
    });
  } else if (platformToServe === "Google") {
    console.log("hello im google");
    return new Promise((resolve, reject) => {
      //WORK PIPELINE 2 OCT : Fix the tags and elements for Google
      var chosenDiv = document.getElementById("chosenContainer");
      var elementButtons = chosenDiv.getElementsByClassName("element-button");
      const elementsArray = [];
      function getElementsArray() {
              
        // Select all elements with the class 'element-button'
        const buttons = document.querySelectorAll('.element-button');
      
        // Iterate through each button
        buttons.forEach(button => {
          const elementText = button.textContent;
          const inputField = button.previousSibling;  // Since we inserted the input field before the button
          const repetitionCount = parseInt(inputField.value) || 0;
      
          for (let i = 0; i < repetitionCount; i++) {
            elementsArray.push([
              elementText,
              ["Text", "{Text}"],
              ["Character count", "{Character count}"]
            ]);
          }
        });
      
        return elementsArray;
      }
      
      var testelements = getElementsArray();
      console.log(JSON.stringify(testelements));


          // Create the table via Code.gs
          var lang = getLang();
          google.script.run.withSuccessHandler(function(statusLog) {
            resolve();
          }).createTables(elementsArray, lang);
        });
  }
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

//Google Script Run function to simplify reading
// for first field, put "functionName" in ""
// for second field, input the var to use or null
// for third field, input true if there's a promise, skip if no promise
function GoogleScriptRun(functionName, varToPass = null, usePromise = false) {
  if (usePromise) {
    return new Promise((resolve, reject) => {
      if (varToPass !== null) {
        google.script.run
        .withSuccessHandler(response => resolve(response))
        .withFailureHandler(error => reject(error))
        [functionName](varToPass);
      } else {
        google.script.run
        .withSuccessHandler(response => resolve(response))
        .withFailureHandler(error => reject(error))
        [functionName]();
      }
    });
  } 

  if (varToPass !== null) {
    google.script.run
    .withSuccessHandler(response => {
      // Do something with the response if needed
    })
    .withFailureHandler(error => {
      // Handle error if needed
    })
    [functionName](varToPass);
  } else {
    google.script.run
    .withSuccessHandler(response => {
      // Do something with the response if needed
    })
    .withFailureHandler(error => {
      // Handle error if needed
    })
    [functionName]();
  }
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
  function handleTag(tag) {
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
      })
      tagList.appendChild(table);
    }

    tags.forEach(function (tagEntry) {
      // Check if it's from Google (object format) or other platforms (string format)
      if (typeof tagEntry === 'string') {
        handleTag(tagEntry);
      } else if (typeof tagEntry === 'object' && tagEntry.name && tagEntry.count) {
        console.log("ok tagEntry is object")
        for (let i = 0; i < tagEntry.count; i++) {
          handleTag(tagEntry.name);
          console.log(tagEntry.name);
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
            //console.log("this ran once when adding listeners to the updatebutton")
            finalObjectResult = await updateStoredFinalObjectResult();
            console.log("finalObjectResult: " + JSON.stringify(finalObjectResult));
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
            //console.log("this ran once when adding listeners to the updatebilingualbutton")
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
  };

  // Append the table to the tag list element
  

  //end of table generating code

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
  if (platformToServe === "Email") {
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
  } else if (platformToServe === "Facebook") {
    if (response && response.document && response.document.traits_fb) {
      const traits = response.document.traits_fb;
      const traitArray = traits.split(',').map(trait => trait.trim());
      
      const clientTraits = {};
      for (var i = 0; i < traitArray.length; i++) {
        const key = 'trait' + (i + 1);
        clientTraits[key] = i < traitArray.length ? traitArray[i] : '';
      }
    
      return clientTraits;
    } else {
    //WORK PIPELINE 2 OCT : Fix how to extract trait for Google call
      return {};
    }
  }
}

function getUpvotesAndDownvotes() {
  if (platformToServe === "Email") {
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
  } else if (platformToServe === "Facebook") {
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
  }
}

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
        //console.log("Success:", response.result);  // Only logs the 'result' part of the response
        //console.log("statusLog:", response.statusLog); // Logs the statusLog for debugging
        resolve(response.result);  // Only resolve the 'result' part of the response
        })
        .withFailureHandler((error) => {
        console.log("Error:", error);
        reject(error);
        }).cleanUpTraits(traitsArray);
    }).then((result) => {
        //console.log(result);
        let preferenceObjectParsed = JSON.parse(result);
        let firstKey = Object.keys(preferenceObjectParsed)[0];
        let firstKeyValue = preferenceObjectParsed[firstKey];
        simplifiedTraitsArray = [];
        for(let i = 0; i < firstKeyValue.length; i++) {
          simplifiedTraitsArray.push(firstKeyValue[i]);
        }
        //console.log(simplifiedTraitsArray);
        return simplifiedTraitsArray
      }).then((simplifiedTraitsArray) => {
        traitsString = simplifiedTraitsArray.join(", ");
        //console.log(traitsString);
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

function getTheme() {
  var themeInput = document.getElementById("themeDropdown");
  var theme = themeInput.value;
  console.log("THEME: " + theme)
  return theme;
}

function getClient() {
  var clientInput = document.getElementById("clients");
  var client = clientInput.value;
  return client;
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

  if (platformToServe !== "Google") {
    var prompt = getSubject();
    var subject = getSubject();
  }
  var lang = getLang();
  var info = getInfo();
  promptElements = getPromptElements();
  if (platformToServe === "Facebook") {
    var theme = getTheme();
  }
  var client = getClient();
  var themeExamples = getThemeExamples(theme);
   //WORK PIPELINE 2 OCT : Setup google : get Ad Type, main keywords, USP, campaign objective

  setStatusMessage("Talking to ChatGPT...")
  
  // For Email
  if (platformToServe === "Email") {
    new Promise((resolve, reject) => {
    // Add your condition based on gpt-request-status here
    var topContainer = document.getElementById("topContainer");
    var gptRequestStatus = topContainer.getAttribute("gpt-request-status");

    if (gptRequestStatus === "generate-copy") {
      clientTraits = "";
      // Find the right client traits
      var foundOneData = GoogleScriptRun("findOneDataFromMongoDB", client, true)
      .then(response => {
        //console.log("Success949:", response);
        return response; // Return the response to use it further if needed
      })
      .then(foundOneData => {
        clientTraits = extractTraits(foundOneData);
        clientMongoDocument = foundOneData;
        return clientTraits;
      }).then(clientTraits => {
        getUpvotesAndDownvotes()
      }).then(result => {
        //console.log(clientTraits);    
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
      //get date and time of gpt request    
      var timeStamp = getDateAndTime();
      //make the api call
      google.script.run
      .withSuccessHandler((response) => {
        //console.log("statusLog:", response);
      })
      .logUsageOnServer(prompt, timeStamp, version, lang, info, requestedCorrections, clientName);
    });
    } else {
      // Run getGPTDesignResponse
      google.script.run
        .withSuccessHandler((response) => {
          //console.log("Success:", response.result);
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
            .requestTranslation1(result, lang, platformToServe);
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

  // For Facebook
  } else if (platformToServe === "Facebook") {
    new Promise((resolve, reject) => {
      // Add your condition based on gpt-request-status here
      var topContainer = document.getElementById("topContainer");
      var gptRequestStatus = topContainer.getAttribute("gpt-request-status");
  
      if (gptRequestStatus === "generate-copy") {
        clientTraits = "";
        // Find the right client traits
        var foundOneData = GoogleScriptRun("findOneDataFromMongoDB", client, true)
        .then(response => {
          //console.log("Success949:", response);
          return response; // Return the response to use it further if needed
        })
        .then(foundOneData => {
          // WORK PIPELINE 30 AUG DONE : Make sure extract traits grab the Facebook traits
          clientTraits = extractTraits(foundOneData);
          clientMongoDocument = foundOneData;
          return clientTraits;
        }).then(clientTraits => {
          // WORK PIPELINE 30 AUG DONE : Create upvotes for FB and grab FB's ones
          console.log("prompt elmements : " + promptElements)
          getUpvotesAndDownvotes()
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
        // WORK PIPELINE 30 AUG DONE : Add theme, correct traits, copy examples, etc.
        .getGPTResponseSuper_fb(prompt, promptElements, optionsTotal, lang, info, clientTraits, elementCopyExamples, numberOfExamples, theme, themeExamples);
        //get date and time of gpt request    
        var timeStamp = getDateAndTime();
        //make the api call
        google.script.run
        .withSuccessHandler((response) => {
          //console.log("statusLog:", response);
        })
        // WORK PIPELINE 30 AUG DONE: Add the facebook stuff to log
        .logUsageOnServer(prompt, timeStamp, version, lang, info, requestedCorrections, clientName);
      });
      } else {
        // Run getGPTDesignResponse
        google.script.run
          .withSuccessHandler((response) => {
            //console.log("Success:", response.result);
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
              // WORK PIPELINE 30 AUG DONE : Make new function for FB... ??
              .requestTranslation1(result, lang, platformToServe);
          });
        }
      })
      .then((result) => {
        statusMessage.textContent = "Negociation with Open AI servers...";
        // Handle the API response
        return new Promise((resolve, reject) => {
          // WORK PIPELINE 30 AUG DONE : Fix function updatetext for FB
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
  }
   //WORK PIPELINE 2 OCT : add else if for google
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


///Menu navigation code - email

function initNavSystemEmail() {
  document.getElementById("goNextButton").addEventListener('click', function() {
    if ((currentSection < totalSections) && (currentSection !== 4)) {
      //Check if client is selected
      
      var clientName = document.getElementById("clients").value;
      //console.log(clientName)
      if ((currentSection === 1) && ((clientName === "INVALID") || (clientName ===""))){
        var statusMessage = document.getElementById("statusMessage");
        statusMessage.textContent = "Please select a client or create a new one first";

      } else {
        //if client is selected, display next step
      document.getElementById('step' + currentSection).style.display = 'none';
      var fixedStepNumberForTooltips = currentSection + 1;
      var getAllTooltipOfNextStep = document.getElementsByClassName("tooltipStep"+fixedStepNumberForTooltips)
      for (var i = 0; i < getAllTooltipOfNextStep.length; i++) {
        getAllTooltipOfNextStep[i].style.display = "block";
      }
    
      var getAllTooltipOfCurrentStep = document.getElementsByClassName("tooltipStep"+currentSection)
      for (var i = 0; i < getAllTooltipOfCurrentStep.length; i++) {
        getAllTooltipOfCurrentStep[i].style.display = "none";
      }
      currentSection++;

      if ((currentSection === 3) && (firstTimeStep3 === 0)) {
        //show button refresh is first time step3
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
        
        if (emailSubjectLineField.textContent !== storedEmailSubject) {
          storedEmailSubject = emailSubjectLineField.textContent;
          document.getElementById('step' + currentSection).style.display = 'block';
        } else {

          if (retryCount < maxRetries) {
            setTimeout(() => checkCondition(retryCount + 1), 500); // Check again after a delay
          } else {
            console.log("Max reached, displaying answers")
            var statusMessage = document.getElementById("statusMessage");
            statusMessage.textContent = "Max waiting delay reached, displaying copy";
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
      //show tooltips for right steps
      var fixedStepNumberForTooltips = currentSection - 1;
      var getAllTooltipOfNextStep = document.getElementsByClassName("tooltipStep"+fixedStepNumberForTooltips)
      for (var i = 0; i < getAllTooltipOfNextStep.length; i++) {
        getAllTooltipOfNextStep[i].style.display = "block";
      }
    
      var getAllTooltipOfCurrentStep = document.getElementsByClassName("tooltipStep"+currentSection)
      for (var i = 0; i < getAllTooltipOfCurrentStep.length; i++) {
        getAllTooltipOfCurrentStep[i].style.display = "none";
      }
      //show content for right steps
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
}

// navigation system - facebook

function hideSectionAndTooltips(step) {
  document.getElementById('step' + step).style.display = 'none';
  let tooltips = document.getElementsByClassName("tooltipStep" + step);
  for (let tooltip of tooltips) {
    tooltip.style.display = "none";
  }
}

function showSectionAndTooltips(step) {
  document.getElementById('step' + step).style.display = 'block';
  let tooltips = document.getElementsByClassName("tooltipStep" + step);
  for (let tooltip of tooltips) {
    tooltip.style.display = "block";
  }
}

function setStatusMessage(message) {
  document.getElementById("statusMessage").textContent = message;
}

function initNavSystemFacebook() {
  document.getElementById("goNextButton").addEventListener('click', function() {
    if (currentSection >= totalSections) {
      return;
    }

    switch (currentSection) {
      //WORK PIPELINE 2 OCT : Long step, fix QA button to get good values and get good output for google
      case 1:
        let clientName = document.getElementById("clients").value;
        let adTheme = document.getElementById("themeDropdown").value;
        if (clientName === "INVALID" || clientName === "")  {
          setStatusMessage("Please select a client or create a new one first");
          return; // Exit the function early
        } else if (adTheme === "NONE" || adTheme === "") {
          setStatusMessage("Please select a theme to start");
          return; // Exit the function early
        }
        hideSectionAndTooltips(currentSection);
        if (firstTimeStep3 === 0) {
          simulateQaButtonkButtonClick();
          firstTimeStep3 = 1;
          document.getElementById("qaButton").classList.remove("hideButton");
          currentSection = 3;
          checkConditionBeforeDisplayStep3();
          break;
        } else {
          currentSection = 3;
          showSectionAndTooltips(currentSection);
          break;
        }
        break;
      //generated copy to correction  
      case 3:
        hideSectionAndTooltips(currentSection);
        currentSection++;
        showSectionAndTooltips(currentSection);
        break;
      case 4:
        let traits = document.getElementById("traits").value;
        if (traits !== "") {
          hideSectionAndTooltips(currentSection);
          simulateGptMagicButtonClick();
          currentSection--;
          checkCondition();
          break;
        } else {
          setStatusMessage("Please input valid corrections");
          break;
        }
        
        default:
        // For all other cases (this is a safe guard, might not be necessary depending on your totalSections)
        console.error("Invalid section!");
        break;
    }

    // The rest of your general logic, like disabling buttons, can stay outside of the switch
    if (currentSection === totalSections) {
      this.disabled = true;
      this.style.backgroundColor = '#f1f1f1'; 
    }
    if (currentSection > 1) {
      document.getElementById('goBackButton').disabled = false;
      document.getElementById('goBackButton').style.backgroundColor = '#3498db'; 
    }
  });

  document.getElementById('goBackButton').addEventListener('click', function() {
    switch (currentSection) {
      //generate copy to subject
      case 3:
        hideSectionAndTooltips(currentSection);
        currentSection = 1;
        showSectionAndTooltips(currentSection);
        document.getElementById('goBackButton').disabled = true;
        document.getElementById('goBackButton').style.backgroundColor = '#f1f1f1'; 
        break;
      case 4:
        hideSectionAndTooltips(currentSection);
        currentSection--;
        showSectionAndTooltips(currentSection);
        break;
    }
  }
)};
 //WORK PIPELINE 2 OCT : Revise the google nav system
function initNavSystemGoogle() {
  document.getElementById("goNextButton").addEventListener('click', function() {
    if (currentSection >= totalSections) {
      return;
    }

    switch (currentSection) {
      //subject to generate copy
      case 1:
        let clientName = document.getElementById("clients").value;
        let adTheme = document.getElementById("themeDropdown").value;
        if (clientName === "INVALID" || clientName === "")  {
          setStatusMessage("Please select a client or create a new one first");
          return; // Exit the function early
        } else if (adTheme === "NONE" || adTheme === "") {
          setStatusMessage("Please select a theme to start");
          return; // Exit the function early
        }
        hideSectionAndTooltips(currentSection);
        currentSection++;
        showSectionAndTooltips(currentSection);
        break;
        case 2:
          //add logique for step 2->step3
        if (firstTimeStep3 === 0) {
          simulateQaButtonkButtonClick();
          firstTimeStep3 = 1;
          document.getElementById("qaButton").classList.remove("hideButton");
          hideSectionAndTooltips(currentSection);
          currentSection = 3;
          checkConditionBeforeDisplayStep3Google();
          break;
        } else {
          currentSection = 3;
          showSectionAndTooltips(currentSection);
          break;
        }
        break;
      //generated copy to correction  
      case 3:
        
        hideSectionAndTooltips(currentSection);
        currentSection++;
        showSectionAndTooltips(currentSection);
        break;
      case 4:
        let traits = document.getElementById("traits").value;
        if (traits !== "") {
          hideSectionAndTooltips(currentSection);
          simulateGptMagicButtonClick();
          currentSection--;
          checkCondition();
          break;
        } else {
          setStatusMessage("Please input valid corrections");
          break;
        }
        
        default:
        // For all other cases (this is a safe guard, might not be necessary depending on your totalSections)
        console.error("Invalid section!");
        break;
    }

    // The rest of your general logic, like disabling buttons, can stay outside of the switch
    if (currentSection === totalSections) {
      this.disabled = true;
      this.style.backgroundColor = '#f1f1f1'; 
    }
    if (currentSection > 1) {
      document.getElementById('goBackButton').disabled = false;
      document.getElementById('goBackButton').style.backgroundColor = '#3498db'; 
    }
  });

  document.getElementById('goBackButton').addEventListener('click', function() {
    switch (currentSection) {
      //generate copy to subject
      case 3:
        hideSectionAndTooltips(currentSection);
        currentSection = 1;
        showSectionAndTooltips(currentSection);
        document.getElementById('goBackButton').disabled = true;
        document.getElementById('goBackButton').style.backgroundColor = '#f1f1f1'; 
        break;
      case 4:
        hideSectionAndTooltips(currentSection);
        currentSection--;
        showSectionAndTooltips(currentSection);
        break;
    }
  }
)};

const checkCondition = (retryCount = 0, maxRetries = 30) => {
  var primaryText = document.getElementById("Primary-Text");

  if (primaryText.textContent !== storedEmailSubject) {
    storedEmailSubject = primaryText.textContent;
    showSectionAndTooltips(currentSection);
  } else {

    if (retryCount < maxRetries) {
      setTimeout(() => checkCondition(retryCount + 1), 500); // Check again after a delay
    } else {
      console.log("Max reached, displaying answers")
      var statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = "Max waiting delay reached, displaying copy";
      storedEmailSubject = primaryText.textContent;
      showSectionAndTooltips(currentSection);
    }
  }
}

const checkConditionBeforeDisplayStep3 = () => {
  var primaryText = document.getElementById("Primary-Text");
  if (primaryText.textContent !== "Primary Text") {
    storedEmailSubject = primaryText.textContent;
    showSectionAndTooltips(currentSection);
  } else {
  setTimeout(checkConditionBeforeDisplayStep3, 500);  // Check again after a delay
  }
};

const checkConditionBeforeDisplayStep3Google = () => {
  var primaryText = document.getElementById("Primary-Text");
  if (1) {
    showSectionAndTooltips(currentSection);
  } else {
  setTimeout(checkConditionBeforeDisplayStep3, 500);  // Check again after a delay
  }
};


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

function addTextFieldsForGoogle() {
  // Select all elements with the class 'element-button'
  const buttons = document.querySelectorAll('.element-button');

  // Iterate through each button and append a tiny text field within its parent div
  buttons.forEach(button => {
    // Create an input field with a maximum length of 2 characters
    const inputField = document.createElement('input');
    inputField.setAttribute('type', 'text');
    inputField.setAttribute('maxlength', '2');
    inputField.style.width = '2ch'; // Width to fit 2 characters
    inputField.style.marginRight = '2px';

    // Append the input field to the button's parent div
    button.parentNode.insertBefore(inputField, button);
  });
}

function removeTinyTextFields() {
  // Select all elements with the class 'element-button'
  const buttons = document.querySelectorAll('.element-button');

  // Iterate through each button and remove the following input field
  buttons.forEach(button => {
    const nextElement = button.nextElementSibling;
    
    // If the next element is an input field, remove it
    if (nextElement && nextElement.tagName === 'INPUT') {
      nextElement.remove();
    }
  });
}