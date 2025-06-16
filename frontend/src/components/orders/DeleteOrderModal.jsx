import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DeleteOrderModal = ({ isOpen, onClose, order }) => {
  const { deleteOrder } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!order) return;
    
    setIsLoading(true);
    try {
      await deleteOrder(order._id);
      onClose(true);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return isOpen ? (
      <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 m-3 flex justify-center items-center'>
          <div className='animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-700'></div>
        </div>
      </div>
    ) : null;
  }

  if (!isOpen || !order) return null;
  
  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md m-3'>
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
            Are you sure you want to delete this order for <span className="font-semibold">{order.customer?.name}</span> placed on <span className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2 md:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-md text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm md:text-base cursor-pointer"
            >
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal; 