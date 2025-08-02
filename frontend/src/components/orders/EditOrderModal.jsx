import { useState, useEffect } from 'react';
import { X, ShoppingBag, Pencil } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '../../context/AppContext';
import { orderApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const EditOrderModal = ({ isOpen, onClose, order: initialOrder }) => {
  const { 
    availableBooks, 
    updateOrder,
    createCustomer,
    updateCustomer, 
    searchCustomers,
    fetchAvailableBooks,
    fetchOrders
  } = useAppContext();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [totalBookCost, setTotalBookCost] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [bookQuantities, setBookQuantities] = useState({});
  
  // Books that are available for selection (available books plus the ones in the current order)
  const [combinedAvailableBooks, setCombinedAvailableBooks] = useState([]);
  
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  
  const [isShippingEditable, setIsShippingEditable] = useState(false);
  const [manualShippingCost, setManualShippingCost] = useState(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      orderDate: '',
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      customerOtherPhone: '',
      customerSocial: '',
      amountReceived: '',
      status: 'Pending'
    }
  });
  
  // Watch amount received for calculations
  const amountReceived = watch('amountReceived');
  
  // Fetch complete order data when modal opens
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isOpen && initialOrder?._id) {
        setIsFetchingOrder(true);
        try {
          // Fetch complete order data with populated fields
          const completeOrder = await orderApi.getOrderById(initialOrder._id);
          setOrder(completeOrder);
        } catch (error) {
          console.error('Error fetching order details:', error);
          // Fall back to the initial order data if the API call fails
          setOrder(initialOrder);
        } finally {
          setIsFetchingOrder(false);
        }
      }
    };

    fetchOrderDetails();
  }, [isOpen, initialOrder]);

  // Fetch available books when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableBooks();
    }
  }, [isOpen, fetchAvailableBooks]);
  
  // Set initial form values when order data changes or modal opens
  useEffect(() => {
    if (order && isOpen) {
      // Set form values
      setValue('orderDate', order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '');
      setValue('status', order.status || 'Pending');
      setValue('amountReceived', order.amountReceived || '');
      
      // Set customer information
      if (order.customer) {
        setSelectedCustomer(order.customer);
        setValue('customerName', order.customer.name || '');
        setValue('customerAddress', order.shippingAddress?.address || order.customer.address || '');
        setValue('customerPhone', order.customer.phoneNumber || '');
        setValue('customerOtherPhone', order.customer.otherPhone || '');
        setValue('customerSocial', order.customer.socialHandle || '');
      }
      
      // Set selected books and quantities
      if (order.books && order.books.length) {
        setSelectedBooks([...order.books]);
        
        // Initialize book quantities
        const quantities = {};
        order.books.forEach(book => {
          if (book.quantity) {
            quantities[book._id] = book.quantity;
          }
        });
        setBookQuantities(quantities);
      }
      
      // If order has a shipping cost, set it as the manual value
      if (order.shippingCost !== undefined) {
        setManualShippingCost(order.shippingCost);
      }
    }
  }, [order, isOpen, setValue]);
  
  // Update available books list whenever availableBooks or selectedBooks change
  useEffect(() => {
    if (availableBooks && order?.books) {
      // Create a map of book IDs to avoid duplicates
      const bookMap = new Map();
      
      // Add all available books to the map first
      availableBooks.forEach(book => {
        bookMap.set(book._id, book);
      });
      
      // Add books from the current order (if not already in the map)
      // This ensures books already in the order but possibly no longer "available" still show
      order.books.forEach(book => {
        if (!bookMap.has(book._id)) {
          bookMap.set(book._id, book);
        }
      });
      
      // Convert map values to array
      setCombinedAvailableBooks(Array.from(bookMap.values()));
    } else if (availableBooks) {
      setCombinedAvailableBooks(availableBooks);
    }
  }, [availableBooks, order]);
  
  // Handle quantity change
  const handleQuantityChange = (book, change) => {
    const currentQty = bookQuantities[book._id] || 1;
    const newQty = Math.max(1, Math.min(book.quantity || 10, currentQty + change));
    
    setBookQuantities({
      ...bookQuantities,
      [book._id]: newQty
    });
  };
  
  // Calculate shipping cost based on total weight and quantities
  useEffect(() => {
    if (selectedBooks.length === 0) {
      setShippingCost(0);
      setTotalBookCost(0);
      return;
    }
    
    // Calculate total weight and book cost with quantities
    const totalWeight = selectedBooks.reduce((sum, book) => {
      const weight = parseFloat(book.weight);
      const quantity = bookQuantities[book._id] || 1;
      return sum + (isNaN(weight) ? 0 : weight * quantity);
    }, 0);
    
    const bookCost = selectedBooks.reduce((sum, book) => {
      const cost = parseFloat(book.purchaseCost);
      const quantity = bookQuantities[book._id] || 1;
      return sum + (isNaN(cost) ? 0 : cost * quantity);
    }, 0);
    
    // Use manual shipping cost if it's being edited, otherwise calculate it
    if (manualShippingCost !== null && isShippingEditable) {
      setShippingCost(manualShippingCost);
    } else {
      // Calculate shipping cost based on weight in kg
      const calculateShippingCost = (weightKg) => {
        if (isNaN(weightKg) || weightKg <= 0) return 0;
        const weightGrams = weightKg * 1000;
        if (weightGrams <= 500) return 42;
        const extraWeight = weightGrams - 500;
        const increments = Math.ceil(extraWeight / 500);
        return 42 + increments * 19;
      };
      
      const calculatedShippingCost = calculateShippingCost(totalWeight);
      setShippingCost(calculatedShippingCost);
    }
    
    setTotalBookCost(bookCost);
    
  }, [selectedBooks, bookQuantities, manualShippingCost, isShippingEditable]);
  
  // Check if the order has a different shipping cost than what would be automatically calculated
  useEffect(() => {
    if (order && order.shippingCost !== undefined && selectedBooks.length > 0) {
      // Calculate what the shipping cost would be automatically
      const totalWeight = selectedBooks.reduce((sum, book) => {
        const weight = parseFloat(book.weight);
        const quantity = bookQuantities[book._id] || 1;
        return sum + (isNaN(weight) ? 0 : weight * quantity);
      }, 0);
      
      const calculateShippingCost = (weightKg) => {
        if (isNaN(weightKg) || weightKg <= 0) return 0;
        const weightGrams = weightKg * 1000;
        if (weightGrams <= 500) return 42;
        const extraWeight = weightGrams - 500;
        const increments = Math.ceil(extraWeight / 500);
        return 42 + increments * 19;
      };
      
      const calculatedShippingCost = calculateShippingCost(totalWeight);
      
      // If the shipping cost in the order is different from what would be calculated,
      // it was likely manually edited - set editing mode to true
      if (Math.abs(calculatedShippingCost - order.shippingCost) > 0.01) {
        setIsShippingEditable(true);
      }
    }
  }, [order, selectedBooks, bookQuantities]);

  // When order loads, check if it has a custom shipping cost
  useEffect(() => {
    if (order && order.shippingCost) {
      setManualShippingCost(order.shippingCost);
    }
  }, [order]);
  
  // Toggle shipping cost manual edit
  const toggleShippingEdit = () => {
    if (!isShippingEditable) {
      setManualShippingCost(shippingCost);
    }
    setIsShippingEditable(!isShippingEditable);
  };

  // Handle shipping cost manual input change
  const handleShippingCostChange = (e) => {
    const value = parseFloat(e.target.value);
    setManualShippingCost(isNaN(value) ? 0 : value);
  };
  
  // Calculate total expense and net profit
  useEffect(() => {
    const expense = totalBookCost + shippingCost;
    setTotalExpense(expense);
    
    const amount = parseFloat(amountReceived) || 0;
    setNetProfit(amount - expense);
  }, [totalBookCost, shippingCost, amountReceived]);
  
  // Handle customer search
  const handleCustomerSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchCustomers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setValue('customerName', customer.name || '');
    
    // Get default address from addresses array
    let defaultAddress = '';
    if (customer.addresses && customer.addresses.length > 0) {
      const defaultAddr = customer.addresses.find(addr => addr.isDefault);
      defaultAddress = defaultAddr?.address || customer.addresses[0].address;
    } else {
      defaultAddress = customer.address || '';
    }
    
    setValue('customerAddress', defaultAddress);
    setValue('customerPhone', customer.phoneNumber || '');
    setValue('customerOtherPhone', customer.otherPhone || '');
    setValue('customerSocial', customer.socialHandle || '');
    setSearchResults([]);
    setSearchTerm('');
  };
  
  // Handle book selection
  const handleBookSelect = (book) => {
    if (selectedBooks.find(b => b._id === book._id)) {
      setSelectedBooks(selectedBooks.filter(b => b._id !== book._id));
      
      // Remove quantity for this book
      const newQuantities = {...bookQuantities};
      delete newQuantities[book._id];
      setBookQuantities(newQuantities);
    } else {
      setSelectedBooks([...selectedBooks, book]);
      
      // Set default quantity to 1
      setBookQuantities(prev => ({
        ...prev,
        [book._id]: 1
      }));
    }
  };
  
  // Alphabetically sorted and filtered books
  const filteredBooks = combinedAvailableBooks
    .filter(book => {
      const term = bookSearchTerm.toLowerCase();
      return (
        book.title.toLowerCase().includes(term) ||
        (book.author && book.author.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  
  // Submit form
  const onSubmit = async (data) => {
    if (!order) return;
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book');
      return;
    }
    
    setIsLoading(true);
    try {
      // Handle customer data
      let customerId = selectedCustomer?._id || order.customer?._id;
      
      // If we have customer data but no ID, need to create a new customer
      if (!customerId && data.customerName && data.customerPhone) {
        try {
          const customerData = {
            name: data.customerName,
            phoneNumber: data.customerPhone,
            otherPhone: data.customerOtherPhone,
            address: data.customerAddress,
            socialHandle: data.customerSocial
          };
          const newCustomer = await createCustomer(customerData);
          customerId = newCustomer._id;
        } catch (error) {
          console.error('Error creating customer:', error);
          toast.error('Failed to create customer');
          setIsLoading(false);
          return;
        }
      }
      // If we have an existing customer but data has changed, update the customer
      else if (customerId && (
        data.customerName !== selectedCustomer?.name ||
        data.customerPhone !== selectedCustomer?.phoneNumber || 
        data.customerOtherPhone !== selectedCustomer?.otherPhone ||
        data.customerAddress !== selectedCustomer?.address ||
        data.customerSocial !== selectedCustomer?.socialHandle
      )) {
        try {
          const customerData = {
            name: data.customerName,
            phoneNumber: data.customerPhone,
            otherPhone: data.customerOtherPhone,
            address: data.customerAddress,
            socialHandle: data.customerSocial
          };
          await updateCustomer(customerId, customerData);
        } catch (error) {
          console.error('Error updating customer:', error);
          // Continue with order update even if customer update fails
        }
      }
      
      // Prepare order update data with quantities
      const bookOrders = selectedBooks.map(book => ({
        bookId: book._id,
        quantity: bookQuantities[book._id] || 1
      }));
      
      const updateData = {
        orderDate: data.orderDate,
        status: data.status,
        amountReceived: parseFloat(data.amountReceived) || 0,
        bookOrders: bookOrders,
        customerId: customerId,
        shippingCost: shippingCost
      };
      
      await updateOrder(order._id, updateData);
      await fetchOrders(); // Refetch orders to update the list
      toast.success('Order updated successfully');
      onClose(true);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (isFetchingOrder) {
    return isOpen ? (
      <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 m-3 flex justify-center items-center'>
          <div className='animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-700'></div>
        </div>
      </div>
    ) : null;
  }
  
  if (!isOpen) return null;
  
  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-3'>
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Edit Order</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Order Date */}
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Order Date</label>
            <input
              type="date"
              {...register('orderDate', { required: 'Order date is required' })}
              className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.orderDate && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.orderDate.message}</p>}
          </div>
          
          {/* Customer Information */}
          <div className="border-t border-b py-3 md:py-4">
            <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3 md:mb-4">Customer Information</h3>
            
            {/* Customer Search */}
            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Search Existing Customer</label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleCustomerSearch(e.target.value);
                    }}
                    placeholder="Search by name, phone or social handle"
                    className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {searchResults.map(customer => (
                        <div
                          key={customer._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.socialHandle}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-indigo-700"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Customer Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('customerName', { required: 'Customer name is required' })}
                  className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.customerName && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.customerName.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                  Social Handle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('customerSocial', { required: 'Social handle is required' })}
                  className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.customerSocial && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.customerSocial.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('customerPhone', { required: 'Phone number is required' })}
                  className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.customerPhone && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.customerPhone.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                  Other Phone (Optional)
                </label>
                <input
                  type="text"
                  {...register('customerOtherPhone')}
                  className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-3 md:mt-4">
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('customerAddress', { required: 'Address is required' })}
                rows={2}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter complete delivery address"
              />
              {errors.customerAddress && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.customerAddress.message}</p>}
            </div>
          </div>
          
          {/* Book Selection */}
          <div className="border-b pb-3 md:pb-4">
            <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3 md:mb-4">Select Books</h3>
            {/* Book Search Bar */}
            <div className="mb-2">
              <input
                type="text"
                value={bookSearchTerm}
                onChange={e => setBookSearchTerm(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-xs md:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {filteredBooks.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                <div className="max-h-40 md:max-h-60 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 md:px-4 py-1 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                        <th className="px-2 md:px-4 py-1 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-2 md:px-4 py-1 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-2 md:px-4 py-1 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-2 md:px-4 py-1 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map(book => (
                        <tr 
                          key={book._id} 
                          className={`hover:bg-gray-50 cursor-pointer text-xs md:text-sm ${
                            selectedBooks.find(b => b._id === book._id) ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => handleBookSelect(book)}
                        >
                          <td className="px-2 md:px-4 py-1 md:py-2">
                            <input 
                              type="checkbox"
                              checked={selectedBooks.some(b => b._id === book._id)}
                              onChange={() => {}}
                              className="h-3 w-3 md:h-4 md:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-gray-900">{book.title || 'Untitled'}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">{book.author || '-'}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">₹{book.purchaseCost !== undefined ? book.purchaseCost : '0'}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">{book.weight !== undefined ? `${book.weight} kg` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Selected Books List */}
                {selectedBooks.length > 0 && (
                  <div className="bg-gray-50 p-2 md:p-3 rounded-md">
                    <div className="overflow-x-auto -mx-2 md:mx-0">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                            <th className="px-3 py-2 md:px-4 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-3 py-2 md:px-4 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-3 py-2 md:px-4 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedBooks.map((book) => (
                            <tr key={book._id}>
                              <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                                <div className="flex items-start space-x-2">
                                  <span className="inline-block">
                                    <ShoppingBag
                                      size={16}
                                      className="text-indigo-600 flex-shrink-0 md:h-5 md:w-5"
                                    />
                                  </span>
                                  <div>
                                    <div className="text-xs md:text-sm font-medium text-gray-900">{book.title || "Untitled"}</div>
                                    <div className="text-xs text-gray-500">{book.author || "Unknown author"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center">
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(book, -1);
                                    }}
                                    className="bg-gray-200 text-gray-600 rounded-l-md px-2 py-1 text-xs md:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={(bookQuantities[book._id] || 1) <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="px-2 py-1 bg-gray-50">{bookQuantities[book._id] || 1}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(book, 1);
                                    }}
                                    className="bg-gray-200 text-gray-600 rounded-r-md px-2 py-1 text-xs md:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={(bookQuantities[book._id] || 1) >= (book.quantity || 10)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right text-gray-900">
                                ₹{book.purchaseCost !== undefined ? (book.purchaseCost * (bookQuantities[book._id] || 1)).toFixed(2) : "0"}
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right text-gray-500">
                                {book.weight !== undefined ? `${(book.weight * (bookQuantities[book._id] || 1)).toFixed(2)} kg` : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium">
                              Total ({selectedBooks.length} {selectedBooks.length === 1 ? "book" : "books"})
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center font-medium">
                              {selectedBooks.reduce((sum, book) => sum + (bookQuantities[book._id] || 1), 0)}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right font-medium">
                              ₹{totalBookCost.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right">
                              {selectedBooks.reduce(
                                (sum, book) => sum + ((parseFloat(book.weight) || 0) * (bookQuantities[book._id] || 1)),
                                0
                              ).toFixed(2)} kg
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3 md:py-4 text-xs md:text-sm text-gray-500">
                No books found.
              </div>
            )}
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Amount Received (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amountReceived', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.amountReceived && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.amountReceived.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 md:p-4 rounded-md">
            <h3 className="text-base md:text-lg font-medium text-gray-800 mb-1 md:mb-2">Order Summary</h3>
            <div className="space-y-1 md:space-y-2 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Book Cost:</span>
                <span>₹{totalBookCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  Shipping Cost:
                  <button 
                    type="button" 
                    onClick={toggleShippingEdit} 
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                    title={isShippingEditable ? "Use automatic calculation" : "Edit shipping cost manually"}
                  >
                    <Pencil size={14} className={isShippingEditable ? "text-indigo-600" : "text-gray-500"} />
                  </button>
                </span>
                {isShippingEditable ? (
                  <div className="flex items-center">
                    <span className="mr-1">₹</span>
                    <input
                      type="number"
                      value={manualShippingCost}
                      onChange={handleShippingCostChange}
                      min="0"
                      step="1"
                      className="w-16 p-1 border border-gray-300 rounded text-right"
                    />
                  </div>
                ) : (
                  <span>₹{shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Total Expense:</span>
                <span>₹{totalExpense.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Amount Received:</span>
                <span>₹{parseFloat(amountReceived || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 md:pt-2 border-t font-bold">
                <span>Net Profit:</span>
                <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 md:space-x-3 pt-3 md:pt-4 border-t">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-md text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedBooks.length === 0}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1 md:space-x-2 text-sm md:text-base cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading && <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>}
              <span>Update Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal; 