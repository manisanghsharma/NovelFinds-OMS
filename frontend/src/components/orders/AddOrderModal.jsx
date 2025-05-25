import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Plus, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AddOrderModal = ({ isOpen, onClose }) => {
  const { 
    availableBooks, 
    customers, 
    searchCustomers, 
    createOrder, 
    fetchAvailableBooks,
    createCustomer
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [totalBookCost, setTotalBookCost] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      orderDate: new Date().toISOString().split('T')[0],
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
  
  // Fetch available books when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableBooks();
    }
  }, [isOpen, fetchAvailableBooks]);
  
  // Calculate shipping cost based on total weight
  useEffect(() => {
    if (selectedBooks.length === 0) {
      setShippingCost(0);
      setTotalBookCost(0);
      return;
    }
    
    // Calculate total weight and book cost
    const totalWeight = selectedBooks.reduce((sum, book) => sum + book.weight, 0);
    const bookCost = selectedBooks.reduce((sum, book) => sum + book.purchaseCost, 0);
    
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
    setTotalBookCost(bookCost);
    
  }, [selectedBooks]);
  
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
    setValue('customerName', customer.name);
    setValue('customerAddress', customer.address);
    setValue('customerPhone', customer.phoneNumber);
    setValue('customerOtherPhone', customer.otherPhone || '');
    setValue('customerSocial', customer.socialHandle);
    setSearchResults([]);
    setSearchTerm('');
  };
  
  // Handle book selection
  const handleBookSelect = (book) => {
    if (selectedBooks.find(b => b._id === book._id)) {
      setSelectedBooks(selectedBooks.filter(b => b._id !== book._id));
    } else {
      setSelectedBooks([...selectedBooks, book]);
    }
  };
  
  // Submit form
  const onSubmit = async (data) => {
    if (selectedBooks.length === 0) {
      toast.error('Please select at least one book');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare customer data
      let customerId;
      
      if (selectedCustomer) {
        customerId = selectedCustomer._id;
      } else {
        // Create new customer
        const newCustomer = {
          name: data.customerName,
          address: data.customerAddress,
          phoneNumber: data.customerPhone,
          otherPhone: data.customerOtherPhone || undefined,
          socialHandle: data.customerSocial
        };
        
        // Use the context's createCustomer function
        const createdCustomer = await createCustomer(newCustomer);
        customerId = createdCustomer._id;
      }
      
      // Prepare order data
      const orderData = {
        orderDate: data.orderDate,
        customerId,
        bookIds: selectedBooks.map(book => book._id),
        amountReceived: parseFloat(data.amountReceived),
        status: data.status
      };
      
      await createOrder(orderData);
      toast.success('Order added successfully');
      reset();
      setSelectedBooks([]);
      setSelectedCustomer(null);
      onClose();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-3'>
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Create New Order</h2>
          <button
            onClick={onClose}
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
            
            {availableBooks.length > 0 ? (
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
                      {availableBooks.map(book => (
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
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-gray-900">{book.title}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">{book.author || '-'}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">₹{book.purchaseCost}</td>
                          <td className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">{book.weight} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-50 p-2 md:p-3 rounded-md">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Selected Books:</span>
                    <span>{selectedBooks.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 md:py-4 text-xs md:text-sm text-gray-500">
                No books available for sale. Add some books first.
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
              <div className="flex justify-between">
                <span>Shipping Cost:</span>
                <span>₹{shippingCost.toFixed(2)}</span>
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
              onClick={() => {
                reset();
                setSelectedBooks([]);
                setSelectedCustomer(null);
                onClose();
              }}
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
              <span>Create Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal; 