import { useState, useEffect } from 'react';
import { X, ShoppingBag, Eye, User, Phone, MapPin, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { orderApi } from '../../services/api';
import ViewOrderModal from '../orders/ViewOrderModal';

// Profile Image component that generates avatars based on customer name
const ProfileImage = ({ socialHandle, name, size = 'small' }) => {
  // Size classes - reduced for mobile
  const sizeClasses = size === 'large' 
    ? "h-16 w-16 md:h-24 md:w-24" 
    : size === 'medium'
      ? "h-12 w-12 md:h-16 md:w-16"
      : "h-8 w-8 md:h-10 md:w-10";
  
  // Get initials from name (up to 2 characters)
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(name);
  
  // Generate a consistent color based on the name
  const getColorFromName = (name) => {
    if (!name) return '#6366F1'; // Default indigo color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  // Get background color
  const bgColor = getColorFromName(name);
  
  // Create a UI Avatars URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${encodeURIComponent(bgColor.replace('#', ''))}&color=fff&bold=true&size=128`;
  
  return (
    <div 
      className={`flex-shrink-0 ${sizeClasses} rounded-full overflow-hidden flex items-center justify-center text-white`}
      style={{ backgroundColor: bgColor }}
    >
      {name && (
        <img
          src={avatarUrl}
          alt={`${name}'s avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
      {!name && (
        <User 
          size={size === 'large' ? 24 : size === 'medium' ? 20 : 14} 
          className="text-white md:h-6 md:w-6" 
        />
      )}
    </div>
  );
};

const CustomerDetailsModal = ({ isOpen, onClose, customer }) => {
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewOrderData, setViewOrderData] = useState(null);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  
  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerOrders();
    }
  }, [isOpen, customer]);
  
  const fetchCustomerOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await orderApi.getCustomerOrders(customer._id);
      setCustomerOrders(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewOrder = (order) => {
    setViewOrderData(order);
    setShowViewOrderModal(true);
  };
  
  const handleViewOrderClose = () => {
    setShowViewOrderModal(false);
    setViewOrderData(null);
  };
  
  if (!isOpen || !customer) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Customer Details</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
            <ProfileImage socialHandle={customer.socialHandle} name={customer.name} size="medium" />
            <div>
              <h3 className="text-base md:text-xl font-medium">{customer.name}</h3>
              <p className="text-xs md:text-sm text-gray-600">{customer.socialHandle}</p>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 border-b pb-2">Contact Information</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start space-x-2">
                  <Phone size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm md:text-base font-medium">{customer.phoneNumber}</div>
                  </div>
                </div>
                {customer.otherPhone && (
                  <div className="flex items-start space-x-2">
                    <Phone size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-gray-500">Other Phone:</div>
                      <div className="text-sm md:text-base font-medium">{customer.otherPhone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 border-b pb-2">Address</h3>
              <div className="flex items-start space-x-2">
                <MapPin size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm md:text-base font-medium whitespace-pre-line">{customer.address}</div>
              </div>
            </div>
          </div>
          
          {/* Customer Orders */}
          <div>
            <h3 className="text-base md:text-lg font-medium text-gray-800 border-b pb-2 mb-3 md:mb-4">Order History</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-4 md:py-6">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-indigo-700"></div>
              </div>
            ) : customerOrders.length > 0 ? (
              <div className="overflow-x-auto border rounded-md">
                {/* Desktop view for orders */}
                <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerOrders.map(order => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewOrder(order)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <ShoppingBag size={16} className="text-indigo-600" />
                            <span className="text-sm text-gray-900">
                              {order.books.length} {order.books.length === 1 ? 'book' : 'books'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.books.map(book => book.title).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.amountReceived}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'Packed' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Mobile view for orders */}
                <div className="md:hidden divide-y divide-gray-200">
                  {customerOrders.map(order => (
                    <div 
                      key={order._id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewOrder(order)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-medium text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'Packed' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-1">
                        <ShoppingBag size={16} className="text-indigo-600" />
                        <span className="text-xs text-gray-700">
                          {order.books.length} {order.books.length === 1 ? 'book' : 'books'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 truncate max-w-[70%]">
                          {order.books.map(book => book.title).join(', ')}
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          ₹{order.amountReceived}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 md:py-6 text-xs md:text-sm text-gray-500 bg-gray-50 rounded-md">
                <p>No orders found for this customer</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t px-4 py-3 md:px-6 md:py-4 flex justify-end">
          <button
            onClick={() => onClose()}
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* View Order Modal */}
      {viewOrderData && (
        <ViewOrderModal
          isOpen={showViewOrderModal}
          onClose={handleViewOrderClose}
          order={viewOrderData}
        />
      )}
    </div>
  );
};

export default CustomerDetailsModal; 