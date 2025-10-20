# ⚡ Ask ChatGPT - Chrome Extension

A production-ready Chrome Extension that lets you highlight any text on a webpage, right-click, and ask ChatGPT for an instant explanation in a beautiful floating popup.

## ✨ Features

- **Context Menu Integration**: Right-click any highlighted text and select "Ask ChatGPT"
- **Beautiful Popup**: macOS-style floating bubble with smooth animations
- **Light & Dark Themes**: Toggle between elegant light and dark modes
- **Secure API Key Storage**: Your OpenAI API key is stored securely using Chrome's sync storage
- **Manual Close**: Popup stays visible until you click the close button (unlimited reading time)
- **Modern UI/UX**: Clean, minimal design with smooth transitions
- **Manifest V3**: Built with the latest Chrome Extension standards

## 📋 Requirements

- Google Chrome (or any Chromium-based browser)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Installation & Setup

### Step 1: Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key (starts with `sk-...`)

### Step 2: Load the Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `ask-chatgpt` folder from your file system
6. The extension should now appear in your extensions list

### Step 3: Configure the Extension

1. Click the **Ask ChatGPT** extension icon in your Chrome toolbar
2. Paste your OpenAI API key in the settings popup
3. Choose your preferred theme (Light or Dark)
4. Click **Save Settings**
5. You should see a "✅ Settings saved successfully!" confirmation

## 🎯 How to Use

1. **Highlight any text** on any webpage
2. **Right-click** the highlighted text
3. **Select "Ask ChatGPT"** from the context menu
4. A beautiful floating popup will appear with ChatGPT's explanation
5. Take your time reading - the popup stays visible until you click the **×** button to close it

## 🏗️ Project Structure

```
ask-chatgpt/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker handling context menu & API calls
├── content.js          # Content script for popup display
├── popup.html          # Settings page UI
├── popup.js            # Settings page logic
├── styles.css          # Popup bubble styles (light/dark themes)
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## 🔧 Technical Details

- **Manifest Version**: V3
- **Permissions**: `contextMenus`, `storage`, `activeTab`, `scripting`
- **API**: OpenAI Chat Completions API (`gpt-4o-mini` model)
- **Storage**: Chrome Sync Storage for API key and theme preferences
- **Max Tokens**: 200 tokens per request
- **Popup Behavior**: Stays visible until manually closed

## 🎨 Customization

### Changing the Theme

The extension includes two built-in themes:
- **Light**: Clean white background with subtle shadows
- **Dark**: Modern gray gradient with elegant styling

You can switch themes in the extension settings popup.

### Modifying the Popup Position

The popup appears in the top-right corner by default. To change this, edit `styles.css`:

```css
.chatgpt-popup {
  top: 20px;    /* Change this */
  right: 20px;  /* Change this */
}
```

### Re-enabling Auto-dismiss (Optional)

The popup currently stays visible until manually closed. If you want it to auto-close after a delay, add this to the end of `showPopup()` function in `content.js`:

```javascript
// Add auto-dismiss after X seconds (if not loading)
if (!isLoading) {
  setTimeout(() => {
    removePopup();
  }, 15000); // 15000 = 15 seconds
}
```

## 💰 Pricing Information

**Per request cost with gpt-4o-mini:**
- ~**$0.0001** per request (about 0.01 cents)
- 1,000 requests ≈ **$0.10** (10 cents)
- 10,000 requests ≈ **$1.00** (1 dollar)

**Real-world monthly cost:**
- 50 uses/day ≈ **$0.15/month**
- 200 uses/day ≈ **$0.60/month**

This is extremely affordable! Much cheaper than ChatGPT Plus ($20/month).

**Detailed breakdown:**
- Input tokens: $0.00015 per 1K tokens
- Output tokens: $0.0006 per 1K tokens
- Max 200 tokens per response = ~$0.00012 per response
- Your highlighted text = ~$0.00001-$0.00008

## 🐛 Troubleshooting

### How to Debug

**Check Console Logs:**

1. **Background Script** (for API issues):
   - Go to `chrome://extensions/`
   - Click "service worker" link under the extension
   - Watch for console logs: 🔄 → 📡 → ✅ → 💬

2. **Content Script** (for popup issues):
   - Press F12 on any webpage
   - Watch console for: 📩 → 🎨 → ⏰

### Common Issues

**"Loading..." forever:**
- Check background service worker console for errors
- Verify API key is correct and has billing enabled
- Check internet connection
- Error codes:
  - `401`: Invalid API key
  - `429`: Rate limit exceeded
  - `Failed to fetch`: Network error

**No popup appears:**
1. Reload extension: `chrome://extensions/` → Click reload
2. Reload webpage: Press Ctrl+R (Cmd+R on Mac)
3. Check that you've saved your API key

**Error messages:**
- **"Invalid API key"**: Update your API key in settings
- **"Rate limit exceeded"**: Wait a few minutes
- **"Network error"**: Check your internet connection

### Test Your API Key

Test manually with curl:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

For detailed debugging instructions, see [DEBUGGING.md](DEBUGGING.md)

## 🔒 Privacy & Security

- Your API key is stored locally using Chrome's secure sync storage
- API requests are sent directly from your browser to OpenAI
- No data is collected or stored by this extension
- The extension only activates when you explicitly use the context menu

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and submit pull requests with improvements!

## 💡 Tips

- Keep your API key secure and never share it publicly
- Monitor your OpenAI API usage to avoid unexpected charges
- The extension works on any webpage with selectable text
- You can disable the extension temporarily from `chrome://extensions/`

---

**Enjoy using Ask ChatGPT! 🚀**

