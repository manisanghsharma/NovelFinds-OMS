import { X, AlertTriangle } from 'lucide-react';

const DeleteExpenseModal = ({ isOpen, onClose, expense, onDelete }) => {
  if (!isOpen) return null;

  return (
		<div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
			<div className='m-5 bg-white rounded-lg shadow-xl w-full max-w-md'>
				<div className='flex justify-between items-center border-b px-6 py-4'>
					<h2 className='text-xl font-semibold text-gray-800'>
						Confirm Deletion
					</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600 cursor-pointer'
					>
						<X size={20} />
					</button>
				</div>

				<div className='p-6'>
					<p className='text-gray-600 mb-6'>
						This action cannot be undone. This will permanently delete the
						expense record for{" "}
						<span className='font-semibold'>
							{new Date(expense.date).toLocaleDateString()}
						</span>{" "}
						with amount <span className='font-semibold'>₹{expense.amount}</span>
						.
					</p>

					<div className='flex justify-end space-x-3'>
						<button
							onClick={onClose}
							className='px-4 py-2 cursor-pointer border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
						>
							Cancel
						</button>
						<button
							onClick={() => {
								onDelete(expense._id);
								onClose();
							}}
							className='px-4 py-2 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
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