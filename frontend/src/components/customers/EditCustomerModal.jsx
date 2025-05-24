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
      address: customer?.address || '',
      phoneNumber: customer?.phoneNumber || '',
      otherPhone: customer?.otherPhone || '',
      socialHandle: customer?.socialHandle || ''
    }
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateCustomer(customer._id, data);
      toast.success('Customer updated successfully');
      onClose(true); // true indicates successful update
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !customer) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white m-5 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Customer</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Social Handle</label>
            <input
              type="text"
              {...register('socialHandle', { required: 'Social handle is required' })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.socialHandle && <p className="mt-1 text-sm text-red-600">{errors.socialHandle.message}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              {...register('phoneNumber', { required: 'Phone number is required' })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Other Phone (Optional)</label>
            <input
              type="text"
              {...register('otherPhone')}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Address</label>
            <textarea
              {...register('address', { required: 'Address is required' })}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal; 