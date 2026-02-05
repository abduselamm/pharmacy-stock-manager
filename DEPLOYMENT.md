# Google Apps Script Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Rename it to **"Stock Inventory"** (or any name you prefer)

### 2. Open Apps Script Editor

1. In your Google Sheet, click **Extensions** in the menu bar
2. Click **Apps Script**
3. A new tab will open with the Apps Script editor

### 3. Add the Script Code

1. You should see a file called `Code.gs` in the editor
2. Select all the default code (usually has `myFunction()`) and delete it
3. Copy the **entire content** from the file:
   ```
   google-apps-script/Code.gs
   ```
   in this project
4. Paste it into the Apps Script editor
5. Click the **Save** icon (💾) or press `Ctrl+S` / `Cmd+S`

### 4. Deploy as Web App

1. Click the **Deploy** button in the top right
2. Select **New deployment**
3. Click the gear icon (⚙️) next to **Select type**
4. Choose **Web app**
5. Fill in the deployment settings:
   
   **Description**: `Stock Inventory API v1`
   
   **Execute as**: `Me (your-email@gmail.com)`
   
   **Who has access**: 
   - Choose **Anyone** (for public access, recommended for testing)
   - Or **Anyone with Google account** (more secure)

6. Click **Deploy**

### 5. Authorize the Script

⚠️ **IMPORTANT**: First-time authorization is required

1. You'll see a message: **"Authorization required"**
2. Click **Authorize access**
3. Choose your Google account
4. You may see a warning: **"Google hasn't verified this app"**
   - Click **Advanced**
   - Click **Go to [Your Project Name] (unsafe)**
   - (This is safe - it's your own script!)
5. Click **Allow** to grant permissions

### 6. Copy Your Web App URL

1. After deployment, you'll see a **Deployment** dialog
2. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
3. Save this URL - you'll need it for the Vue app!

### 7. Configure the Vue App

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your Web App URL:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec
   ```

### 8. Test the Integration

1. Start the Vue development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`
3. Try adding a stock item
4. Check your Google Sheet - you should see:
   - **Items** sheet with your item
   - **Transactions** sheet with the transaction log

## Updating the Script

If you make changes to the Apps Script code:

1. Edit the code in the Apps Script editor
2. Save your changes (💾)
3. Click **Deploy** → **Manage deployments**
4. Click the edit icon (✏️) next to your active deployment
5. Change the **Version** to **New version**
6. Click **Deploy**

**Note**: The Web App URL stays the same, so you don't need to update your `.env` file!

## Troubleshooting

### "Script function not found: doGet"
- Make sure you copied the entire `Code.gs` file
- Verify the functions `doGet` and `doPost` exist in your script
- Save the script and try deploying again

### "Authorization required" keeps appearing
- Clear your browser cache
- Try using an incognito/private window
- Make sure you're logged into the correct Google account

### Data not saving to Google Sheets
- Check that the script is executing as **"Me"** (you)
- Verify you have edit permissions on the Google Sheet
- Check the Apps Script execution logs: **View** → **Executions**

### CORS errors in the browser
- Ensure the script is deployed with access set to **Anyone** or **Anyone with Google account**
- Try redeploying the script
- Clear browser cache and reload

## Security Considerations

### Current Setup (Development)
- ✅ Good for: Testing, personal use, small teams
- ⚠️ Anyone with the URL can read/write your inventory

### For Production Use
Consider implementing:
1. **API Key Authentication**:
   - Add a secret key in script properties
   - Require it in all requests

2. **Google Account Restriction**:
   - Deploy with "Anyone with Google account"
   - Check user email in the script

3. **Rate Limiting**:
   - Track requests per user/IP
   - Limit operations per time period

## Testing the API Directly

You can test your deployed Apps Script using curl:

### Test GET request:
```bash
curl "YOUR_WEB_APP_URL?action=getItems"
```

### Test POST request:
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stockIn",
    "itemName": "Test Item",
    "quantity": 5,
    "supplier": "Test Supplier"
  }'
```

If successful, you should get a JSON response like:
```json
{
  "success": true,
  "message": "Successfully added 5 units of Test Item"
}
```

---

**Need Help?** Check the main README.md for more information or open an issue on GitHub.
