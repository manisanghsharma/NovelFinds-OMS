import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const DeleteCustomerModal = ({ isOpen, onClose, customer }) => {
  const { deleteCustomer } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!customer) return;
    
    setIsLoading(true);
    try {
      await deleteCustomer(customer._id);
      toast.success('Customer deleted successfully');
      onClose(true); // true indicates successful deletion
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !customer) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Delete Customer</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">
                Are you sure you want to delete this customer?
              </h3>
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                This action cannot be undone. The customer "{customer.name}" will be permanently deleted from the system.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md mt-4">
            <div className="text-xs md:text-sm text-gray-500">
              <p>Customer Name: <span className="font-medium text-gray-700">{customer.name}</span></p>
              <p>Phone: <span className="font-medium text-gray-700">{customer.phoneNumber}</span></p>
              <p>Social Handle: <span className="font-medium text-gray-700">{customer.socialHandle}</span></p>
            </div>
          </div>
        </div>
        
        <div className="border-t px-4 py-3 md:px-6 md:py-4 flex justify-end space-x-2 md:space-x-3">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2 cursor-pointer disabled:bg-red-400"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerModal; 