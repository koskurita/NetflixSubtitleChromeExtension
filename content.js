
// add feature to hide original subtitle
//add feature to resize

let subtitleToTranslate = "";
let parsedLines = [];
let subtitleTextBox;


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
function sendToTranslator(subtitle, changedContainer) {
  if (subtitle == subtitleToTranslate) {
    return;
  }
  subtitleToTranslate = subtitle;
  currentContainer = changedContainer;

  let textToTranslateContainer = document.querySelector(
    ".my-subtitle-to-translate"
  );
  textToTranslateContainer.textContent = subtitle;
}


function addTranslatedSubtitle(translatedSubtitle) {
    actualTextContainer.textContent = translatedSubtitle
}


function trackChanges(mutations, observer) {
  //Netflix prints dialogue in seperate containers, so to get the final string we have to iterate and combine.
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length >= 1) {
      // to keep the original text from being translated.
      mutation.addedNodes[0].setAttribute("translate", "no");
      for (let i = 0; i < mutation.target.children.length; i++) {
        parsedLines[i] = mutation.target.children[i].textContent;
      }
      sendToTranslator(parsedLines.join(" "), mutation.target);
    }
    if (mutation.type == "attributes"){
        
        if (mutation.target.getAttribute("class") == "player-timedtext"){
            subtitleTextBox.setAttribute("style", mutation.target.getAttribute("style"))
        }
        // console.log(mutation.target.getAttribute("class"))
    }

  });
}


// create a hidden textbox to use to get value for translation
function createTranslationContainer() {
    const textToTranslateContainer = document.createElement("div");
    textToTranslateContainer.style.visibility = "hidden";
    textToTranslateContainer.classList.add("my-subtitle-to-translate");
  
    //observe for change in the text to be translated
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // console.log(mutation.target.textContent);                    0000!!!
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

  function createMySubtitleContainer(containerStyle){
    let customSubtitle = document.createElement("div");
    customSubtitle.setAttribute("class", "my-player-timedtext");
    customSubtitle.setAttribute("style", containerStyle);
    subtitleTextBox = customSubtitle;
    return customSubtitle;
  }

// left: 50%;
// top: 50%;

let actualTextContainer = document.createElement('div');
actualTextContainer.setAttribute("class", "my-player-timedtext-two");
actualTextContainer.setAttribute("id", "mySubtitle");
actualTextContainer.style.cssText = `
position: fixed;
display: inline-block;
max-width: 30%;
padding: 10px 10px;
font-size:26px;
color:#ffffff;
text-shadow:#000000 0px 0px 7px;
font-family:Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif;
font-weight:bolder;
cursor: move;
user-select: none;
overflow: auto;
`

function onDrag(e) {
    // we could make them global variables instead
    const {width, height} = window.getComputedStyle(actualTextContainer);
    actualTextContainer.style.transform = `translate(${e.clientX - +width.replace("px", "") / 2}px, ${e.clientY - +height.replace("px", "") / 2}px)`;
  }
  
  function onLetGo() {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onLetGo);
  }
  
  function onGrab() {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onLetGo);
  }
  
  actualTextContainer.addEventListener('mousedown', onGrab);




waitForElement(".player-timedtext").then((subtitleContainer) => {
  console.log("Element is ready");

  // create custom Subtitle with original attributes
  let containerStyle = subtitleContainer.getAttribute("style");
  let customSubtitle = createMySubtitleContainer(containerStyle)

  //create hidden textbox used to get translated text
  let textToTranslateContainer = createTranslationContainer();


  subtitleContainer.insertAdjacentElement("beforebegin", customSubtitle);
  customSubtitle.insertAdjacentElement("beforebegin", textToTranslateContainer);
  document.body.insertAdjacentElement("beforeend",actualTextContainer)

  const observer = new MutationObserver(trackChanges);
  observer.observe(subtitleContainer, { childList: true, subtree: true, attributes: true});
});
