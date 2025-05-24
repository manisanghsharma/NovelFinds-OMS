import { useState } from 'react';
import { FaCamera } from 'react-icons/fa';

const CameraTestButton = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [videoStream, setVideoStream] = useState(null);

  const openCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setVideoStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const closeCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div>
      {showCamera ? (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Camera Test</h3>
              <button 
                onClick={closeCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="bg-black rounded overflow-hidden">
              <video
                id="camera-preview"
                autoPlay
                playsInline
                ref={video => {
                  if (video && videoStream) {
                    video.srcObject = videoStream;
                  }
                }}
                className="w-full h-64 object-cover"
              ></video>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeCamera}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close Camera
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={openCamera}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <FaCamera />
            <span>Test Camera</span>
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CameraTestButton; 