import axios from 'axios';

// Replace this URL with your deployed Google Apps Script Web App URL
// Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
const API_URL = import.meta.env.VITE_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

export interface Item {
    name: string;
    stock: number;
}

export interface Transaction {
    date: string | Date;
    type: 'Stock In' | 'Stock Out';
    itemName: string;
    quantity: number;
    party: string;
    notes?: string;
}

export interface StockInData {
    itemName: string;
    quantity: number;
    supplier?: string;
    notes?: string;
}

export interface StockOutData {
    itemName: string;
    quantity: number;
    recipient?: string;
    notes?: string;
}

class InventoryAPI {
    private baseUrl: string;

    constructor(url: string) {
        this.baseUrl = url;
    }

    // Get all items with current stock
    async getItems(): Promise<Item[]> {
        try {
            const response = await axios.get(`${this.baseUrl}?action=getItems`);
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    }

    // Get transaction history
    async getTransactions(): Promise<Transaction[]> {
        try {
            const response = await axios.get(`${this.baseUrl}?action=getTransactions`);
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.transactions || [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    // Get dashboard data
    async getDashboard(): Promise<Item[]> {
        try {
            const response = await axios.get(`${this.baseUrl}?action=getDashboard`);
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    }

    // Stock in operation
    async stockIn(data: StockInData): Promise<{ success: boolean; message: string }> {
        try {
            // WORKAROUND: Send as text/plain to avoid CORS preflight, but manually stringify JSON
            // This works because the backend tries to JSON.parse(e.postData.contents) regardless of content type
            const payload = JSON.stringify({
                action: 'stockIn',
                ...data
            });

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error('Error in stock in operation:', error);
            throw error;
        }
    }

    // Stock out operation
    // Stock out operation
    async stockOut(data: StockOutData): Promise<{ success: boolean; message: string }> {
        try {
            // WORKAROUND: Send as text/plain to avoid CORS preflight, but manually stringify JSON
            const payload = JSON.stringify({
                action: 'stockOut',
                ...data
            });

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error('Error in stock out operation:', error);
            throw error;
        }
    }
}

export const inventoryAPI = new InventoryAPI(API_URL);
