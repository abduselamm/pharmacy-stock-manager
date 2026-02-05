# Stock Inventory Management System

A modern, full-stack Stock In/Stock Out web application built with Vue.js 3 and Google Sheets as the backend.

## 🚀 Features

- **📊 Dashboard**: View total stock levels, item counts, and low stock alerts
- **📥 Stock In**: Add inventory with supplier information
- **📤 Stock Out**: Remove inventory with recipient tracking
- **📜 Transaction History**: Complete audit trail of all stock movements
- **📱 Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **⚡ Real-time Updates**: Instant synchronization with Google Sheets
- **✅ Form Validation**: Client-side validation with error handling

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 (Composition API) + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Backend**: Google Apps Script
- **Database**: Google Sheets

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Account (for Google Sheets and Apps Script)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd inventory-weba-app
npm install
```

### 2. Set Up Google Sheets Backend

#### Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Stock Inventory"

#### Set Up Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy the entire content from `google-apps-script/Code.gs` in this project
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)

#### Deploy as Web App

1 In Apps Script editor, click **Deploy** → **New deployment**
2. Click **Select type** → **Web app**
3. Configure deployment:
   - **Description**: Stock Inventory API
   - **Execute as**: Me
   - **Who has access**: Anyone (for public access) or Anyone with Google account
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this!

#### Authorize the Script

1. The first time you deploy, you'll need to authorize the script
2. Click **Review permissions**
3. Choose your Google account
4. Click **Allow**

### 3. Configure Vue App

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and replace with your actual Apps Script URL:

```env
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📊 Google Sheets Structure

The Apps Script will automatically create two sheets:

### Sheet 1: Items
| ItemName | CurrentStock |
|----------|--------------|
| Laptop   | 15           |
| Mouse    | 50           |

### Sheet 2: Transactions
| Date | Type | ItemName | Quantity | Party | Notes |
|------|------|----------|----------|-------|-------|
| 2/4/2026 | Stock In | Laptop | 10 | Tech Supplier | Initial stock |

## 🎯 Usage

### Dashboard
- View total items count
- See total stock across all items
- Monitor low stock items (< 10 units)
- Check current stock levels for each item

### Stock In
1. Navigate to **Stock In** tab
2. Enter item name (new or existing)
3. Enter quantity
4. Optionally add supplier and notes
5. Click **Add Stock**

### Stock Out
1. Navigate to **Stock Out** tab
2. Enter item name (or select from suggestions)
3. Enter quantity to remove
4. Optionally add recipient and notes
5. Click **Remove Stock**

### Transaction History
- View all stock movements
- See date, type, item, quantity, and party
- Transactions are sorted newest first

## 🔐 Security Notes

- The Apps Script is deployed to run as you (the owner)
- Anyone with the URL can access your inventory data
- For production use, consider:
  - Implementing authentication
  - Restricting access to specific Google accounts
  - Adding API keys for additional security

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder. You can deploy these to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## 📝 API Reference

### GET Endpoints

- `?action=getItems` - Fetch all items with current stock
- `?action=getTransactions` - Fetch transaction history
- `?action=getDashboard` - Fetch dashboard data

### POST Endpoints

#### Stock In
```json
{
  "action": "stockIn",
  "itemName": "Laptop",
  "quantity": 10,
  "supplier": "Tech Corp",
  "notes": "Optional notes"
}
```

#### Stock Out
```json
{
  "action": "stockOut",
  "itemName": "Laptop",
  "quantity": 5,
  "recipient": "John Doe",
  "notes": "Optional notes"
}
```

## 🐛 Troubleshooting

### "Failed to load data" Error
- Verify your Apps Script is deployed correctly
- Check that the URL in `.env` is correct
- Ensure the script has proper permissions

### CORS Issues
- Make sure Apps Script is deployed as "Anyone" or "Anyone with Google account"
- Redeploy the script if you changed access settings

### Data Not Updating
- Check Google Sheets permissions
- Verify the Apps Script execution policy
- Check browser console for errors

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built as a demonstration of Vue.js 3 + Google Sheets integration.

---

**Note**: This is a simple inventory system suitable for small businesses, personal use, or as a learning project. For large-scale production use, consider a dedicated database solution.
