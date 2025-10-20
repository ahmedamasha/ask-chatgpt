/**
 * Popup Script for Ask ChatGPT Extension Settings
 * Handles API key and theme configuration
 */

const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const confirmation = document.getElementById('confirmation');
const themeOptions = document.querySelectorAll('.theme-option');

let selectedTheme = 'light';

// Load saved settings on popup open
chrome.storage.sync.get(['openaiApiKey', 'theme'], (data) => {
  if (data.openaiApiKey) {
    apiKeyInput.value = data.openaiApiKey;
  }
  
  if (data.theme) {
    selectedTheme = data.theme;
    updateThemeUI(selectedTheme);
  }
});

// Handle theme selection
themeOptions.forEach(option => {
  option.addEventListener('click', () => {
    const theme = option.getAttribute('data-theme');
    selectedTheme = theme;
    updateThemeUI(theme);
  });
});

/**
 * Update theme UI state
 */
function updateThemeUI(theme) {
  themeOptions.forEach(option => {
    if (option.getAttribute('data-theme') === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

// Handle save button click
saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    alert('⚠️ Please enter your OpenAI API key');
    return;
  }
  
  // Save to chrome storage
  chrome.storage.sync.set({
    openaiApiKey: apiKey,
    theme: selectedTheme
  }, () => {
    // Show confirmation message
    confirmation.classList.add('show');
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      confirmation.classList.remove('show');
    }, 3000);
  });
});

// Allow Enter key to save
apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveBtn.click();
  }
});

