<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { inventoryAPI, type Item, type Transaction } from '../services/api';

// State
const items = ref<Item[]>([]);
const transactions = ref<Transaction[]>([]);
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

// Stock In Form
const stockInForm = ref({
  itemName: '',
  quantity: 1,
  supplier: '',
  notes: ''
});

// Stock Out Form
const stockOutForm = ref({
  itemName: '',
  quantity: 1,
  recipient: '',
  notes: ''
});

// Search State
const stockOutSearch = ref('');
const showStockOutDropdown = ref(false);

// Active tab
const activeTab = ref<'dashboard' | 'stockIn' | 'stockOut' | 'history'>('dashboard');

// Computed
const totalItems = computed(() => items.value.length);
const totalStock = computed(() => items.value.reduce((sum, item) => sum + item.stock, 0));
const lowStockItems = computed(() => items.value.filter(item => item.stock < 10));

const filteredStockOutItems = computed(() => {
  if (!stockOutSearch.value) return items.value;
  const searchLower = String(stockOutSearch.value).toLowerCase();
  return items.value.filter(item => 
    String(item.name).toLowerCase().includes(searchLower)
  );
});

// Methods
const loadData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [itemsData, transData] = await Promise.all([
      inventoryAPI.getItems(),
      inventoryAPI.getTransactions()
    ]);
    items.value = itemsData;
    transactions.value = transData;
  } catch (err: any) {
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false;
  }
};

const handleStockIn = async () => {
  if (!stockInForm.value.itemName || stockInForm.value.quantity <= 0) {
    error.value = 'Please provide valid item name and quantity';
    return;
  }
  
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    const result = await inventoryAPI.stockIn(stockInForm.value);
    successMessage.value = result.message;
    
    // Reset form
    stockInForm.value = { itemName: '', quantity: 1, supplier: '', notes: '' };
    
    // Reload data
    await loadData();
  } catch (err: any) {
    error.value = err.message || 'Stock in operation failed';
  } finally {
    loading.value = false;
  }
};

const selectStockOutItem = (item: Item) => {
  const name = String(item.name);
  stockOutForm.value.itemName = name;
  stockOutSearch.value = name;
  showStockOutDropdown.value = false;
};

const handleStockOut = async () => {
  // Validate that the searched item actually exists
  const existingItem = items.value.find(
    i => String(i.name).toLowerCase() === String(stockOutForm.value.itemName).toLowerCase()
  );

  if (!stockOutForm.value.itemName || !existingItem) {
    error.value = 'Please select a valid medicine from the list';
    return;
  }
  
  if (stockOutForm.value.quantity <= 0) {
    error.value = 'Please provide a valid quantity';
    return;
  }
  
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    const result = await inventoryAPI.stockOut(stockOutForm.value);
    successMessage.value = result.message;
    
    // Reset form
    stockOutForm.value = { itemName: '', quantity: 1, recipient: '', notes: '' };
    stockOutSearch.value = '';
    
    // Reload data
    await loadData();
  } catch (err: any) {
    error.value = err.message || 'Stock out operation failed';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

const clearMessages = () => {
  error.value = '';
  successMessage.value = '';
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">💊 Pharmacy Stock Manager</h1>
        <p class="text-gray-600 mt-1">Manage your pharmaceutical inventory and dispensing</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Alerts -->
      <div v-if="error" class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-red-700">⚠️ {{ error }}</span>
          </div>
          <button @click="clearMessages" class="text-red-500 hover:text-red-700">✕</button>
        </div>
      </div>

      <div v-if="successMessage" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-green-700">✓ {{ successMessage }}</span>
          </div>
          <button @click="clearMessages" class="text-green-500 hover:text-green-700">✕</button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else>
        <!-- Tab Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <nav class="flex border-b border-gray-200">
            <button
              @click="activeTab = 'dashboard'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              📊 Dashboard
            </button>
            <button
              @click="activeTab = 'stockIn'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'stockIn'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              📥 Stock In
            </button>
            <button
              @click="activeTab = 'stockOut'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'stockOut'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              📤 Stock Out
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'history'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              📜 History
            </button>
          </nav>
        </div>

        <!-- Dashboard View -->
        <div v-show="activeTab === 'dashboard'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm font-medium">Total Items</p>
                  <p class="text-3xl font-bold text-indigo-600 mt-2">{{ totalItems }}</p>
                </div>
                <div class="text-4xl">📦</div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm font-medium">Total Stock</p>
                  <p class="text-3xl font-bold text-green-600 mt-2">{{ totalStock }}</p>
                </div>
                <div class="text-4xl">📊</div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-600 text-sm font-medium">Low Stock Items</p>
                  <p class="text-3xl font-bold text-red-600 mt-2">{{ lowStockItems.length }}</p>
                </div>
                <div class="text-4xl">⚠️</div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Current Stock Levels</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in items" :key="item.name" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ item.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ item.stock }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          item.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : item.stock < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        ]"
                      >
                        {{
                          item.stock === 0
                            ? 'Out of Stock'
                            : item.stock < 10
                            ? 'Low Stock'
                            : 'In Stock'
                        }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="items.length === 0">
                    <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                      No items in inventory yet. Add stock to get started!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Stock In Form -->
        <div v-show="activeTab === 'stockIn'">
          <div class="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">📥 Stock In</h2>
            <form @submit.prevent="handleStockIn" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                <input
                  v-model="stockInForm.itemName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., Paracetamol, Amoxicillin, Insulin"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  v-model.number="stockInForm.quantity"
                  type="number"
                  min="1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input
                  v-model="stockInForm.supplier"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Supplier name (optional)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="stockInForm.notes"
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Additional notes (optional)"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Processing...' : 'Add Stock' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Stock Out Form -->
        <div v-show="activeTab === 'stockOut'">
          <div class="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">📤 Stock Out</h2>
            <form @submit.prevent="handleStockOut" class="space-y-6">
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                <div class="relative">
                  <input
                    type="text"
                    v-model="stockOutSearch"
                    @focus="showStockOutDropdown = true"
                    @input="showStockOutDropdown = true; stockOutForm.itemName = stockOutSearch"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Search medicine..."
                  />
                  <!-- Dropdown List -->
                  <div 
                    v-if="showStockOutDropdown && filteredStockOutItems.length > 0"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <ul>
                      <li
                        v-for="item in filteredStockOutItems"
                        :key="item.name"
                        @click="selectStockOutItem(item)"
                        class="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center"
                      >
                        <span class="font-medium text-gray-900">{{ item.name }}</span>
                        <span :class="{'text-red-500': item.stock === 0, 'text-green-600': item.stock > 0}" class="text-sm">
                          {{ item.stock }} in stock
                        </span>
                      </li>
                    </ul>
                  </div>
                  <!-- No items found -->
                  <div 
                    v-if="showStockOutDropdown && filteredStockOutItems.length === 0"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500"
                  >
                    No medicines found. 
                    <button @click="activeTab = 'stockIn'" class="text-indigo-600 hover:text-indigo-800 font-medium ml-1">Add Stock?</button>
                  </div>
                  <!-- Backdrop to close dropdown -->
                  <div 
                    v-if="showStockOutDropdown" 
                    class="fixed inset-0 z-0 cursor-default" 
                    @click="showStockOutDropdown = false"
                  ></div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  v-model.number="stockOutForm.quantity"
                  type="number"
                  min="1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                <input
                  v-model="stockOutForm.recipient"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Recipient name (optional)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="stockOutForm.notes"
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Additional notes (optional)"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Processing...' : 'Remove Stock' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Transaction History -->
        <div v-show="activeTab === 'history'">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">📜 Transaction History</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(trans, index) in transactions" :key="index" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ formatDate(trans.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          trans.type === 'Stock In'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ trans.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ trans.itemName }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ trans.quantity }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ trans.party }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700">
                      {{ trans.notes || '-' }}
                    </td>
                  </tr>
                  <tr v-if="transactions.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
