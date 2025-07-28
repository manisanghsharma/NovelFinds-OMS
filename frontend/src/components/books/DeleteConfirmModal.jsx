import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const DeleteConfirmModal = ({ isOpen, onClose, book }) => {
  const { deleteBook } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!book) return;
    
    setIsLoading(true);
    try {
      await deleteBook(book._id);
      toast.success('Book deleted successfully');
      onClose(true);
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !book) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Confirm Deletion</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
            Are you sure you want to delete <span className="font-semibold">"{book.title}"</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2 md:space-x-3">
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
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2 cursor-pointer"
            >
              {isLoading && <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 