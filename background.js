chrome.runtime.onInstalled.addListener(() => {
  console.log('Netflix Subtitle Translator extension installed.');
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


  if (message.action === 'updateContainerWidth') {
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs)

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: updateContainerWidth,
        args: [message.sliderValue]
      });
    });
  }

  if (message.action === "updateFontSize") {

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs)

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: updateFontSize,
        args: [message.sliderValue]
      });
    });
  }

  if (message.action === 'updateContainerPlacement'){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs)

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: calculateCenter
      });
    });
  }

  if (message.action === "hideNetflixCaptions"){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs)
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: hideNetflixCaptions,
        args: [message.originalCaptionIsActive]
      });
    });
  }

});

function hideNetflixCaptions(originalCaptionIsActive){
  setHideCaptions(originalCaptionIsActive)
  
}


function calculateCenter(){
  const actualTextContainer = document.querySelector(".my-player-timedtext-two")
  const {width, height} = window.getComputedStyle(actualTextContainer);

  const viewPortDimensions = window.getComputedStyle(document.querySelector(".player-timedtext")) 
  const heightVal = Math.floor(viewPortDimensions.height.replace("px", "")/2)
  const widthVal = Math.floor(viewPortDimensions.width.replace("px", "")/2)
  // console.log(heightVal, widthVal)



  const transformValue = `translate(${widthVal- width.replace("px", "") / 2}px, ${heightVal- height.replace("px", "") / 2}px)`;
  actualTextContainer.style.transform = transformValue
  chrome.storage.local.set({ coordinateValue:  transformValue});
  saveContainerCoordinates(transformValue)
}


function updateFontSize(sliderValue) {

  const textBox = document.querySelector('.my-player-timedtext-two');
  if (textBox) {
    textBox.style.fontSize = `${sliderValue}px`
    borderTransition(textBox)
    // console.log("change to: ", sliderValue)
  }
}

function updateContainerWidth(sliderValue) {

  const textBox = document.querySelector('.my-player-timedtext-two');
  if (textBox) {
    textBox.style.maxWidth = `${sliderValue}%`
    borderTransition(textBox)

    // console.log("change to: ", sliderValue)
  }
}


