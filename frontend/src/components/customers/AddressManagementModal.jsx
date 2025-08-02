import { useState } from 'react';
import { X, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AddressManagementModal = ({ isOpen, onClose, customer }) => {
  const { updateCustomer, addCustomerAddress, updateCustomerAddress, deleteCustomerAddress } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', label: 'Home', isDefault: false });
  
  if (!isOpen || !customer) return null;
  
  const handleAddAddress = async () => {
    if (!newAddress.address.trim()) {
      toast.error('Address is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await addCustomerAddress(customer._id, newAddress);
      toast.success('Address added successfully');
      setNewAddress({ address: '', label: 'Home', isDefault: false });
      setShowAddForm(false);
      onClose(true); // Refresh the page
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateAddress = async () => {
    if (!editingAddress.address.trim()) {
      toast.error('Address is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateCustomerAddress(customer._id, editingAddress._id, editingAddress);
      toast.success('Address updated successfully');
      setEditingAddress(null);
      onClose(true); // Refresh the page
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAddress = async (addressId) => {
    if (customer.addresses.length === 1) {
      toast.error('Cannot delete the last address');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await deleteCustomerAddress(customer._id, addressId);
      toast.success('Address deleted successfully');
      onClose(true); // Refresh the page
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetDefault = async (addressId) => {
    setIsLoading(true);
    try {
      await updateCustomerAddress(customer._id, addressId, { isDefault: true });
      toast.success('Default address updated');
      onClose(true); // Refresh the page
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-3">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Manage Addresses - {customer.name}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Address List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base md:text-lg font-medium text-gray-800">
                Addresses ({customer.addresses?.length || 0})
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-md flex items-center space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer text-sm md:text-base"
              >
                <Plus size={16} />
                <span>Add Address</span>
              </button>
            </div>
            
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`p-3 border rounded-md ${
                      address.isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {editingAddress?._id === address._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-700 text-sm md:text-base mb-2">
                            Label
                          </label>
                          <input
                            type="text"
                            value={editingAddress.label}
                            onChange={(e) => setEditingAddress({...editingAddress, label: e.target.value})}
                            className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm md:text-base mb-2">
                            Address
                          </label>
                          <textarea
                            value={editingAddress.address}
                            onChange={(e) => setEditingAddress({...editingAddress, address: e.target.value})}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingAddress.isDefault}
                            onChange={(e) => setEditingAddress({...editingAddress, isDefault: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="text-sm text-gray-700">Set as default</label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateAddress}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base hover:bg-indigo-700 transition-colors cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAddress(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base hover:bg-gray-400 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin size={16} className="text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {address.address}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingAddress({...address})}
                              className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                              title="Edit Address"
                            >
                              <Edit size={16} />
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefault(address._id)}
                                disabled={isLoading}
                                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                title="Set as Default"
                              >
                                <MapPin size={16} />
                              </button>
                            )}
                            {customer.addresses.length > 1 && (
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                title="Delete Address"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
                <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No addresses found</p>
                <p className="text-sm">Add an address to get started</p>
              </div>
            )}
          </div>
          
          {/* Add Address Form */}
          {showAddForm && (
            <div className="border-t pt-6">
              <h3 className="text-base md:text-lg font-medium text-gray-800 mb-4">
                Add New Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm md:text-base mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Home, Office, etc."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm md:text-base mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter complete address"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Set as default</label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddAddress}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base hover:bg-indigo-700 transition-colors cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    Add Address
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAddress({ address: '', label: 'Home', isDefault: false });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base hover:bg-gray-400 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManagementModal; 