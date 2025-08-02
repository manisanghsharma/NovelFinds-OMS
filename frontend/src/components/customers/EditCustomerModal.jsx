import { useState } from 'react';
import { X, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import AddressManagementModal from './AddressManagementModal';

const EditCustomerModal = ({ isOpen, onClose, customer }) => {
  const { updateCustomer } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: customer?.name || '',
      phoneNumber: customer?.phoneNumber || '',
      otherPhone: customer?.otherPhone || '',
      socialHandle: customer?.socialHandle || ''
    }
  });
  
  const onSubmit = async (data) => {
    if (!customer) return;
    
    setIsLoading(true);
    try {
      await updateCustomer(customer._id, data);
      toast.success('Customer updated successfully');
      onClose(true); // Pass true to indicate refresh needed
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressModalClose = (refresh = false) => {
    setShowAddressModal(false);
    if (refresh) {
      // Refresh customer data if addresses were modified
      onClose(refresh);
    }
  };
  
  if (!isOpen || !customer) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Edit Customer</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('phoneNumber', { required: 'Phone number is required' })}
                className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.phoneNumber && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.phoneNumber.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-2">
                Other Phone (Optional)
              </label>
              <input
                type="text"
                {...register('otherPhone')}
                className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-2">
              Social Handle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('socialHandle', { required: 'Social handle is required' })}
              className="w-full border border-gray-300 rounded-md p-2 md:p-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.socialHandle && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.socialHandle.message}</p>}
          </div>

          {/* Address Management Section */}
          <div className="border-t pt-6 md:pt-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-medium text-gray-800">Manage Addresses</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-md flex items-center space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer text-sm md:text-base"
              >
                <Edit size={16} />
                <span>Manage Addresses</span>
              </button>
            </div>
            
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address, index) => (
                  <div
                    key={address._id || index}
                    className={`p-3 border rounded-md ${
                      address.isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.address}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-md">
                <p>No addresses found. Click "Manage Addresses" to add addresses.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:bg-indigo-400"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Update</span>
            </button>
          </div>
        </form>
      </div>

      {/* Address Management Modal */}
      {customer && (
        <AddressManagementModal
          isOpen={showAddressModal}
          onClose={handleAddressModalClose}
          customer={customer}
        />
      )}
    </div>
  );
};

export default EditCustomerModal; 