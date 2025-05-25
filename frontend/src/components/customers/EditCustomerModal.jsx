import { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const EditCustomerModal = ({ isOpen, onClose, customer }) => {
  const { updateCustomer } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: customer?.name || '',
      phoneNumber: customer?.phoneNumber || '',
      otherPhone: customer?.otherPhone || '',
      address: customer?.address || '',
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
            <X size={18} className="md:h-5 md:w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-3 md:space-y-4">
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('phoneNumber', { required: 'Phone number is required' })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.phoneNumber && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.phoneNumber.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Other Phone (Optional)
              </label>
              <input
                type="text"
                {...register('otherPhone')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
              Social Handle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('socialHandle', { required: 'Social handle is required' })}
              className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.socialHandle && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.socialHandle.message}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('address', { required: 'Address is required' })}
              rows="3"
              className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
            {errors.address && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.address.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 md:space-x-3 pt-3 md:pt-4 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1 md:space-x-2 cursor-pointer disabled:bg-indigo-400"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
              )}
              <span>Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal; 