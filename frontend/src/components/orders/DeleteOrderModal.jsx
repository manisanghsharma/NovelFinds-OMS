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
      onClose();
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
      <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
        <div className='bg-white m-5 rounded-lg shadow-xl w-full max-w-md p-6 flex justify-center items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700'></div>
        </div>
      </div>
    ) : null;
  }

  if (!isOpen || !order) return null;
  
  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
      <div className='bg-white m-5 rounded-lg shadow-xl w-full max-w-md'>
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this order for <span className="font-semibold">{order.customer?.name}</span> placed on <span className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 cursor-pointer"
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