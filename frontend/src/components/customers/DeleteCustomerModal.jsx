import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DeleteCustomerModal = ({ isOpen, onClose, customer }) => {
  const { deleteCustomer } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!customer) return;
    
    setIsLoading(true);
    try {
      await deleteCustomer(customer._id);
      onClose(true); // true indicates successful deletion
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !customer) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white m-5 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-semibold">{customer.name}</span> from your customers? This action cannot be undone.
            {customer.orders?.length > 0 && (
              <span className="block mt-2 text-red-600">
                This customer has {customer.orders.length} order(s). Deleting this customer may affect order records.
              </span>
            )}
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerModal; 