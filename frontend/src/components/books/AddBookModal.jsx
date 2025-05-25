import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSearch, FaCamera } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { fetchBookDataByISBN } from '../../utils/isbnLookup';
import { toast } from 'react-hot-toast';

const AddBookModal = ({ isOpen, onClose }) => {
  const { createBook } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const hasBarcodeAPI = useRef('BarcodeDetector' in window);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      genre: '',
      format: 'hardcover',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: '200',
      sellingPrice: '300',
      weight: '',
      condition: 'Good',
      notes: ''
    }
  });
  
  // Watch the ISBN field value
  const isbnValue = watch('isbn');
  // Watch format to update default price
  const formatValue = watch('format');
  
  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);
  
  // Update default price when format changes
  useEffect(() => {
    if (formatValue === 'hardcover') {
      setValue('purchaseCost', '200');
      setValue('sellingPrice', '300');
    } else if (formatValue === 'paperback') {
      setValue('purchaseCost', '80');
      setValue('sellingPrice', '150');
    }
  }, [formatValue, setValue]);
  
  const lookupISBN = async (isbn) => {
    if (!isbn) return;
    
    setIsbnLoading(true);
    setIsbnError('');
    
    try {
      const bookData = await fetchBookDataByISBN(isbn);
      
      // Update form fields with fetched data
      setValue('title', bookData.title);
      setValue('author', bookData.author);
      setValue('genre', bookData.genre);
      
    } catch (error) {
      setIsbnError(error.message);
    } finally {
      setIsbnLoading(false);
    }
  };

  const startScan = async () => {
    setScannerError('');
    
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScannerError("Your browser doesn't support camera access");
      return;
    }
    
    try {
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setVideoStream(stream);
      setScanning(true);

      // Give time for video to initialize
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Use the BarcodeDetector API if available
        if (hasBarcodeAPI.current) {
          const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_39', 'code_128', 'qr_code', 'data_matrix'] });
          
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  // We found a barcode!
                  const barcode = barcodes[0].rawValue;
                  console.log("Found barcode:", barcode);
                  stopScan();
                  setValue('isbn', barcode);
                  lookupISBN(barcode);
                }
              } catch (e) {
                console.error('Barcode detection error:', e);
              }
            }
          }, 500); // Check every half second
        } else {
          setScannerError("Barcode detection not available. Please enter ISBN manually.");
          console.warn("BarcodeDetector API not available");
        }
      }, 1000);
    } catch (error) {
      console.error("Camera permission or initialization error:", error);
      setScannerError("Camera access denied or not available");
      setScanning(false);
    }
  };
  
  const stopScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setScanning(false);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await createBook(data);
      toast.success('Book added successfully');
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1">
      <div className="bg-white m-3 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Add New Book</h2>
          <button
            onClick={() => {
              stopScan();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-3 md:space-y-4">
          {/* ISBN Lookup */}
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">ISBN Lookup</label>
            {scanning ? (
              <div className="space-y-2 md:space-y-3">
                <div className="bg-black rounded overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 md:h-64 object-cover"
                  ></video>
                </div>
                {scannerError && (
                  <p className="mt-1 text-xs md:text-sm text-red-600">{scannerError}</p>
                )}
                <div className="text-center text-xs md:text-sm text-gray-500 mt-1">
                  Point camera at barcode to scan
                </div>
                <button
                  type="button"
                  onClick={stopScan}
                  className="bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded flex items-center space-x-1 md:space-x-2 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <span>Cancel Scan</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    {...register('isbn')}
                    className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter ISBN to auto-fill details"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => lookupISBN(isbnValue)}
                  className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded flex items-center space-x-1 md:space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer"
                  disabled={isbnLoading}
                >
                  {isbnLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSearch size={14} className="md:text-base" />
                  )}
                  <span>Lookup</span>
                </button>
                <button
                  type="button"
                  onClick={startScan}
                  className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded flex items-center space-x-1 md:space-x-2 hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <FaCamera size={14} className="md:text-base" />
                  <span>Scan</span>
                </button>
              </div>
            )}
            {isbnError && (
              <p className="mt-1 text-xs md:text-sm text-red-600">{isbnError}</p>
            )}
          </div>
          
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.title && (
                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('purchaseDate', { required: 'Purchase date is required' })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.purchaseDate && (
                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.purchaseDate.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Format <span className="text-red-500">*</span>
              </label>
              <select
                {...register('format')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="hardcover">Hardcover</option>
                <option value="paperback">Paperback</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Purchase Cost (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('purchaseCost', { 
                  required: 'Purchase cost is required',
                  min: { value: 0, message: 'Cost must be positive' }
                })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.purchaseCost && (
                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.purchaseCost.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('sellingPrice', { 
                  required: 'Selling price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.sellingPrice && (
                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.sellingPrice.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('weight', { 
                  required: 'Weight is required',
                  min: { value: 0, message: 'Weight must be positive' }
                })}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.weight && (
                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>
          
          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Author</label>
              <input
                type="text"
                {...register('author')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Genre</label>
              <input
                type="text"
                {...register('genre')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Condition</label>
              <select
                {...register('condition')}
                className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Acceptable">Acceptable</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm md:text-base mb-1 md:mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows="3"
              className="w-full border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 md:space-x-3 pt-3 md:pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1 md:space-x-2 cursor-pointer"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
              )}
              <span>Add Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal; 