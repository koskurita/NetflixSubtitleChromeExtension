chrome.runtime.onInstalled.addListener(() => {
    console.log('Netflix Subtitle Translator extension installed.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'changeContainerWidth') {
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: updateContainerWidth,
          args: [message.containerWidth]
        });
      });
    }

    if (message.action === 'changeFontSize') {
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: updateFontSize,
          args: [message.fontSize]
        });
      });
    }

  });

  function updateFontSize(sliderValue) {

    const textBox = document.querySelector('.my-player-timedtext-two');
    if (textBox) {
      textBox.style.fontSize = `${sliderValue}px`
      console.log("change to: ", sliderValue)
    }
  }

  

  function updateContainerWidth(sliderValue) {

    const textBox = document.querySelector('.my-player-timedtext-two');
    if (textBox) {
      textBox.style.maxWidth = `${sliderValue}%`
      textBox.style.outline = '1px solid white'; // Show border
      textBox.style.transition = 'outline-color 1s ease-out';

        // Clear any existing timeout
        clearTimeout(window.borderTimeout);

        // Set a timeout to hide the border after 1 second
        window.borderTimeout = setTimeout(() => {
          textBox.style.outlineColor = 'transparent';
        }, 75);

      console.log("change to: ", sliderValue)
    }
  }
