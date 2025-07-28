import { X, AlertTriangle } from 'lucide-react';

const DeleteExpenseModal = ({ isOpen, onClose, expense, onDelete }) => {
  if (!isOpen) return null;

  return (
		<div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
			<div className='m-3 md:m-5 bg-white rounded-lg shadow-xl w-full max-w-md'>
				<div className='flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10'>
					<h2 className='text-lg md:text-xl font-semibold text-gray-800'>
						Confirm Deletion
					</h2>
					<button
						onClick={() => onClose()}
						className='text-gray-400 hover:text-gray-600 cursor-pointer p-1'
					>
						<X size={20} />
					</button>
				</div>

				<div className='p-4 md:p-6'>
					<div className="flex items-start space-x-3 mb-4">
						<div className="bg-red-100 p-2 rounded-full flex-shrink-0">
							<AlertTriangle size={18} className="text-red-600" />
						</div>
						<p className='text-xs md:text-sm text-gray-600'>
							This action cannot be undone. This will permanently delete the
							expense record for{" "}
							<span className='font-semibold'>
								{new Date(expense.date).toLocaleDateString()}
							</span>{" "}
							with amount <span className='font-semibold'>₹{expense.amount}</span>
							.
						</p>
					</div>

					<div className='flex justify-end space-x-2 md:space-x-3 mt-4 md:mt-6'>
						<button
							onClick={() => onClose()}
							className='px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm cursor-pointer border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
						>
							Cancel
						</button>
						<button
							onClick={() => {
								onDelete(expense._id);
								onClose();
							}}
							className='px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DeleteExpenseModal; 