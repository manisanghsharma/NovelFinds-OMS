import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, User, ShoppingBag, Pencil, Trash2, Phone, MapPin, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerDetailsModal from '../components/customers/CustomerDetailsModal';
import EditCustomerModal from '../components/customers/EditCustomerModal';
import DeleteCustomerModal from '../components/customers/DeleteCustomerModal';

// Profile Image component that generates avatars based on customer name
const ProfileImage = ({ name, size = 'small' }) => {
  // Size classes - reduced sizes for mobile
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
          className="text-white" 
        />
      )}
    </div>
  );
};

// Helper function to get default address
const getDefaultAddress = (customer) => {
  if (customer.addresses && customer.addresses.length > 0) {
    const defaultAddress = customer.addresses.find(addr => addr.isDefault);
    return defaultAddress?.address || customer.addresses[0].address;
  }
  return customer.address || 'No address available';
};

const Customers = () => {
  const { customers, customersPagination, loadingCustomers, fetchCustomers } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  useEffect(() => {
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [debouncedSearchTerm]);
  
  useEffect(() => {
    // Fetch customers with current filters and pagination
    const fetchCustomersWithPagination = async () => {
      setIsChangingPage(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortField,
        sortDirection
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      await fetchCustomers(params);
      setIsChangingPage(false);
    };
    
    fetchCustomersWithPagination();
  }, [fetchCustomers, currentPage, itemsPerPage, sortField, sortDirection, debouncedSearchTerm]);
  
  const handleSort = (key) => {
    setSortField(key);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = (key) => {
    if (sortField !== key) {
      return null;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="ml-1" /> 
      : <ChevronDown size={14} className="ml-1" />;
  };
  
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleEditClick = (e, customer) => {
    e.stopPropagation(); // Prevent row click from triggering
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e, customer) => {
    e.stopPropagation(); // Prevent row click from triggering
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleModalClose = (refresh = false) => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCustomer(null);
    setSortField('createdAt'); // Reset sort field
    setSortDirection('desc'); // Reset sort direction
    
    if (refresh) {
      fetchCustomers(); // Refresh the customers list if data changed
    }
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Customer Management</h1>
      </div>
      
      {/* Search */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, social handle or phone"
              className="block w-full pl-9 pr-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSortField('createdAt');
                setSortDirection('desc');
              }}
              className="bg-gray-100 px-3 py-1.5 md:px-3 md:py-2 text-sm md:text-base rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Customers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
        {loadingCustomers || isChangingPage ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <div 
                key={customer._id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewCustomer(customer)}
              >
                <div className="flex items-center mb-2">
                  <ProfileImage name={customer.name} />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.socialHandle}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 mb-2">
                  <Phone size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500">{customer.phoneNumber}</div>
                </div>
                
                <div className="flex items-start space-x-2 mb-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500 truncate">
                    {getDefaultAddress(customer)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-1">
                    <ShoppingBag size={16} className="text-indigo-600" />
                    <span className="text-xs text-gray-700">{customer.orders?.length || 0} orders</span>
                  </div>
                  
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleEditClick(e, customer)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, customer)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 text-sm">
            {searchTerm ? (
              <p>No customers match your search criteria</p>
            ) : (
              <p>No customers found. Customers will be added when you create orders.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Desktop Customers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
        {loadingCustomers ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Customer</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('phoneNumber')}
                  >
                    <div className="flex items-center">
                      <span>Contact</span>
                      {getSortIcon('phoneNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderCount')}
                  >
                    <div className="flex items-center">
                      <span>Orders</span>
                      {getSortIcon('orderCount')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr 
                    key={customer._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ProfileImage name={customer.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.socialHandle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phoneNumber}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {getDefaultAddress(customer)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <ShoppingBag size={18} className="text-indigo-600" />
                        <span className="text-sm text-gray-900">{customer.orders?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button 
                          onClick={(e) => handleEditClick(e, customer)}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, customer)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
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
            {searchTerm ? (
              <p>No customers match your search criteria</p>
            ) : (
              <p>No customers found. Customers will be added when you create orders.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {customersPagination && customersPagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= customersPagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, customersPagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{customersPagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, customersPagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (customersPagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= customersPagination.totalPages - 2) {
                    pageNum = customersPagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= customersPagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => handleModalClose()}
          customer={selectedCustomer}
        />
      )}

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <EditCustomerModal 
          isOpen={showEditModal} 
          onClose={(refresh) => handleModalClose(refresh)}
          customer={selectedCustomer}
        />
      )}

      {/* Delete Customer Modal */}
      {selectedCustomer && (
        <DeleteCustomerModal 
          isOpen={showDeleteModal} 
          onClose={(refresh) => handleModalClose(refresh)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default Customers; 