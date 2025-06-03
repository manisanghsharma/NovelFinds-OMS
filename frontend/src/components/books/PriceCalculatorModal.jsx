import { useState, useEffect, useRef } from 'react';
import { X, Calculator, ShoppingBag, Download } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import html2canvas from 'html2canvas';

const PriceCalculatorModal = ({ isOpen, onClose }) => {
  const { availableBooks, fetchAvailableBooks } = useAppContext();
  
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [totalBookPrice, setTotalBookPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [error, setError] = useState(null);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  
  // Refs to capture for image
  const contentRef = useRef(null);
  
  // Fetch available books when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableBooks();
      setSelectedBooks([]);
      setError(null);
    }
  }, [isOpen, fetchAvailableBooks]);
  
  // Calculate shipping cost and totals
  useEffect(() => {
    if (selectedBooks.length === 0) {
      setShippingCost(0);
      setTotalWeight(0);
      setTotalBookPrice(0);
      setTotalPrice(0);
      return;
    }
    
    // Calculate total weight
    const weightSum = selectedBooks.reduce((sum, book) => sum + book.weight, 0);
    setTotalWeight(weightSum);
    
    // Calculate total book price
    const bookPriceSum = selectedBooks.reduce((sum, book) => sum + (book.sellingPrice || 0), 0);
    setTotalBookPrice(bookPriceSum);
    
    // Calculate shipping cost based on weight in kg
    const calculateShippingCost = (weightKg) => {
      if (isNaN(weightKg) || weightKg <= 0) return 0;
      const weightGrams = weightKg * 1000;
      if (weightGrams <= 500) return 42;
      const extraWeight = weightGrams - 500;
      const increments = Math.ceil(extraWeight / 500);
      return 42 + increments * 19;
    };
    
    const calculatedShippingCost = calculateShippingCost(weightSum);
    setShippingCost(calculatedShippingCost);
    
    // Calculate total price
    setTotalPrice(bookPriceSum + calculatedShippingCost);
  }, [selectedBooks]);
  
  // Handle book selection
  const handleBookSelect = (book) => {
    if (selectedBooks.find(b => b._id === book._id)) {
      setSelectedBooks(selectedBooks.filter(b => b._id !== book._id));
    } else {
      setSelectedBooks([...selectedBooks, book]);
    }
  };
  
  // Clear selections
  const handleClear = () => {
    setSelectedBooks([]);
    setError(null);
  };

  // Generate canvas for image
  const generateCanvas = async () => {
    if (!contentRef.current || selectedBooks.length === 0) {
      throw new Error('No content to capture');
    }

    // Get the HTML element to convert
    const contentElement = contentRef.current;
    
    const canvas = await html2canvas(contentElement, {
      scale: 4, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        // Find and remove the headings marked for removal
        const elementsToRemove = clonedElement.querySelectorAll('.pdf-remove-heading');
        elementsToRemove.forEach(el => el.remove());
        
        // Find all elements with text-indigo-600 class and replace with inline style
        clonedElement.querySelectorAll(".text-indigo-600").forEach((el) => {
          el.classList.remove("text-indigo-600");
          el.style.color = "#4f46e5";
        });
      }
    });

    return canvas;
  };
  
  // Handle download as image
  const handleDownloadImage = async () => {
    setIsGeneratingFile(true);
    setError(null);
    
    try {
      // Create a current date string for the filename
      const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
      const filename = `NovelFinds-Quote-${dateStr}.png`;
      
      const canvas = await generateCanvas();
      
      // Convert canvas to a high-quality PNG
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = imgData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setIsGeneratingFile(false);
    }
  };
  
  // Alphabetically sorted and filtered books
  const filteredBooks = availableBooks
    .filter(book => {
      const term = bookSearchTerm.toLowerCase();
      return (
        book.title.toLowerCase().includes(term) ||
        (book.author && book.author.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  
  if (!isOpen) return null;
  
  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
      <div className='bg-white m-4 rounded-lg shadow-xl w-full max-w-full md:max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center border-b px-3 md:px-6 py-3 md:py-4'>
          <h2 className='text-lg md:text-xl font-semibold text-gray-800 flex items-center'>
            <Calculator size={16} className='mr-2' />
            Price Calculator
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        <div className='p-3 md:p-6 space-y-4 md:space-y-6'>
          {/* Book Selection */}
          <div className='border-b pb-4'>
            <h3 className='text-base md:text-lg font-medium text-gray-800 mb-3 md:mb-4'>
              Select Books
            </h3>
            {/* Book Search Bar */}
            <div className="mb-2">
              <input
                type="text"
                value={bookSearchTerm}
                onChange={e => setBookSearchTerm(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-xs md:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {filteredBooks.length > 0 ? (
              <div className='space-y-3 md:space-y-4'>
                <div className='max-h-48 md:max-h-60 overflow-y-auto border rounded-md'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50 sticky top-0'>
                      <tr>
                        <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Select
                        </th>
                        <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Title
                        </th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Price
                        </th>
                        <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredBooks.map((book) => (
                        <tr
                          key={book._id}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedBooks.find((b) => b._id === book._id)
                              ? "bg-indigo-50"
                              : ""
                          }`}
                          onClick={() => handleBookSelect(book)}
                        >
                          <td className='px-2 md:px-4 py-2'>
                            <input
                              type='checkbox'
                              checked={selectedBooks.some(
                                (b) => b._id === book._id
                              )}
                              onChange={() => {}}
                              className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                            />
                          </td>
                          <td className='px-2 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-900'>
                            {book.title}
                          </td>
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-gray-500">{book.author || '-'}</td>
                          <td className='px-2 md:px-4 py-2 text-xs md:text-sm text-gray-500'>
                            ₹{book.sellingPrice || 0}
                          </td>
                          <td className='px-2 md:px-4 py-2 text-xs md:text-sm text-gray-500'>
                            {book.weight} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='text-center py-4 text-gray-500'>
                No books found.
              </div>
            )}
          </div>

          {/* Content Area */}
          <div ref={contentRef}>
            {selectedBooks.length > 0 && (
              <>
                {/* Selected Books */}
                <div className='space-y-3 md:space-y-4'>
                  <h3 className='text-base md:text-lg font-medium pdf-remove-heading' style={{ color: '#1f2937' }}>
                    Selected Books
                  </h3>

                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y' style={{ borderColor: '#e5e7eb' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th className='px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider' style={{ color: '#6b7280' }}>
                            Book
                          </th>
                          <th className='px-2 md:px-4 py-2 md:py-3 text-right text-xs font-medium uppercase tracking-wider' style={{ color: '#6b7280' }}>
                            Cost
                          </th>
                          <th className='px-2 md:px-4 py-2 md:py-3 text-right text-xs font-medium uppercase tracking-wider' style={{ color: '#6b7280' }}>
                            Weight
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y' style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        {selectedBooks.map((book) => (
                          <tr key={book._id}>
                            <td className='px-2 md:px-4 py-2 md:py-3 whitespace-nowrap'>
                              <div className='flex items-start space-x-2'>
                                <ShoppingBag
                                  size={14}
                                  className="text-indigo-600 mt-1"
                                  style={{ color: '#4f46e5', marginTop: '0.25rem' }}
                                />
                                <div>
                                  <div className="text-xs md:text-sm" style={{ fontWeight: '500', color: '#111827' }}>
                                    {book.title || "Untitled"}
                                  </div>
                                  <div className="text-xs md:text-sm" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {book.author || "Unknown author"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right' style={{ color: '#111827' }}>
                              ₹{book.sellingPrice || 0}
                            </td>
                            <td className='px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right' style={{ color: '#6b7280' }}>
                              {book.weight} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <td className='px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm' style={{ fontWeight: '500' }}>
                            Total ({selectedBooks.length}{" "}
                            {selectedBooks.length === 1 ? "book" : "books"})
                          </td>
                          <td className='px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right' style={{ fontWeight: '500' }}>
                            ₹{totalBookPrice}
                          </td>
                          <td className='px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right'>
                            {totalWeight.toFixed(2)} kg
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Price Summary */}
                <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem', marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Price Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#374151' }}>Books Cost:</span>
                      <span style={{ color: '#374151' }}>₹{totalBookPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#374151' }}>Shipping Cost:</span>
                      <span style={{ color: '#374151' }}>₹{shippingCost.toFixed(2)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: '0.5rem', 
                      borderTop: '1px solid #e5e7eb', 
                      fontWeight: 'bold'
                    }}>
                      <span style={{ color: '#374151' }}>Total Price:</span>
                      <span style={{ color: '#4f46e5' }}>
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Error message if image generation failed */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end space-x-2 md:space-x-3 pt-3 md:pt-4 border-t'>
            <button
              type='button'
              onClick={handleClear}
              className='px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
            >
              Clear
            </button>
            
            {selectedBooks.length > 0 && (
              <button
                type='button'
                onClick={handleDownloadImage}
                disabled={isGeneratingFile || selectedBooks.length === 0}
                className='px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer flex items-center space-x-1 md:space-x-2 disabled:bg-green-300'
              >
                {isGeneratingFile ? (
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                <span>Download</span>
              </button>
            )}
            
            <button
              type='button'
              onClick={onClose}
              className='px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculatorModal; 