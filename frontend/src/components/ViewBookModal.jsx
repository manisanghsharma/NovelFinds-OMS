import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const ViewBookModal = ({ isOpen, onClose, bookId }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) throw new Error('Failed to fetch book details');
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && bookId) {
      fetchBook();
    }
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
      <div className='bg-white m-5 rounded-lg shadow-xl w-full max-w-2xl'>
        <div className='flex m-5 justify-between items-center border-b px-6 py-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Book Details</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 cursor-pointer'
          >
            <X size={20} />
          </button>
        </div>
        
        <div className='p-6'>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : book ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Title</h3>
                    <p className="mt-1 text-gray-900">{book.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Author</h3>
                    <p className="mt-1 text-gray-900">{book.author}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                    <p className="mt-1 text-gray-900">{book.isbn}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <p className="mt-1 text-gray-900">${book.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                    <p className="mt-1 text-gray-900">{book.quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-gray-900">{book.category}</p>
                  </div>
                </div>
              </div>
              
              {book.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{book.description}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewBookModal; 