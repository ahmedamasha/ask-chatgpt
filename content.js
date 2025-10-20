/**
 * Content Script for Ask ChatGPT Extension
 * Handles the floating popup bubble display on web pages
 */

let currentPopup = null;
let currentInputModal = null;

// Listen for messages from background script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'ASK_CHATGPT_SHOW_INPUT') {
    console.log('📝 Showing input modal for text:', event.data.selectedText.substring(0, 50) + '...');
    showInputModal(event.data.selectedText, event.data.theme);
  }
  
  if (event.data.type === 'ASK_CHATGPT_SHOW') {
    console.log('📩 Content script received message:', {
      content: event.data.content.substring(0, 100) + '...',
      theme: event.data.theme,
      isLoading: event.data.isLoading
    });
    showPopup(event.data.content, event.data.theme, event.data.isLoading);
  }
});

/**
 * Show the floating popup with ChatGPT's response
 */
function showPopup(content, theme = 'light', isLoading = false) {
  console.log('🎨 Showing popup:', { content: content.substring(0, 50), theme, isLoading });
  
  // If popup already exists, just update its content
  if (currentPopup) {
    console.log('📝 Updating existing popup content');
    const contentDiv = currentPopup.querySelector('.chatgpt-content');
    
    if (isLoading) {
      contentDiv.innerHTML = `
        <div class="chatgpt-loading">
          <div class="chatgpt-spinner"></div>
          <span>${content}</span>
        </div>
      `;
    } else {
      // Format content with markdown support
      contentDiv.innerHTML = formatMarkdown(content);
      
      // No auto-dismiss - user must close manually
      console.log('✅ Content loaded - popup will stay until user closes it');
    }
    return;
  }

  // Create popup container
  const popup = document.createElement('div');
  popup.className = `chatgpt-popup chatgpt-popup-${theme}`;
  popup.id = 'chatgpt-floating-popup';
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'chatgpt-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = removePopup;
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'chatgpt-content';
  
  if (isLoading) {
    contentDiv.innerHTML = `
      <div class="chatgpt-loading">
        <div class="chatgpt-spinner"></div>
        <span>${content}</span>
      </div>
    `;
  } else {
    // Format content with markdown support
    contentDiv.innerHTML = formatMarkdown(content);
  }
  
  // Assemble popup
  popup.appendChild(closeBtn);
  popup.appendChild(contentDiv);
  
  // Add to page
  document.body.appendChild(popup);
  currentPopup = popup;
  
  // Trigger fade-in animation
  setTimeout(() => {
    popup.classList.add('chatgpt-popup-visible');
  }, 10);
  
  // No auto-dismiss - popup stays until user closes it manually
  console.log('📌 Popup will remain visible until manually closed');
}

/**
 * Remove the popup with fade-out animation
 */
function removePopup() {
  if (!currentPopup) return;
  
  console.log('🗑️ Closing popup (user clicked close button)');
  currentPopup.classList.remove('chatgpt-popup-visible');
  
  setTimeout(() => {
    if (currentPopup && currentPopup.parentNode) {
      currentPopup.parentNode.removeChild(currentPopup);
    }
    currentPopup = null;
  }, 300);
}

/**
 * Show input modal for user to edit/add text before asking ChatGPT
 */
function showInputModal(selectedText, theme = 'light') {
  // Remove existing modal if any
  if (currentInputModal) {
    removeInputModal();
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'chatgpt-modal-overlay';
  overlay.id = 'chatgpt-input-modal';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = `chatgpt-modal chatgpt-modal-${theme}`;
  
  // Create modal content
  modal.innerHTML = `
    <div class="chatgpt-modal-header">
      <h3>✨ Ask ChatGPT</h3>
      <button class="chatgpt-modal-close">×</button>
    </div>
    <div class="chatgpt-modal-body">
      <label>Selected Text:</label>
      <div class="chatgpt-selected-text">${escapeHtml(selectedText)}</div>
      
      <label>Additional Question/Context (optional):</label>
      <textarea 
        class="chatgpt-input-textarea" 
        placeholder="e.g., Explain this in simple terms, Translate to Spanish, Summarize this..."
        rows="4"
      ></textarea>
      
      <div class="chatgpt-modal-hint">
        💡 Tip: Add your own question or leave empty to get a general explanation
      </div>
    </div>
    <div class="chatgpt-modal-footer">
      <button class="chatgpt-modal-btn chatgpt-modal-btn-cancel">Cancel</button>
      <button class="chatgpt-modal-btn chatgpt-modal-btn-submit">Ask ChatGPT</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentInputModal = overlay;
  
  // Fade in animation
  setTimeout(() => {
    overlay.classList.add('chatgpt-modal-visible');
  }, 10);
  
  // Focus textarea
  const textarea = modal.querySelector('.chatgpt-input-textarea');
  setTimeout(() => textarea.focus(), 100);
  
  // Handle close button
  modal.querySelector('.chatgpt-modal-close').onclick = removeInputModal;
  
  // Handle cancel button
  modal.querySelector('.chatgpt-modal-btn-cancel').onclick = removeInputModal;
  
  // Handle submit button
  modal.querySelector('.chatgpt-modal-btn-submit').onclick = () => {
    const additionalText = textarea.value.trim();
    console.log('🚀 Submitting to ChatGPT:', { selectedText, additionalText });
    
    // Close modal
    removeInputModal();
    
    // Send message to background script to process
    window.postMessage({
      type: 'ASK_CHATGPT_SUBMIT',
      selectedText: selectedText,
      additionalText: additionalText,
      theme: theme
    }, '*');
  };
  
  // Handle Enter key with Ctrl/Cmd to submit
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      modal.querySelector('.chatgpt-modal-btn-submit').click();
    }
  });
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      removeInputModal();
    }
  };
}

/**
 * Remove the input modal
 */
function removeInputModal() {
  if (!currentInputModal) return;
  
  console.log('🗑️ Closing input modal');
  currentInputModal.classList.remove('chatgpt-modal-visible');
  
  setTimeout(() => {
    if (currentInputModal && currentInputModal.parentNode) {
      currentInputModal.parentNode.removeChild(currentInputModal);
    }
    currentInputModal = null;
  }, 300);
}

/**
 * Format markdown text to HTML
 */
function formatMarkdown(text) {
  if (!text) return '';
  
  // Escape HTML first for security
  let html = escapeHtml(text);
  
  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic (*text* or _text_)
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Headers (# Header)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Numbered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Line breaks (double newline becomes paragraph)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Single line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

