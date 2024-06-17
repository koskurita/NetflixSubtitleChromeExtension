// This function will be used to translate the subtitles using an API
// async function translateText(text, targetLanguage) {
//   const response = await fetch(
//     `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
//       text
//     )}&langpair=en|${targetLanguage}`
//   );
//   const data = await response.json();
//   return data.responseData.translatedText;
// }

// // Observe subtitle changes
// const subtitleObserver = new MutationObserver(async (mutations) => {
//   for (const mutation of mutations) {
//     if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
//       const subtitleElement = mutation.addedNodes[0];
//       if (subtitleElement.nodeType === Node.TEXT_NODE) {
//         const originalText = subtitleElement.textContent;
//         const translatedText = await translateText(originalText, "es"); // Change 'es' to your target language code
//         subtitleElement.textContent = translatedText;
//       }
//     }
//   }
// });

// Start observing the subtitle container
// const subtitleContainer = document.querySelector(
//   ".player-timedtext-text-container"
// );

// console.log(subtitleContainer);
// var id = "player-timedtext";
// const timedtext = document.getElementsByClassName(id)[0];
// console.log(timedtext);




// function waitForElement(records, observer) {
//   const subtitleContainer = document.querySelector(
//     ".player-timedtext-text-container"
//   );
  
// }

// const observer = new MutationObserver(waitForElement);

// // wait for Netflix to load its elements
// observer.observe(document.documentElement, { childList: true, subtree: true });




function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function printSubtitle(mutations, observer){
    // mutations.addedNodes.forEach(subtitleContainer=>{
    //     console.log(subtitleContainer.lastChild.textContent);
    // })
    mutations.forEach((mutation)=>{
        subtitles = mutation.target.querySelectorAll(".player-timedtext-text-container")
        
        subtitles.forEach((subtitle)=>{
            console.log(subtitle.innerText)
        })
        
        // console.log("subtitle", subtitles)
        // console.log(mutation.target)
    
    
    });
    // console.log(elm.lastChild.textContent);

}

waitForElement(".player-timedtext").then((subtitleContainer) => {
    console.log('Element is ready');


    const observer = new MutationObserver(printSubtitle);
    observer.observe(subtitleContainer, { childList: true, subtree: true });
    
});

