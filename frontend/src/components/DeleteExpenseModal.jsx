import { X } from 'lucide-react';

const DeleteExpenseModal = ({ isOpen, onClose, onConfirm, expense }) => {
  if (!expense || !isOpen) return null;

  return (
    <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
      <div className='bg-white m-5 rounded-lg shadow-xl w-full max-w-md'>
        <div className='flex justify-between items-center border-b px-6 py-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Delete Expense</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 cursor-pointer'
          >
            <X size={20} />
          </button>
        </div>
        
        <div className='p-6'>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the expense "{expense.description}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal; 