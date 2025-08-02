import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { bookApi, customerApi, orderApi, analyticsApi, expenseApi } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for books
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [booksPagination, setBooksPagination] = useState(null);
  
  // State for customers
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersPagination, setCustomersPagination] = useState(null);
  
  // State for orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState(null);
  
  // State for analytics
  const [inventorySummary, setInventorySummary] = useState(null);
  const [monthlySalesData, setMonthlySalesData] = useState(null);
  const [genreBreakdown, setGenreBreakdown] = useState([]);
  const [customerBreakdown, setCustomerBreakdown] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);
  const [cashInHand, setCashInHand] = useState(0);
  const [expenseCategories] = useState([
    'Travel', 
    'Packaging Material', 
    'Books', 
    'Ads', 
    'Tools', 
    'Shipping',
    'Misc'
  ]);
  const [paymentModes] = useState(['Cash', 'UPI', 'Bank', 'Other']);
  
  // UI state that persists between tab changes - now also in localStorage
  const [showGraphs, setShowGraphs] = useState(() => {
    const savedShowGraphs = localStorage.getItem('showGraphs');
    return savedShowGraphs !== null ? JSON.parse(savedShowGraphs) : true;
  });
  
  // Update localStorage whenever showGraphs changes
  useEffect(() => {
    localStorage.setItem('showGraphs', JSON.stringify(showGraphs));
  }, [showGraphs]);
  
  // Fetch books
  const fetchBooks = useCallback(async (filters = {}) => {
    setLoadingBooks(true);
    try {
      const data = await bookApi.getBooks(filters);
      
      // Handle pagination data if present
      if (data.books && data.pagination) {
        setBooks(data.books);
        setBooksPagination(data.pagination);
      } else {
        // Handle non-paginated response (backward compatibility)
        setBooks(data);
        setBooksPagination(null);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoadingBooks(false);
    }
  }, []);
  
  // Fetch available books
  const fetchAvailableBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const data = await bookApi.getBooks({ status: 'available', readyForSale: true });
      setAvailableBooks(data);
      return data;
    } catch (error) {
      console.error('Error fetching available books:', error);
    } finally {
      setLoadingBooks(false);
    }
  }, []);
  
  // Fetch customers
  const fetchCustomers = useCallback(async (filters = {}) => {
    setLoadingCustomers(true);
    try {
      const data = await customerApi.getCustomers(filters);
      
      // Handle pagination data if present
      if (data.customers && data.pagination) {
        setCustomers(data.customers);
        setCustomersPagination(data.pagination);
      } else {
        // Handle non-paginated response (backward compatibility)
        setCustomers(data);
        setCustomersPagination(null);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);
  
  // Search customers
  const searchCustomers = async (query) => {
    if (!query) return [];
    try {
      return await customerApi.searchCustomers(query);
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  };
  
  // Fetch orders
  const fetchOrders = useCallback(async (filters = {}) => {
    setLoadingOrders(true);
    try {
      const data = await orderApi.getOrders(filters);
      
      // Handle pagination data if present
      if (data.orders && data.pagination) {
        setOrders(data.orders);
        setOrdersPagination(data.pagination);
      } else {
        // Handle non-paginated response (backward compatibility)
        setOrders(data);
        setOrdersPagination(null);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);
  
  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      // Fetch all analytics data in parallel
      const [inventory, monthly, genres, customers] = await Promise.all([
        analyticsApi.getInventorySummary(),
        analyticsApi.getMonthlySalesData(),
        analyticsApi.getGenreBreakdown(),
        analyticsApi.getCustomerBreakdown()
      ]);
      
      setInventorySummary(inventory);
      setMonthlySalesData(monthly);
      setGenreBreakdown(genres);
      setCustomerBreakdown(customers);
      
      return { inventory, monthly, genres, customers };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);
  
  // Fetch expenses
  const fetchExpenses = useCallback(async (filters = {}) => {
    setLoadingExpenses(true);
    try {
      const data = await expenseApi.getExpenses(filters);
      setExpenses(data);
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  }, []);
  
  // Fetch expense analytics
  const fetchExpenseAnalytics = useCallback(async (period = 'all') => {
    try {
      const data = await expenseApi.getExpenseAnalytics(period);
      setExpenseAnalytics(data);
      return data;
    } catch (error) {
      console.error('Error fetching expense analytics:', error);
    }
  }, []);
  
  // Fetch cash in hand
  const fetchCashInHand = useCallback(async () => {
    try {
      const data = await expenseApi.getCashInHand();
      setCashInHand(data.amount);
      return data;
    } catch (error) {
      console.error('Error fetching cash in hand:', error);
      return { amount: 0, openingBalance: 0 };
    }
  }, []);
  
  // Create a new book
  const createBook = async (bookData) => {
    try {
      console.log('Creating book with data:', bookData);
      const newBook = await bookApi.createBook(bookData);
      console.log('Book created:', newBook);
      setBooks(prevBooks => [...prevBooks, newBook]);
      if (newBook.status === 'available') {
        setAvailableBooks(prevBooks => [...prevBooks, newBook]);
      }
      return newBook;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  };
  
  // Update a book
  const updateBook = async (id, bookData) => {
    try {
      console.log('Updating book with id:', id, 'and data:', bookData);
      const updatedBook = await bookApi.updateBook(id, bookData);
      console.log('Book updated:', updatedBook);
      setBooks(prevBooks => 
        prevBooks.map(book => book._id === id ? updatedBook : book)
      );
      
      // Also update available books list if needed
      if (updatedBook.status === 'available') {
        setAvailableBooks(prevAvailableBooks => {
          const exists = prevAvailableBooks.some(book => book._id === id);
          if (exists) {
            return prevAvailableBooks.map(book => book._id === id ? updatedBook : book);
          } else {
            return [...prevAvailableBooks, updatedBook];
          }
        });
      } else {
        setAvailableBooks(prevAvailableBooks => 
          prevAvailableBooks.filter(book => book._id !== id)
        );
      }
      
      return updatedBook;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };
  
  // Delete a book
  const deleteBook = async (id) => {
    try {
      await bookApi.deleteBook(id);
      setBooks(prevBooks => prevBooks.filter(book => book._id !== id));
      setAvailableBooks(prevBooks => prevBooks.filter(book => book._id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };
  
  // Create a new customer
  const createCustomer = async (customerData) => {
    try {
      const newCustomer = await customerApi.createCustomer(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };
  
  // Update an existing customer
  const updateCustomer = async (id, customerData) => {
    try {
      const updatedCustomer = await customerApi.updateCustomer(id, customerData);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === id ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };
  
  // Delete a customer
  const deleteCustomer = async (id) => {
    try {
      await customerApi.deleteCustomer(id);
      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => customer._id !== id)
      );
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };
  
  // Add address to customer
  const addCustomerAddress = async (customerId, addressData) => {
    try {
      const updatedCustomer = await customerApi.addCustomerAddress(customerId, addressData);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === customerId ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (error) {
      console.error('Error adding customer address:', error);
      throw error;
    }
  };
  
  // Update customer address
  const updateCustomerAddress = async (customerId, addressId, addressData) => {
    try {
      const updatedCustomer = await customerApi.updateCustomerAddress(customerId, addressId, addressData);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === customerId ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer address:', error);
      throw error;
    }
  };
  
  // Delete customer address
  const deleteCustomerAddress = async (customerId, addressId) => {
    try {
      const updatedCustomer = await customerApi.deleteCustomerAddress(customerId, addressId);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === customerId ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (error) {
      console.error('Error deleting customer address:', error);
      throw error;
    }
  };
  
  // Create a new order
  const createOrder = async (orderData) => {
    try {
      const newOrder = await orderApi.createOrder(orderData);
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      // Update available books
      await fetchAvailableBooks();
      
      // Refresh expense analytics and cash in hand
      await fetchExpenseAnalytics();
      await fetchCashInHand();
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  // Update order shipping details
  const updateOrderShipping = async (orderId, shippingData) => {
    try {
      const updatedOrder = await orderApi.updateOrder(orderId, shippingData);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );
      // Refresh expense analytics and cash in hand
      await fetchExpenseAnalytics();
      await fetchCashInHand();
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order shipping:', error);
      throw error;
    }
  };
  
  // Update order details
  const updateOrder = async (orderId, orderData) => {
    try {
      const updatedOrder = await orderApi.updateOrder(orderId, orderData);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );
      // Refresh expense analytics and cash in hand
      await fetchExpenseAnalytics();
      await fetchCashInHand();
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };
  
  // Delete an order
  const deleteOrder = async (orderId) => {
    try {
      await orderApi.deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      
      // Refresh expense analytics and cash in hand
      await fetchExpenseAnalytics();
      await fetchCashInHand();
      
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };
  
  // Update opening balance
  const updateOpeningBalance = async (amount) => {
    try {
      const data = await expenseApi.updateOpeningBalance(amount);
      await fetchCashInHand();
      return data;
    } catch (error) {
      console.error('Error updating opening balance:', error);
      throw error;
    }
  };
  
  // Create a new expense
  const createExpense = async (expenseData) => {
    try {
      const newExpense = await expenseApi.createExpense(expenseData);
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
      await fetchCashInHand();
      await fetchExpenseAnalytics();
      return newExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  };
  
  // Update an expense
  const updateExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await expenseApi.updateExpense(id, expenseData);
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => expense._id === id ? updatedExpense : expense)
      );
      await fetchCashInHand();
      await fetchExpenseAnalytics();
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };
  
  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      await expenseApi.deleteExpense(id);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== id));
      await fetchCashInHand();
      await fetchExpenseAnalytics();
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    fetchBooks();
    fetchAvailableBooks();
    fetchCustomers();
    fetchOrders();
    fetchAnalyticsData();
    fetchExpenses();
    fetchExpenseAnalytics();
    fetchCashInHand();
  }, [fetchBooks, fetchAvailableBooks, fetchCustomers, fetchOrders, fetchAnalyticsData, 
      fetchExpenses, fetchExpenseAnalytics, fetchCashInHand]);
  
  const value = {
    books,
    availableBooks,
    booksPagination,
    customers,
    customersPagination,
    orders,
    ordersPagination,
    inventorySummary,
    monthlySalesData,
    genreBreakdown,
    customerBreakdown,
    loadingBooks,
    loadingCustomers,
    loadingOrders,
    loadingAnalytics,
    expenses,
    loadingExpenses,
    expenseAnalytics,
    cashInHand,
    expenseCategories,
    paymentModes,
    showGraphs,
    setShowGraphs,
    fetchBooks,
    fetchAvailableBooks,
    fetchCustomers,
    searchCustomers,
    fetchOrders,
    fetchAnalyticsData,
    createBook,
    updateBook,
    deleteBook,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    createOrder,
    updateOrderShipping,
    updateOrder,
    deleteOrder,
    fetchExpenses,
    fetchExpenseAnalytics,
    fetchCashInHand,
    createExpense,
    updateExpense,
    deleteExpense,
    updateOpeningBalance
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 