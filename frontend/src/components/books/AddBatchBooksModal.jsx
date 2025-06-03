import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AddBatchBooksModal = ({ isOpen, onClose }) => {
  const { createBook } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPreview([]);
      setError('');
    }
  }, [isOpen]);

  // Example format for the text area
  const exampleFormat = `{ "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "format": "hardcover", "purchaseCost": 200, "sellingPrice": 300, "weight": 0.5, "condition": "Good", "purchaseDate": "2023-06-15" }
{ "title": "To Kill a Mockingbird", "author": "Harper Lee", "format": "paperback", "purchaseCost": 80, "sellingPrice": 150, "weight": 0.3, "condition": "Very Good" }`;

  const parseEntry = (entry) => {
    try {
      // Default values
      const defaultBook = {
        purchaseDate: new Date().toISOString().split('T')[0],
        format: 'hardcover',
        condition: 'Good',
      };
      
      // Parse JSON object
      const parsedBook = JSON.parse(entry);
      
      // Merge with default values
      return { ...defaultBook, ...parsedBook };
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  };

  const validateBook = (book) => {
    if (!book.title) return 'Title is required';
    if (!book.purchaseDate) return 'Purchase date is required';
    if (!book.purchaseCost) return 'Purchase cost is required';
    if (!book.sellingPrice) return 'Selling price is required';
    if (!book.weight) return 'Weight is required';
    return null;
  };

  const previewBatch = () => {
    setError('');
    setPreview([]);
    
    if (!batchText.trim()) {
      setError('Please enter book data');
      return;
    }
    
    const entries = batchText.split('\n').filter(entry => entry.trim());
    const parsedBooks = [];
    const errors = [];
    
    entries.forEach((entry, index) => {
      try {
        const book = parseEntry(entry);
        const validationError = validateBook(book);
        
        if (validationError) {
          errors.push(`Entry ${index + 1}: ${validationError}`);
        } else {
          parsedBooks.push(book);
        }
      } catch (error) {
        errors.push(`Entry ${index + 1}: ${error.message}`);
      }
    });
    
    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setPreview(parsedBooks);
    }
  };

  const handleSubmit = async () => {
    if (preview.length === 0) {
      previewBatch();
      return;
    }
    
    setIsLoading(true);
    try {
      const promises = preview.map(book => createBook(book));
      await Promise.all(promises);
      
      toast.success(`${preview.length} books added successfully`);
      setBatchText('');
      setPreview([]);
      onClose();
    } catch (error) {
      console.error('Error adding batch books:', error);
      toast.error('Failed to add batch books');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel button click - reset states and close modal
  const handleCancel = () => {
    setPreview([]);
    setError('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Add Multiple Books</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        <div className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-gray-700 text-sm md:text-base font-medium mb-2">
              Enter Book Data (One JSON object per line)
            </label>
            <div className="mb-2 p-2 bg-gray-50 rounded text-xs md:text-sm text-gray-600 border border-gray-200">
              <p className="font-medium mb-1">Format each line as a JSON object:</p>
              <p className="mb-1 font-mono overflow-x-auto whitespace-nowrap">&#123; "title": "Book Title", "author": "Author Name", "purchaseCost": 200, "sellingPrice": 300, "weight": 0.5 &#125;</p>
              <p className="text-xs text-gray-500">Required fields: title, purchaseCost, sellingPrice, weight</p>
              <p className="text-xs text-gray-500 mt-1">Optional fields: purchaseDate (defaults to today), author, isbn, genre, format, condition, notes</p>
              <p className="text-xs text-gray-500 mt-1">Date format: "YYYY-MM-DD" (e.g., "2023-07-15")</p>
            </div>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={exampleFormat}
              rows="6"
              className="w-full border border-gray-300 rounded-md p-2 text-sm md:text-base font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
            {error && (
              <div className="mt-2 text-xs md:text-sm text-red-600 whitespace-pre-line bg-red-50 p-2 rounded border border-red-100">
                {error}
              </div>
            )}
          </div>
          
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm md:text-base font-medium text-gray-700 mb-2">Preview ({preview.length} books)</h3>
              <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Title</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Author</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Format</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((book, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">{book.title}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{book.author || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{book.format}</td>
                        <td className="px-3 py-2 whitespace-nowrap">₹{book.purchaseCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={preview.length === 0 ? previewBatch : handleSubmit}
              disabled={isLoading}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
              )}
              <span>{preview.length === 0 ? 'Preview' : 'Add Books'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBatchBooksModal; 