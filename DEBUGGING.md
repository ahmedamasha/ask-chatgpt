# 🐛 Debugging Guide for Ask ChatGPT Extension

## How to Debug the Extension

### 1. Open Chrome DevTools

**For Background Service Worker (API calls):**
1. Go to `chrome://extensions/`
2. Find "Ask ChatGPT" extension
3. Click on **"service worker"** link (or "Inspect views: service worker")
4. This opens the background script console

**For Content Script (popup display):**
1. Open any webpage
2. Press `F12` or right-click → Inspect
3. Go to the **Console** tab
4. Try the extension and watch for logs

### 2. Check Console Logs

After the fix, you'll see detailed logs:

**Background Script Console:**
```
🔄 Calling OpenAI API with text: your highlighted text...
📡 API Response status: 200
✅ API Response received: [response object]
💬 Answer: The actual ChatGPT response
```

**Content Script Console (webpage):**
```
📩 Content script received message: {content: "...", theme: "light", isLoading: false}
🎨 Showing popup: {content: "...", theme: "light", isLoading: false}
⏰ Auto-closing popup (after 15 seconds)
```

### 3. Common Issues & Solutions

#### Issue: Popup shows "Loading..." forever

**Possible Causes:**
1. **Invalid API Key**
   - Error: `401 Unauthorized`
   - Solution: Double-check your API key in extension settings
   
2. **Network Issues**
   - Error: `Failed to fetch`
   - Solution: Check internet connection
   
3. **CORS Issues**
   - Error: `CORS policy blocked`
   - Solution: This shouldn't happen with Manifest V3, but reload the extension

4. **API Rate Limit**
   - Error: `429 Too Many Requests`
   - Solution: Wait a few minutes, or check your OpenAI account limits

5. **Content Script Not Loading**
   - Check: Look for console errors in webpage DevTools
   - Solution: Reload the webpage after installing the extension

#### Issue: No popup appears at all

**Solutions:**
1. **Reload the extension**: Go to `chrome://extensions/` → Click reload button
2. **Reload the webpage**: Press `Ctrl+R` or `Cmd+R`
3. **Check permissions**: Make sure the extension has access to the page
4. **Check API key**: Make sure you've saved your API key

#### Issue: Error messages appear instead of response

Check the error message in the popup:

- **"Invalid API key"**: Your API key is wrong or expired
- **"Rate limit exceeded"**: You've hit OpenAI's rate limit
- **"Network error"**: Check your internet connection
- **"API request failed with status XXX"**: Check OpenAI status page

### 4. Check API Key & Billing

**Verify API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check if your key is active
3. Check if you have billing enabled

**Check Usage:**
1. Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. See how many requests you've made
3. Check if you have credits remaining

### 5. Test API Key Manually

You can test your API key using curl:

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

Replace `YOUR_API_KEY` with your actual key. If this works, your key is valid.

## Pricing Details per Request

### OpenAI API Costs (gpt-4o-mini)

**Token Pricing:**
- Input: $0.150 per 1M tokens ($0.00015 per 1K tokens)
- Output: $0.600 per 1M tokens ($0.0006 per 1K tokens)

**Per Request Breakdown:**

| Component | Tokens | Cost |
|-----------|--------|------|
| Prompt overhead | ~10 tokens | $0.0000015 |
| Your highlighted text | 10-50 tokens | $0.0000015 - $0.0000075 |
| ChatGPT response | 50-200 tokens | $0.00003 - $0.00012 |
| **TOTAL per request** | **~70-260 tokens** | **~$0.00004 - $0.00014** |

**In simpler terms:**
- **1 request ≈ $0.0001** (0.01 cents)
- **10 requests ≈ $0.001** (0.1 cents)
- **100 requests ≈ $0.01** (1 cent)
- **1,000 requests ≈ $0.10** (10 cents)
- **10,000 requests ≈ $1.00** (1 dollar)

**Real-world usage:**
- If you use it 50 times per day: **~$0.15/month**
- If you use it 200 times per day: **~$0.60/month**

This is **extremely affordable** compared to ChatGPT Plus ($20/month).

## Request/Response Details

### What Gets Sent to OpenAI

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Explain this text: [YOUR HIGHLIGHTED TEXT]"
    }
  ],
  "max_tokens": 200,
  "temperature": 0.7
}
```

**Token Breakdown:**
- `"Explain this text: "` = 4 tokens
- Your highlighted text = variable (usually 10-100 tokens)
- Response = up to 200 tokens (but typically 50-150)

### What You Get Back

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "[ChatGPT's explanation]"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 87,
    "total_tokens": 102
  }
}
```

The extension extracts `choices[0].message.content` and displays it in the popup.

## Advanced Debugging

### Enable Verbose Logging

All console.log statements are now included in the code. Check both:
1. **Background Service Worker console** (for API calls)
2. **Webpage console** (for popup rendering)

### Check Network Requests

1. Open background service worker DevTools
2. Go to **Network** tab
3. Try the extension
4. Look for request to `api.openai.com`
5. Check request/response details

### Check Storage

To see saved settings:
1. Open background service worker console
2. Run:
```javascript
chrome.storage.sync.get(['openaiApiKey', 'theme'], (data) => {
  console.log('Stored settings:', data);
});
```

### Clear Storage (Reset)

To reset all settings:
```javascript
chrome.storage.sync.clear(() => {
  console.log('Storage cleared');
});
```

## Still Having Issues?

1. **Check OpenAI Status**: [status.openai.com](https://status.openai.com)
2. **Check API Key**: Make sure it's valid and has billing enabled
3. **Reload Extension**: `chrome://extensions/` → Reload
4. **Reload Page**: Refresh the webpage you're testing on
5. **Check Console**: Look for red error messages

---

**Need more help?** Check the console logs and error messages - they now provide detailed information about what's going wrong!

