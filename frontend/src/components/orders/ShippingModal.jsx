import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { uploadApi } from '../../services/api';

const ShippingModal = ({ isOpen, onClose, order }) => {
  const { updateOrderShipping } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(order?.trackingImage || null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      trackingId: order?.trackingId || '',
      status: order?.status || 'Pending'
    }
  });
  
  // Watch the trackingId field for immediate access
  const trackingId = watch('trackingId');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      let trackingImageUrl = order?.trackingImage;
      
      // If there's a new image file to upload
      if (uploadFile) {
        setUploadLoading(true);
        try {
          // Upload the image to Google Drive with the tracking ID
          const uploadResult = await uploadApi.uploadToGoogleDrive(uploadFile, data.trackingId);
          
          // Use the direct content URL for image display
          trackingImageUrl = uploadResult.webContentLink;
        } catch (uploadError) {
          console.error('Error uploading image to Google Drive:', uploadError);
          alert('Failed to upload tracking image. Please try again.');
          setIsLoading(false);
          setUploadLoading(false);
          return;
        }
        setUploadLoading(false);
      }
      
      const orderData = {
        trackingId: data.trackingId,
        status: data.status,
        trackingImage: trackingImageUrl
      };
      
      await updateOrderShipping(order._id, orderData);
      onClose();
    } catch (error) {
      console.error('Error updating shipping details:', error);
      alert('Failed to update shipping details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Store the file for upload
    setUploadFile(file);
    
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  if (!isOpen || !order) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Update Shipping Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Customer</label>
            <div className="p-2 bg-gray-50 rounded-md">
              <div className="font-medium">{order.customer?.name}</div>
              <div className="text-sm text-gray-500">{order.customer?.socialHandle}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Tracking ID</label>
            <input
              type="text"
              {...register('trackingId')}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter tracking ID"
            />
            <div className="text-xs text-gray-500 mt-1">
              The tracking ID will also be used for naming the uploaded image file
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Order Status</label>
            <select
              {...register('status')}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Tracking Image</label>
            <div className="border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full focus:outline-none text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">
                Image will be uploaded to Google Drive (Shipping Receipts folder)
              </div>
            </div>
            
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Tracking" 
                  className="h-32 w-auto object-contain border rounded-md"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              disabled={isLoading || uploadLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {(isLoading || uploadLoading) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {uploadLoading ? (
                <span>Uploading...</span>
              ) : isLoading ? (
                <span>Updating...</span>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal; 