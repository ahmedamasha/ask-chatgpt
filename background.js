/**
 * Background Service Worker for Ask ChatGPT Extension
 * Handles context menu creation and communication with OpenAI API
 */

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'askChatGPT',
    title: 'Ask ChatGPT',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'askChatGPT' && info.selectionText) {
    const selectedText = info.selectionText;
    
    // Get API key and theme from storage
    chrome.storage.sync.get(['openaiApiKey', 'theme'], async (data) => {
      if (!data.openaiApiKey) {
        // Alert user to set API key
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            alert('⚠️ Please set your OpenAI API key in the extension settings first.\n\nClick the "Ask ChatGPT" extension icon to configure.');
          }
        });
        return;
      }

      // Show input modal first
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (selectedText, theme) => {
          window.postMessage({
            type: 'ASK_CHATGPT_SHOW_INPUT',
            selectedText: selectedText,
            theme: theme || 'light'
          }, '*');
        },
        args: [selectedText, data.theme]
      });
      
      // Set up listener for when user submits the form
      setupSubmitListener(tab.id, data);
    });
  }
});

// Set up listener for input modal submission
function setupSubmitListener(tabId, data) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (apiKey, theme) => {
      // Listen for submit event from input modal
      window.addEventListener('message', async (event) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'ASK_CHATGPT_SUBMIT') {
          const { selectedText, additionalText } = event.data;
          
          // Show loading state
          window.postMessage({
            type: 'ASK_CHATGPT_SHOW',
            content: 'Loading...',
            theme: theme || 'light',
            isLoading: true
          }, '*');
          
          // Build the prompt with concise instruction
          let prompt = '';
          if (additionalText) {
            prompt = `${additionalText}\n\nText: "${selectedText}"\n\nPlease provide a concise, well-structured answer that fits in a popup window.`;
          } else {
            prompt = `Explain this text concisely: ${selectedText}\n\nPlease provide a brief, well-structured explanation that fits in a popup window.`;
          }
          
          try {
            // Call OpenAI API
            console.log('🔄 Calling OpenAI API with prompt:', prompt.substring(0, 100) + '...');
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                max_tokens: 300,
                temperature: 0.7
              })
            });

            console.log('📡 API Response status:', response.status);

            if (!response.ok) {
              const error = await response.json();
              console.error('❌ API Error:', error);
              throw new Error(error.error?.message || `API request failed with status ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ API Response received');
            
            const answer = result.choices[0]?.message?.content || 'No response received';
            console.log('💬 Answer:', answer.substring(0, 100) + '...');

            // Send answer to content script
            window.postMessage({
              type: 'ASK_CHATGPT_SHOW',
              content: answer,
              theme: theme || 'light',
              isLoading: false
            }, '*');

          } catch (error) {
            console.error('❌ Fetch Error:', error);
            
            // Show detailed error message
            let errorMessage = error.message;
            
            // Provide helpful error messages
            if (errorMessage.includes('401')) {
              errorMessage = 'Invalid API key. Please check your settings.';
            } else if (errorMessage.includes('429')) {
              errorMessage = 'Rate limit exceeded. Please try again later.';
            } else if (errorMessage.includes('Failed to fetch')) {
              errorMessage = 'Network error. Check your internet connection.';
            }
            
            window.postMessage({
              type: 'ASK_CHATGPT_SHOW',
              content: `❌ Error: ${errorMessage}`,
              theme: theme || 'light',
              isLoading: false
            }, '*');
          }
        }
      }, { once: false }); // Keep listener active
    },
    args: [data.openaiApiKey, data.theme]
  });
}


