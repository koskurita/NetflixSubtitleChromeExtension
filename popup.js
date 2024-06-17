document.getElementById('languageSelect').addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    chrome.storage.sync.set({ language: selectedLanguage }, () => {
        console.log('Language set to ' + selectedLanguage);
    });
});