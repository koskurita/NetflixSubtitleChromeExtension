document.addEventListener('DOMContentLoaded', () => {
    

    // load the stored values
    loadStoredValue('containerWidth', updateContainerWidthUI);
    loadStoredValue('fontSize', updateFontSizeUI);
    
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

      function updateContainerWidthUI(containerWidth) {
        const containerWidthSlider = document.getElementById('adjustBoxWidth');
        containerWidthSlider.value = containerWidth;

        const outputContainer = document.getElementById('boxWidthOutput');
        outputContainer.textContent = `${containerWidth}%`;
    }

    function updateFontSizeUI(fontSize) {
        const fontSizeSlider = document.getElementById('adjustFontSize');
        fontSizeSlider.value = fontSize;

        const outputContainer = document.getElementById('fontSizeOutput');
        outputContainer.textContent = `${fontSize}px`;

        const displayFontSize = document.getElementById('displayFontSize');
        displayFontSize.style.fontSize = `${fontSize}px`;
    }

});

//debouncing
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}




// debounce so it doesnt make calls constantly
const saveContainerWidth = debounce((sliderValue) => {
    chrome.storage.sync.set({ containerWidth: sliderValue });
}, 550);

const saveFontSize = debounce((sliderValue) => {
    chrome.storage.sync.set({ fontSize: sliderValue });
}, 550);




document.getElementById('adjustBoxWidth').addEventListener('input', (event) => {
    const sliderValue = event.target.value;

    const outputContainer = document.getElementById('boxWidthOutput')
    outputContainer.textContent = `${sliderValue}%`

    // action = funcname, containerWidth = value
    chrome.runtime.sendMessage({ action: 'updateContainerWidth', sliderValue: sliderValue });
    chrome.storage.local.set({ containerWidth: sliderValue });
    saveContainerWidth(sliderValue);
});



document.getElementById('adjustFontSize').addEventListener('input', (event) => {
    const sliderValue = event.target.value;

    const outputContainer = document.getElementById('fontSizeOutput')
    outputContainer.textContent = `${sliderValue}px`

    const displayFontSize = document.getElementById("displayFontSize");
    displayFontSize.style.fontSize = `${sliderValue}px`;

    // action = funcname, containerWidth = value
    chrome.runtime.sendMessage({ action: 'updateFontSize', sliderValue: sliderValue });
    chrome.storage.local.set({ fontSize: sliderValue });
    saveFontSize(sliderValue);

});



document.getElementById('resetToDefault').addEventListener("click",(event)=>{
    const _default_font_size = 31
    const _default_container_width = 30
    
    // reset container width
    const boxSlider = document.getElementById('adjustBoxWidth')
    boxSlider.value = _default_container_width

    const boxwidthOutput = document.getElementById('boxWidthOutput')
    boxwidthOutput.textContent = `${_default_container_width}%`
    chrome.runtime.sendMessage({ action: 'updateContainerWidth', sliderValue: _default_container_width });
    chrome.storage.local.set({ containerWidth: _default_container_width });
    saveContainerWidth(_default_container_width);


    //reset font size
    const fontSlider = document.getElementById('adjustFontSize')
    fontSlider.value = _default_font_size
    const outputContainer = document.getElementById('fontSizeOutput')
    outputContainer.textContent = `${_default_font_size}px`

    const displayFontSize = document.getElementById("displayFontSize");
    displayFontSize.style.fontSize = `${_default_font_size}px`;


    chrome.runtime.sendMessage({ action: 'updateFontSize', sliderValue: _default_font_size });
    chrome.storage.local.set({ fontSize: _default_font_size });
    saveFontSize(_default_font_size);

    //reset placement
    chrome.runtime.sendMessage({ action: 'updateContainerPlacement'});

} )

