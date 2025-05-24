import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const EditExpenseModal = ({ isOpen, onClose, expense }) => {
  const { expenseCategories, paymentModes, updateExpense, fetchExpenses, fetchExpenseAnalytics, fetchCashInHand } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const [expenseData, setExpenseData] = useState({
    date: '',
    category: '',
    amount: '',
    paymentMode: '',
    notes: '',
    reason: ''
  });
  
  useEffect(() => {
    if (expense) {
      // Pre-fill form
      let reasonValue = '';
      let notesValue = expense.notes || '';
      
      // If the category is Misc, try to extract the reason
      if (expense.category === 'Misc' && expense.notes) {
        const parts = expense.notes.split(': ');
        if (parts.length > 1) {
          reasonValue = parts[0];
          notesValue = parts.slice(1).join(': ');
        }
      }
      
      setExpenseData({
        date: expense.date.split('T')[0],
        category: expense.category,
        amount: expense.amount,
        paymentMode: expense.paymentMode,
        notes: notesValue,
        reason: reasonValue
      });
    }
  }, [expense]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = { ...expenseData };
      
      // Handle category and reason
      if (data.category === 'Misc' && data.reason) {
        data.notes = data.notes ? `${data.reason}: ${data.notes}` : data.reason;
      }
      delete data.reason;
      
      await updateExpense(expense._id, data);
      
      // Refresh data
      await fetchExpenses();
      await fetchExpenseAnalytics();
      await fetchCashInHand();
      
      toast.success('Expense updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white m-5 rounded-lg shadow-xl w-full max-w-2xl'>
				<div className='flex justify-between items-center border-b px-6 py-4'>
					<h2 className='text-xl font-semibold text-gray-800'>Edit Expense</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600 cursor-pointer'
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Date
							</label>
							<input
								type='date'
								name='date'
								value={expenseData.date}
								onChange={handleInputChange}
								className='w-full border rounded-md px-3 py-2'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Category
							</label>
							<select
								name='category'
								value={expenseData.category}
								onChange={handleInputChange}
								className='w-full border rounded-md px-3 py-2'
								required
							>
								{expenseCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
						{expenseData.category === "Misc" && (
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Reason
								</label>
								<input
									type='text'
									name='reason'
									value={expenseData.reason}
									onChange={handleInputChange}
									className='w-full border rounded-md px-3 py-2'
									placeholder='Specify reason for miscellaneous expense'
									required
								/>
							</div>
						)}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Amount
							</label>
							<input
								type='number'
								name='amount'
								value={expenseData.amount}
								onChange={handleInputChange}
								className='w-full border rounded-md px-3 py-2'
								placeholder='Enter amount'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Payment Mode
							</label>
							<select
								name='paymentMode'
								value={expenseData.paymentMode}
								onChange={handleInputChange}
								className='w-full border rounded-md px-3 py-2'
								required
							>
								{paymentModes.map((mode) => (
									<option key={mode} value={mode}>
										{mode}
									</option>
								))}
							</select>
						</div>
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Notes (Optional)
							</label>
							<textarea
								name='notes'
								value={expenseData.notes}
								onChange={handleInputChange}
								className='w-full border rounded-md px-3 py-2'
								placeholder='Enter additional notes'
								rows='3'
							/>
						</div>
					</div>

					<div className='flex justify-end space-x-3 mt-6'>
						<button
							type='button'
							onClick={onClose}
							disabled={isLoading}
							className='px-4 py-2 cursor-pointer border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isLoading}
							className='px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
						>
							{isLoading ? (
								<>
									<Loader2 className='w-4 h-4 animate-spin' />
									Updating...
								</>
							) : (
								"Update Expense"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditExpenseModal; 