// // wait for Netflix to load its elements
// observer.observe(document.documentElement, { childList: true, subtree: true });

let subtitleToTranslate = "";
let subtitleTranslated = "";
let parsedLines = [];
let currentContainer;

let customSubtitle = document.createElement("div");

// class Subtitle {
//     constructor() {
//       this.translated = False;
//       this.subtitleString = "";
//     }
//   }

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

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
let x = 0;


// create a hidden textbox to use to get value for translation
function createElementForTranslation() {
  const textToTranslateContainer = document.createElement("div");
  textToTranslateContainer.style.visibility = "hidden";
  textToTranslateContainer.classList.add("my-subtitle-to-translate");


  //observe for change in the text to be translated
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      console.log(mutation.target.textContent);
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



// take in the string to see if it has updated. if it has, send it to translate. else ignore.
function sendToTranslator(subtitle, changedContainer) {
  if (subtitle == subtitleToTranslate) {
    return;
  }

  console.log(subtitle);
  // update global variable
  subtitleToTranslate = subtitle;
  currentContainer = changedContainer

  let textToTranslateContainer = document.querySelector(
    ".my-subtitle-to-translate"
  );
  textToTranslateContainer.textContent = subtitle;

}

// function addTranslatedSubtitle(translatedSubtitle){
//     customSubtitle.textContent = ""

//   console.log(currentContainer.children.innerHTML)
//     currentContainer.children.forEach((timedTextBox)=>{
//         let newContainer = document.createElement("div");
//         [...timedTextBox.attributes].forEach(({name, value}) =>{
//             newContainer.setAttribute(name, value);
//             }
//         );
//         newContainer.innerHTML = translatedSubtitle;
//         customSubtitle.insertAdjacentElement("beforeend", newContainer)
//     }
//     )

//     let newEl = document.createElement('div');

//     newEl.textContent = translatedSubtitle
//     customSubtitle.insertAdjacentElement("afterbegin",newEl)
// }

function parseSubtitle(mutations, observer) {
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
    
  });
}


waitForElement(".player-timedtext").then((subtitleContainer) => {
  console.log("Element is ready");

  // create custom Subtitle
//   let customSubtitle = document.createElement("div");
  let containerStyle = subtitleContainer.getAttribute("style");
  let textToTranslateContainer = createElementForTranslation();
  customSubtitle.insertAdjacentElement("afterbegin", textToTranslateContainer);

  customSubtitle.setAttribute("style", containerStyle);
  customSubtitle.setAttribute("class", ".my-player-timedtext");
  subtitleContainer.insertAdjacentElement("beforebegin", customSubtitle);

  const observer = new MutationObserver(parseSubtitle);
  observer.observe(subtitleContainer, { childList: true, subtree: true });
});
