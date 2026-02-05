// Google Apps Script - Deploy as Web App
// This script interfaces with a Google Sheet to manage inventory

/**
 * Sheet structure:
 * Sheet 1 - "Items": ItemName | CurrentStock
 * Sheet 2 - "Transactions": Date | Type | ItemName | Quantity | Party | Notes
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;
  
  try {
    if (action === 'getItems') {
      return getItems(ss);
    } else if (action === 'getTransactions') {
      return getTransactions(ss);
    } else if (action === 'getDashboard') {
      return getDashboard(ss);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    let data;
    
    // Attempt to parse as JSON first
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      // If JSON parsing fails, fall back to parameters (handles x-www-form-urlencoded)
      data = e.parameter;
    }
    
    // Add safety check
    if (!data) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'No data received' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action;
    
    // Ensure quantity is a number (form data often sends strings)
    if (data.quantity) {
      data.quantity = Number(data.quantity);
    }
    
    if (action === 'stockIn') {
      return handleStockIn(ss, data);
    } else if (action === 'stockOut') {
      return handleStockOut(ss, data);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get all items with current stock
function getItems(ss) {
  const itemsSheet = getOrCreateSheet(ss, 'Items', ['ItemName', 'CurrentStock']);
  const data = itemsSheet.getDataRange().getValues();
  
  // Skip header row
  const items = data.slice(1).map(row => ({
    name: row[0],
    stock: row[1] || 0
  }));
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true, items: items })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Get transaction history
function getTransactions(ss) {
  const transSheet = getOrCreateSheet(ss, 'Transactions', 
    ['Date', 'Type', 'ItemName', 'Quantity', 'Party', 'Notes']);
  const data = transSheet.getDataRange().getValues();
  
  // Skip header row, reverse for newest first
  const transactions = data.slice(1).reverse().map(row => ({
    date: row[0],
    type: row[1],
    itemName: row[2],
    quantity: row[3],
    party: row[4],
    notes: row[5] || ''
  }));
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true, transactions: transactions })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Get dashboard data (items with stock)
function getDashboard(ss) {
  return getItems(ss);
}

// Handle stock in transaction
function handleStockIn(ss, data) {
  const { itemName, quantity, supplier, notes } = data;
  
  if (!itemName || !quantity || quantity <= 0) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid item name or quantity' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Update or create item
  updateItemStock(ss, itemName, quantity);
  
  // Log transaction
  logTransaction(ss, 'Stock In', itemName, quantity, supplier || 'N/A', notes);
  
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: `Successfully added ${quantity} units of ${itemName}` 
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Handle stock out transaction
function handleStockOut(ss, data) {
  const { itemName, quantity, recipient, notes } = data;
  
  if (!itemName || !quantity || quantity <= 0) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid item name or quantity' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check if enough stock exists
  const currentStock = getItemStock(ss, itemName);
  if (currentStock < quantity) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        error: `Insufficient stock. Current stock: ${currentStock}`,
        currentStock: currentStock
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Update item stock (subtract)
  updateItemStock(ss, itemName, -quantity);
  
  // Log transaction
  logTransaction(ss, 'Stock Out', itemName, quantity, recipient || 'N/A', notes);
  
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: `Successfully removed ${quantity} units of ${itemName}` 
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Helper: Get or create a sheet with headers
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

// Helper: Get current stock for an item (Case Insensitive)
function getItemStock(ss, itemName) {
  const itemsSheet = getOrCreateSheet(ss, 'Items', ['ItemName', 'CurrentStock']);
  const data = itemsSheet.getDataRange().getValues();
  
  const searchName = itemName.trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const sheetItemName = String(data[i][0]).trim().toLowerCase();
    if (sheetItemName === searchName) {
      return data[i][1] || 0;
    }
  }
  
  return 0;
}

// Helper: Update item stock (add or subtract) - Case Insensitive
function updateItemStock(ss, itemName, quantityChange) {
  const itemsSheet = getOrCreateSheet(ss, 'Items', ['ItemName', 'CurrentStock']);
  const data = itemsSheet.getDataRange().getValues();
  
  const searchName = itemName.trim().toLowerCase();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    const sheetItemName = String(data[i][0]).trim().toLowerCase();
    if (sheetItemName === searchName) {
      const newStock = (data[i][1] || 0) + quantityChange;
      itemsSheet.getRange(i + 1, 2).setValue(newStock);
      found = true;
      break;
    }
  }
  
  // If item doesn't exist, create it (using original case)
  if (!found) {
    itemsSheet.appendRow([itemName.trim(), Math.max(0, quantityChange)]);
  }
}

// Helper: Log a transaction
function logTransaction(ss, type, itemName, quantity, party, notes) {
  const transSheet = getOrCreateSheet(ss, 'Transactions', 
    ['Date', 'Type', 'ItemName', 'Quantity', 'Party', 'Notes']);
  
  const date = new Date();
  transSheet.appendRow([date, type, itemName, quantity, party, notes || '']);
}
