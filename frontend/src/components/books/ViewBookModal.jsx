import { useState, useEffect } from 'react';
import { X, Book, Calendar, Tag, InfoIcon, ShoppingBag, Hash, DollarSign, FileText, Bookmark } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { bookApi } from '../../services/api';

const ViewBookModal = ({ isOpen, onClose, book: initialBook }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (isOpen && initialBook?._id) {
        setLoading(true);
        try {
          // Fetch complete book data
          const completeBook = await bookApi.getBookById(initialBook._id);
          setBook(completeBook);
        } catch (error) {
          console.error('Error fetching book details:', error);
          // Fall back to the initial book data if the API call fails
          setBook(initialBook);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();
  }, [isOpen, initialBook]);
  
  if (!isOpen || !initialBook) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        </div>
      </div>
    );
  }
  
  // Use the fetched book data, or fall back to initialBook if needed
  const bookData = book || initialBook;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">Book Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Book Title and Main Info */}
          <div className="border-b pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{bookData.title}</h3>
                {bookData.author && (
                  <p className="text-gray-600 italic">by {bookData.author}</p>
                )}
              </div>
              
              {bookData.isbn && (
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                  <Hash size={16} className="text-indigo-600 mr-2" />
                  <div>
                    <span className="text-xs text-gray-500 block">ISBN</span>
                    <span className="font-medium text-gray-800">{bookData.isbn}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Book Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800 flex items-center">
              <Book size={18} className="text-indigo-600 mr-2" />
              Book Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              {/* Left Column - Purchase Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Calendar size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Purchase Date</span>
                    <span className="text-gray-600">{new Date(bookData.purchaseDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <DollarSign size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Cost Price</span>
                    <span className="text-gray-600">₹{bookData.purchaseCost}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <DollarSign size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Selling Price</span>
                    <span className="text-gray-600">₹{bookData.sellingPrice}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <ShoppingBag size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Status</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold inline-block ${
                      bookData.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bookData.status === 'available' ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Book Details */}
              <div className="space-y-3">
                {bookData.genre && (
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <Tag size={18} className="text-indigo-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium block text-gray-700">Genre</span>
                      <span className="text-gray-600">{bookData.genre}</span>
                    </div>
                  </div>
                )}
                
                {bookData.weight && (
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <InfoIcon size={18} className="text-indigo-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium block text-gray-700">Weight</span>
                      <span className="text-gray-600">{bookData.weight} kg</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Book size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Format</span>
                    <span className="text-gray-600 capitalize">{bookData.format || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <Bookmark size={18} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium block text-gray-700">Condition</span>
                    <span className="text-gray-600">{bookData.condition || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Book Cover Image (if available) */}
          {bookData.coverImage && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 flex items-center">
                <FileText size={18} className="text-indigo-600 mr-2" />
                Book Cover
              </h4>
              <div className="flex justify-center">
                <img 
                  src={bookData.coverImage}
                  alt={`Cover for ${bookData.title}`}
                  className="max-h-64 object-contain rounded-md border shadow-sm"
                />
              </div>
            </div>
          )}
          
          {/* Notes */}
          {bookData.notes && (
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-gray-800 flex items-center">
                <FileText size={18} className="text-indigo-600 mr-2" />
                Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md border border-gray-100">{bookData.notes}</p>
            </div>
          )}
          
          {/* Description */}
          {bookData.description && (
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-gray-800 flex items-center">
                <FileText size={18} className="text-indigo-600 mr-2" />
                Description
              </h4>
              <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md border border-gray-100">{bookData.description}</p>
            </div>
          )}
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer font-medium shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookModal; 