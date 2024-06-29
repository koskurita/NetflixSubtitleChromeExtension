

//add feature to resize
//add feature to set width
//add feature change location of text
//save location of the text
//add functionality to remove original text
//fix bug where subtitle persists

let subtitleToTranslate = "";
let subtitleTextBox;
let actualTextContainer;
let hideCaptions;

function setHideCaptions(val){
    hideCaptions = val;
}


function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}




// take in the string to see if it has updated. if it has, send it to translate. else ignore.
function sendToTranslator(subtitle) {
    // console.log(subtitle)
  if (subtitle == subtitleToTranslate) {
    return;
  }
  if (subtitle){
    subtitleToTranslate = subtitle;
    let textToTranslateContainer = document.querySelector(".my-subtitle-to-translate");
    if (textToTranslateContainer !== null ){
        textToTranslateContainer.textContent = subtitle;
    }
  }
}


function addTranslatedSubtitle(translatedSubtitle) {
    actualTextContainer.textContent = translatedSubtitle
}


// dialogue observer
function captureNewDialogue(mutations, observer) {
  //Netflix prints dialogue in seperate containers, so to get the final string we have to iterate and combine.
  mutations.forEach((mutation) => {
    // might have to ensure that its the right node added; .player-timedtext-text-container
    if (mutation.addedNodes.length > 0) {
      // to keep the original text from being translated.
      mutation.addedNodes[0].setAttribute("translate", "no");
      if (hideCaptions === true){
        if (mutation.addedNodes[0].firstChild !== null){
            mutation.addedNodes[0].firstChild.setAttribute("style", "visibility: hidden")
            console.log(mutation.addedNodes[0].firstChild.style)
        }

    }
    // parse individual lines
      let parsedLines = [];
      for (let i = 0; i < mutation.target.children.length; i++) {
        parsedLines[i] = mutation.target.children[i].textContent;
      }
      sendToTranslator(parsedLines.join(" "));
    }
  });
}

// observer to see if display: none, to hide subtitle during long pauses. Since there is nothing to be translated, change the caption directly.
function detectHideDialogue(mutations, observer){
    // console.log(mutations)
    mutations.forEach((mutation) => {
        if (mutation.target.style.display == "none"){
            // need to send to translator so the subtitle to translate is updated to match.
            sendToTranslator(" ")
            actualTextContainer.textContent = " "
        }
        // console.log(mutation.target.style.display)
    })

}






// create a hidden textbox to use to get value for translation
function createTranslationContainer() {
    const textToTranslateContainer = document.createElement("div");
    textToTranslateContainer.style.visibility = "hidden";
    textToTranslateContainer.classList.add("my-subtitle-to-translate");
  
    //observe for change in the text to be translated
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // console.log(mutation.target);     
        addTranslatedSubtitle(mutation.target.textContent);
      });
    });
    observer.observe(textToTranslateContainer, {
      // childList: true,
      characterData: true,
      attributes: false,
      childList: false,
      subtree: true,
    });
  
    return textToTranslateContainer;
  }

  //create a custom subtitle container
  function createMySubtitleContainer(containerStyle){
    let customSubtitle = document.createElement("div");
    customSubtitle.setAttribute("class", "my-player-timedtext");
    customSubtitle.setAttribute("style", containerStyle);
    subtitleTextBox = customSubtitle;
    return customSubtitle;
  }


  // for saving locaiton
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const saveContainerCoordinates = debounce((val) => {
    chrome.storage.sync.set({ coordinateValue: val });
}, 550);


function loadStoredValue(key, callback) {
    chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
            callback(result[key]);
        } else {
            // Fallback to local storage if sync storage is empty
            chrome.storage.sync.get([key], (localResult) => {
                if (localResult[key] !== undefined) {
                    callback(localResult[key]);
                }
            });
        }
    });
}


function onDrag(e) {
    // we could make them global variables instead
    const {width, height} = window.getComputedStyle(actualTextContainer);
    const transformValue = `translate(${e.clientX - width.replace("px", "") / 2}px, ${e.clientY - height.replace("px", "") / 2}px)`;
    actualTextContainer.style.transform = transformValue
    chrome.storage.local.set({ coordinateValue:  transformValue});
    saveContainerCoordinates(transformValue)
  }
  
  function onLetGo() {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onLetGo);
  }
  
  function onGrab() {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onLetGo);
  }

function updateTextBoxCoordinates(coordinate) {
    actualTextContainer.style.transform = coordinate;
}

  function initializeActualTextContainer() {
    actualTextContainer = document.createElement('div');
    actualTextContainer.setAttribute("class", "my-player-timedtext-two");
    actualTextContainer.setAttribute("id", "mySubtitle");
    actualTextContainer.style.cssText = `
        position: fixed;
        display: inline-block;
        max-width: 30%;
        padding: 10px 10px;
        font-size: 26px;
        color: #ffffff;
        text-shadow: #000000 0px 0px 7px;
        font-family: Netflix Sans, Helvetica Nueue, Helvetica, Arial, sans-serif;
        font-weight: bolder;
        cursor: move;
        user-select: none;
        overflow: auto;
    `;
    actualTextContainer.addEventListener('mousedown', onGrab);
    document.body.insertAdjacentElement("beforeend", actualTextContainer);
    loadStoredValue("coordinateValue", updateTextBoxCoordinates)
}

function updateHideCaptions(boolVal){
    hideCaptions = boolVal
}

function initializeHideCaption(){
    loadStoredValue("hideCaptionIsActive", updateHideCaptions)

}



function initializeSubtitles() {
    waitForElement(".player-timedtext").then((subtitleContainer) => {
        console.log("Element is ready");


        // Create custom subtitle with original attributes
        const containerStyle = subtitleContainer.getAttribute("style");
        const customSubtitle = createMySubtitleContainer(containerStyle);

        // Create hidden textbox used to get translated text
        const textToTranslateContainer = createTranslationContainer();

        subtitleContainer.insertAdjacentElement("beforebegin", customSubtitle);
        customSubtitle.insertAdjacentElement("beforebegin", textToTranslateContainer);

        const newDialogueObserver = new MutationObserver(captureNewDialogue);
        newDialogueObserver.observe(subtitleContainer, { childList: true, subtree: true});
        
        const hideDialogueObserver = new MutationObserver(detectHideDialogue);
        hideDialogueObserver.observe(subtitleContainer,{ attributes: true, attributeFilter: ["style"], attributeOldValue: true})

    });
}




initializeActualTextContainer();
initializeSubtitles();
initializeHideCaption();


// border transition for background
function borderTransition(textBox){
    textBox.style.outline = '1px solid white'; // Show border
      textBox.style.transition = 'outline-color 1s ease-out';
  
        // Clear any existing timeout
        clearTimeout(window.borderTimeout);
  
        // Set a timeout to hide the border after 1 second
        window.borderTimeout = setTimeout(() => {
          textBox.style.outlineColor = 'transparent';
        }, 75);
  }