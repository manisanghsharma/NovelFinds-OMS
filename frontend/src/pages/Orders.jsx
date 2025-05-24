import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Filter, Pencil, Truck, Trash2, Eye, User } from 'lucide-react';
import AddOrderModal from '../components/orders/AddOrderModal';
import ShippingModal from '../components/orders/ShippingModal';
import EditOrderModal from '../components/orders/EditOrderModal';
import DeleteOrderModal from '../components/orders/DeleteOrderModal';
import ViewOrderModal from '../components/orders/ViewOrderModal';

// Profile Image component that generates avatars based on customer name
const ProfileImage = ({ name, size = 'small' }) => {
  // Size classes
  const sizeClasses = size === 'large' 
    ? "h-24 w-24" 
    : size === 'medium'
      ? "h-16 w-16"
      : "h-10 w-10";
  
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
          size={size === 'large' ? 32 : size === 'medium' ? 24 : 16} 
          className="text-white" 
        />
      )}
    </div>
  );
};

const Orders = () => {
  const { orders, loadingOrders, fetchOrders } = useAppContext();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  useEffect(() => {
    // Filter orders based on search term and status filter
    if (!orders) return;
    
    let filtered = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order => 
          order.customer?.name?.toLowerCase().includes(term) || 
          order.customer?.socialHandle?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);
  
  const handleShippingClick = (order) => {
    setSelectedOrder(order);
    setShowShippingModal(true);
  };
  
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };
  
  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };
  
  const handleModalClose = () => {
    setShowAddModal(false);
    setShowShippingModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedOrder(null);
    fetchOrders(); // Refresh orders after modal closes
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>New Order</span>
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name or social handle"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loadingOrders ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => handleViewClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ProfileImage name={order.customer?.name} />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{order.customer?.name}</div>
                          <div className="text-sm text-gray-500">{order.customer?.socialHandle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-indigo-50 text-indigo-700">
                        {order.books?.length} {order.books?.length === 1 ? 'Book' : 'Books'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      ₹{order.amountReceived}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${order.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{order.netProfit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'Packed' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleShippingClick(order)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer p-1 hover:bg-blue-50 rounded"
                          title="Update Shipping"
                        >
                          <Truck size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(order)}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-1 hover:bg-indigo-50 rounded"
                          title="Edit Order"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(order)}
                          className="text-red-600 hover:text-red-900 cursor-pointer p-1 hover:bg-red-50 rounded"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            {searchTerm || statusFilter ? (
              <p>No orders match your search criteria</p>
            ) : (
              <p>No orders found. Create a new order to get started.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AddOrderModal isOpen={showAddModal} onClose={handleModalClose} />
      
      {/* Shipping Modal */}
      {selectedOrder && (
        <ShippingModal 
          isOpen={showShippingModal} 
          onClose={handleModalClose}
          order={selectedOrder}
        />
      )}
      
      {/* Edit Order Modal */}
      {selectedOrder && (
        <EditOrderModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          order={selectedOrder}
        />
      )}
      
      {/* Delete Order Modal */}
      {selectedOrder && (
        <DeleteOrderModal
          isOpen={showDeleteModal}
          onClose={handleModalClose}
          order={selectedOrder}
        />
      )}
      
      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={showViewModal}
          onClose={handleModalClose}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default Orders; 