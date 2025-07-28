import axios from 'axios';
import dotenv from 'dotenv';
// const API_URL = 'http://localhost:5002/api';
const API_URL = "https://novelfindsomsbackend2-production.up.railway.app/api";
// const API_URL = "https://novelfindsbackend.onrender.com/api";

// Book API calls
export const bookApi = {
  getBooks: async (filters = {}) => {
    const { status } = filters;
    let url = `${API_URL}/books`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await axios.get(url);
    return response.data;
  },
  
  getBookById: async (id) => {
    const response = await axios.get(`${API_URL}/books/${id}`);
    return response.data;
  },
  
  createBook: async (bookData) => {
    const response = await axios.post(`${API_URL}/books`, bookData);
    return response.data;
  },
  
  updateBook: async (id, bookData) => {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData);
    return response.data;
  },
  
  deleteBook: async (id) => {
    const response = await axios.delete(`${API_URL}/books/${id}`);
    return response.data;
  }
};

// Customer API calls
export const customerApi = {
  getCustomers: async () => {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
  },
  
  getCustomerById: async (id) => {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  },
  
  createCustomer: async (customerData) => {
    const response = await axios.post(`${API_URL}/customers`, customerData);
    return response.data;
  },
  
  updateCustomer: async (id, customerData) => {
    const response = await axios.put(`${API_URL}/customers/${id}`, customerData);
    return response.data;
  },
  
  deleteCustomer: async (id) => {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
  },
  
  searchCustomers: async (query) => {
    const response = await axios.get(`${API_URL}/customers/search?query=${query}`);
    return response.data;
  }
};

// Order API calls
export const orderApi = {
  getOrders: async () => {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  },
  
  updateOrder: async (id, orderData) => {
    const response = await axios.put(`${API_URL}/orders/${id}`, orderData);
    return response.data;
  },
  
  deleteOrder: async (id) => {
    const response = await axios.delete(`${API_URL}/orders/${id}`);
    return response.data;
  },
  
  getCustomerOrders: async (customerId) => {
    const response = await axios.get(`${API_URL}/orders/customer/${customerId}`);
    return response.data;
  },
  
  downloadAddressLabels: async () => {
    const response = await axios.get(`${API_URL}/orders/labels/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Analytics API calls
export const analyticsApi = {
  getMonthlySalesData: async (year) => {
    const url = year 
      ? `${API_URL}/analytics/monthly?year=${year}` 
      : `${API_URL}/analytics/monthly`;
    
    const response = await axios.get(url);
    return response.data;
  },
  
  getGenreBreakdown: async () => {
    const response = await axios.get(`${API_URL}/analytics/genres`);
    return response.data;
  },
  
  getCustomerBreakdown: async () => {
    const response = await axios.get(`${API_URL}/analytics/customers`);
    return response.data;
  },
  
  getInventorySummary: async () => {
    const response = await axios.get(`${API_URL}/analytics/inventory`);
    return response.data;
  }
};

// Expense API calls
export const expenseApi = {
  getExpenses: async (filters = {}) => {
    const { startDate, endDate, category, paymentMode } = filters;
    let url = `${API_URL}/expenses`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    if (paymentMode) params.append('paymentMode', paymentMode);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await axios.get(url);
    return response.data;
  },
  
  getExpenseById: async (id) => {
    const response = await axios.get(`${API_URL}/expenses/${id}`);
    return response.data;
  },
  
  createExpense: async (expenseData) => {
    const response = await axios.post(`${API_URL}/expenses`, expenseData);
    return response.data;
  },
  
  updateExpense: async (id, expenseData) => {
    const response = await axios.put(`${API_URL}/expenses/${id}`, expenseData);
    return response.data;
  },
  
  deleteExpense: async (id) => {
    const response = await axios.delete(`${API_URL}/expenses/${id}`);
    return response.data;
  },
  
  getExpenseAnalytics: async (period = 'all') => {
    const response = await axios.get(`${API_URL}/expenses/analytics?period=${period}`);
    return response.data;
  },
  
  getCashInHand: async () => {
    const response = await axios.get(`${API_URL}/expenses/cash-in-hand`);
    return response.data;
  },
  
  updateOpeningBalance: async (amount) => {
    const response = await axios.post(`${API_URL}/expenses/opening-balance`, { amount });
    return response.data;
  }
};

// Upload API calls
export const uploadApi = {
  uploadToGoogleDrive: async (file, trackingId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add trackingId to formData if provided
    if (trackingId) {
      formData.append('trackingId', trackingId);
    }
    
    const response = await axios.post(`${API_URL}/upload/drive`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  // New method to upload to imgbb
  uploadToImgbb: async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // imgbb returns the image URL in response.data.data.url
    return response.data.data.url;
  }
}; 