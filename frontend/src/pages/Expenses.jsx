import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign, Plus, Filter, Download, Edit, Trash, FileDown, BarChart2, PieChart, Eye, EyeOff, Calendar, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import DeleteExpenseModal from '../components/expenses/DeleteExpenseModal';
import EditExpenseModal from '../components/expenses/EditExpenseModal';
import AddExpenseModal from '../components/expenses/AddExpenseModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define chart colors for consistency
const CHART_COLORS = {
  'Travel':            { bg: 'rgba(255, 99, 132, 0.6)',  tailwind: 'bg-red-100 text-red-800' },
  'Packaging Material': { bg: 'rgba(54, 162, 235, 0.6)',  tailwind: 'bg-blue-100 text-blue-800' },
  'Books':             { bg: 'rgba(153, 102, 255, 0.6)', tailwind: 'bg-purple-100 text-purple-800' },
  'Ads':               { bg: 'rgba(255, 206, 86, 0.6)',  tailwind: 'bg-yellow-100 text-yellow-800' },
  'Tools':             { bg: 'rgba(255, 159, 64, 0.6)',  tailwind: 'bg-orange-100 text-orange-800' },
  'Shipping':          { bg: 'rgba(111, 214, 255, 0.6)', tailwind: 'bg-sky-100 text-sky-800' },
  'Misc':              { bg: 'rgba(75, 192, 192, 0.6)',  tailwind: 'bg-teal-100 text-teal-800' }
};

// Extract just the Tailwind classes for the table display
const CATEGORY_COLORS = Object.fromEntries(
  Object.entries(CHART_COLORS).map(([category, colors]) => [category, colors.tailwind])
);

const Expenses = () => {
  const { 
    expenses, 
    loadingExpenses,
    setLoadingExpenses,
    expenseAnalytics,
    cashInHand,
    expenseCategories,
    paymentModes,
    showGraphs,
    setShowGraphs,
    fetchExpenses,
    fetchExpenseAnalytics,
    fetchCashInHand,
    createExpense,
    updateExpense,
    deleteExpense,
    updateOpeningBalance
  } = useAppContext();
  
  // State for expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showOpeningBalanceForm, setShowOpeningBalanceForm] = useState(false);
  const [expenseData, setExpenseData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: expenseCategories[0],
    amount: '',
    paymentMode: paymentModes[0],
    notes: '',
    reason: ''
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(0);
  
  // State for filters
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    category: '',
    paymentMode: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all');
  
  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });
  
  // Fetch data on initial load
  useEffect(() => {
    fetchExpenses();
    fetchExpenseAnalytics();
    fetchCashInHand();
  }, [fetchExpenses, fetchExpenseAnalytics, fetchCashInHand]);
  
  // Handle input change for expense form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      // Handle category and reason
      if (data.category === 'Misc' && data.reason) {
        data.notes = data.notes ? `${data.reason}: ${data.notes}` : data.reason;
      }
      delete data.reason;
      
      if (editingExpense) {
        await updateExpense(editingExpense._id, data);
        toast.success('Expense updated successfully');
      } else {
        await createExpense(data);
        toast.success('Expense added successfully');
      }
      
      // Reset form
      setEditingExpense(null);
      setShowExpenseForm(false);
      
      // Refresh data
      fetchExpenses();
      fetchExpenseAnalytics();
      fetchCashInHand();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };
  
  // Handle edit expense
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };
  
  // Handle delete expense
  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
      fetchExpenseAnalytics();
      fetchCashInHand();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Handle delete click
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSelectedExpense(null);
  };
  
  // Handle opening balance update
  const handleOpeningBalanceUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateOpeningBalance(Number(openingBalance));
      setShowOpeningBalanceForm(false);
      
      // Refresh data after updating opening balance
      await fetchCashInHand();
      await fetchExpenseAnalytics();
      
      toast.success('Opening balance updated successfully');
    } catch (error) {
      console.error('Error updating opening balance:', error);
      toast.error('Failed to update opening balance: ' + error.message);
    }
  };
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => {
      // If not sorting by this field yet, sort ascending
      if (current.key !== key) {
        return { key, direction: 'asc' };
      }
      
      // If already sorting ascending by this field, toggle to descending
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      
      // If already sorting descending, clear sorting (return to default)
      return { key: null, direction: null };
    });
  };
  
  // Get sort icon for column headers
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="ml-1" /> 
      : <ChevronDown size={14} className="ml-1" />;
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = async () => {
    await fetchExpenses(filter);
    setShowFilters(false);
    // Reset sorting when filters are applied
    setSortConfig({
      key: null,
      direction: null
    });
  };
  
  // Reset filters
  const resetFilters = async () => {
    setFilter({
      startDate: '',
      endDate: '',
      category: '',
      paymentMode: ''
    });
    
    // Reset sorting when filters are reset
    setSortConfig({
      key: null,
      direction: null
    });
    
    await fetchExpenses();
    setShowFilters(false);
  };
  
  // Export expenses as CSV
  const exportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add CSV headers
    csvContent += "Date,Category,Amount,Payment Mode,Notes\n";
    
    // Add expense data rows
    expenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString();
      const row = [
        date,
        expense.category,
        expense.amount,
        expense.paymentMode,
        expense.notes || ""
      ].map(value => `"${value}"`).join(",");
      
      csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Update analytics period
  const updatePeriod = async (period) => {
    setTimePeriod(period);
    setLoadingExpenses(true);
    try {
      await fetchExpenseAnalytics(period);
    } catch (error) {
      console.error('Error updating expense analytics:', error);
    } finally {
      setLoadingExpenses(false);
    }
  };
  
  // Expense category chart data
  const categoryChartData = {
    labels: expenseAnalytics?.categoryBreakdown?.map(item => item.category) || [],
    datasets: [
      {
        data: expenseAnalytics?.categoryBreakdown?.map(item => item.total) || [],
        backgroundColor: expenseAnalytics?.categoryBreakdown?.map(item => 
          CHART_COLORS[item.category]?.bg || 'rgba(199, 199, 199, 0.6)'
        ),
        borderWidth: 1
      }
    ]
  };
  
  // Monthly expenses chart data
  const monthlyChartData = {
    labels: expenseAnalytics?.monthlyBreakdown?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Expenses',
        data: expenseAnalytics?.monthlyBreakdown?.map(item => item.total) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };
  
  const handleOpenBalanceClick = async () => {
    try {
      // Fetch the latest cash in hand to get the opening balance
      const data = await fetchCashInHand();
      setOpeningBalance(data?.openingBalance || 0);
      setShowOpeningBalanceForm(true);
    } catch (error) {
      console.error('Error fetching opening balance:', error);
      setOpeningBalance(0);
      setShowOpeningBalanceForm(true);
    }
  };
  
  // Sort expenses based on current sort config
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Special handling for dates
    if (sortConfig.key === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle nulls/undefined values
    if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    
    // For strings, do case-insensitive comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return (
		<div className='space-y-4 md:space-y-8 pb-4 md:pb-8'>
			{/* Header with actions */}
			<div className='flex flex-col md:flex-row md:justify-between md:items-center gap-3'>
				<h1 className='text-xl md:text-2xl font-bold text-gray-800'>Expense Tracker</h1>

				<div className='flex flex-wrap gap-2'>
					<button
						onClick={handleOpenBalanceClick}
						className='flex items-center cursor-pointer gap-1 bg-indigo-100 text-indigo-700 px-2 py-1.5 md:px-3 md:py-2 text-sm rounded-md hover:bg-indigo-200 transition-colors'
					>
						<DollarSign size={16} />
						<span className="hidden sm:inline">Update Opening Balance</span>
						<span className="sm:hidden">Balance</span>
					</button>

					<button
						onClick={() => setShowFilters(!showFilters)}
						className='flex items-center cursor-pointer gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 md:px-3 md:py-2 text-sm rounded-md hover:bg-gray-200 transition-colors'
					>
						<Filter size={16} />
						<span className="inline">Filter</span>
					</button>

					<button
						onClick={exportCsv}
						className='hidden sm:flex items-center cursor-pointer gap-1 bg-green-100 text-green-700 px-2 py-1.5 md:px-3 md:py-2 text-sm rounded-md hover:bg-green-200 transition-colors'
					>
						<FileDown size={16} />
						<span>Export CSV</span>
					</button>

					<button
						onClick={() => {
							setEditingExpense(null);
							setShowExpenseForm(true);
						}}
						className='flex items-center cursor-pointer gap-1 bg-indigo-600 text-white px-2 py-1.5 md:px-3 md:py-2 text-sm rounded-md hover:bg-indigo-700 transition-colors'
					>
						<Plus size={16} />
						<span>Add Expense</span>
					</button>
				</div>
			</div>

			{/* Cash in Hand */}
			<div className='bg-indigo-50 p-4 md:p-6 rounded-lg shadow-sm'>
				<h2 className='text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2'>
					Cash in Hand
				</h2>
				<div className='text-2xl md:text-3xl font-bold text-indigo-700'>
					₹{cashInHand.toFixed(2)}
				</div>
				<p className='text-xs md:text-sm text-gray-600 mt-1'>
					Total cash received minus total expenses
				</p>
			</div>

			{/* Filter Form */}
			{showFilters && (
				<div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
					<h2 className='text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4'>
						Filter Expenses
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
						<div>
							<label className='block text-xs md:text-sm font-medium text-gray-700 mb-1'>
								Start Date
							</label>
							<input
								type='date'
								name='startDate'
								value={filter.startDate}
								onChange={handleFilterChange}
								className='w-full border rounded-md px-2 py-1.5 md:px-3 md:py-2 text-sm'
							/>
						</div>
						<div>
							<label className='block text-xs md:text-sm font-medium text-gray-700 mb-1'>
								End Date
							</label>
							<input
								type='date'
								name='endDate'
								value={filter.endDate}
								onChange={handleFilterChange}
								className='w-full border rounded-md px-2 py-1.5 md:px-3 md:py-2 text-sm'
							/>
						</div>
						<div>
							<label className='block text-xs md:text-sm font-medium text-gray-700 mb-1'>
								Category
							</label>
							<select
								name='category'
								value={filter.category}
								onChange={handleFilterChange}
								className='w-full border rounded-md px-2 py-1.5 md:px-3 md:py-2 text-sm'
							>
								<option value=''>All Categories</option>
								{expenseCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-xs md:text-sm font-medium text-gray-700 mb-1'>
								Payment Mode
							</label>
							<select
								name='paymentMode'
								value={filter.paymentMode}
								onChange={handleFilterChange}
								className='w-full border rounded-md px-2 py-1.5 md:px-3 md:py-2 text-sm'
							>
								<option value=''>All Payment Modes</option>
								{paymentModes.map((mode) => (
									<option key={mode} value={mode}>
										{mode}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className='flex gap-2 mt-3 md:mt-4'>
						<button
							onClick={applyFilters}
							className='bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-md hover:bg-indigo-700 transition-colors cursor-pointer'
						>
							Apply Filters
						</button>
						<button
							onClick={resetFilters}
							className='bg-gray-200 text-gray-700 px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-md hover:bg-gray-300 transition-colors cursor-pointer'
						>
							Reset
						</button>
					</div>
				</div>
			)}

			{/* Opening Balance Form */}
			{showOpeningBalanceForm && (
				<div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
					<h2 className='text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4'>
						Update Opening Balance
					</h2>
					<form onSubmit={handleOpeningBalanceUpdate}>
						<div className='mb-3 md:mb-4'>
							<label className='block text-xs md:text-sm font-medium text-gray-700 mb-1'>
								Opening Balance Amount
							</label>
							<input
								type='number'
								value={openingBalance}
								onChange={(e) => setOpeningBalance(Number(e.target.value))}
								className='w-full border rounded-md px-2 py-1.5 md:px-3 md:py-2 text-sm'
								placeholder='Enter opening balance amount'
								required
							/>
						</div>
						<div className='flex gap-2'>
							<button
								type='submit'
								className='bg-indigo-600 cursor-pointer text-white px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-md hover:bg-indigo-700 transition-colors'
							>
								Update Balance
							</button>
							<button
								type='button'
								onClick={() => setShowOpeningBalanceForm(false)}
								className='bg-gray-200 text-gray-700 cursor-pointer px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-md hover:bg-gray-300 transition-colors'
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Add/Edit Expense Modal */}
			<AddExpenseModal
				isOpen={showExpenseForm}
				onClose={() => setShowExpenseForm(false)}
				onSubmit={handleSubmit}
				expenseCategories={expenseCategories}
				paymentModes={paymentModes}
				editingExpense={editingExpense}
			/>

			{/* Expense Analytics */}
			<div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
				<div className='flex justify-between items-center mb-3 md:mb-4'>
					<div className='flex items-center gap-2'>
						<h2 className='text-base md:text-lg font-semibold text-gray-800'>
							Expense Analytics
						</h2>
						<button
							onClick={() => setShowGraphs(!showGraphs)}
							className='p-1 md:p-2 text-gray-500 cursor-pointer hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors'
							title={showGraphs ? "Hide graphs" : "Show graphs"}
						>
							{showGraphs ? <EyeOff size={16} className="md:h-[18px] md:w-[18px]" /> : <Eye size={16} className="md:h-[18px] md:w-[18px]" />}
						</button>
					</div>
					<div className='flex'>
						<button
							onClick={() => updatePeriod("month")}
							className={`px-2 py-1 md:px-3 md:py-1 cursor-pointer text-xs md:text-sm rounded-l-md ${
								timePeriod === "month"
									? "bg-indigo-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							Month
						</button>
						<button
							onClick={() => updatePeriod("year")}
							className={`px-2 py-1 md:px-3 md:py-1 cursor-pointer text-xs md:text-sm ${
								timePeriod === "year"
									? "bg-indigo-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							Year
						</button>
						<button
							onClick={() => updatePeriod("all")}
							className={`px-2 py-1 md:px-3 md:py-1 cursor-pointer text-xs md:text-sm rounded-r-md ${
								timePeriod === "all"
									? "bg-indigo-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							All
						</button>
					</div>
				</div>

				{loadingExpenses ? (
					<div className='flex justify-center py-6 md:py-10'>
						<div className='animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-indigo-700'></div>
					</div>
				) : (
					<>
						{/* Summary Stats */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6'>
							<div className='bg-gray-50 p-3 md:p-4 rounded-lg'>
								<p className='text-xs md:text-sm text-gray-600'>Total Expenses</p>
								<p className='text-xl md:text-2xl font-bold text-gray-800'>
									₹{expenseAnalytics?.totalExpenses?.toFixed(2) || "0.00"}
								</p>
							</div>
							<div className='bg-gray-50 p-3 md:p-4 rounded-lg'>
								<p className='text-xs md:text-sm text-gray-600'>Total Revenue</p>
								<p className='text-xl md:text-2xl font-bold text-gray-800'>
									₹{expenseAnalytics?.totalIncome?.toFixed(2) || "0.00"}
								</p>
							</div>
							<div className='bg-gray-50 p-3 md:p-4 rounded-lg'>
								<p className='text-xs md:text-sm text-gray-600'>Net Profit</p>
								<p
									className={`text-xl md:text-2xl font-bold ${
										expenseAnalytics?.netProfit >= 0
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									₹{expenseAnalytics?.netProfit?.toFixed(2) || "0.00"}
								</p>
							</div>
						</div>

						{/* Charts */}
						{showGraphs && (
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
								{/* Category Breakdown */}
								<div>
									<h3 className='text-xs md:text-md font-medium text-gray-700 mb-2 flex items-center'>
										<PieChart size={14} className='mr-1 md:h-[18px] md:w-[18px]' />
										Expenses by Category
									</h3>
									<div className='h-56 md:h-64'>
										{expenseAnalytics?.categoryBreakdown?.length > 0 ? (
											<Pie
												data={categoryChartData}
												options={{
													responsive: true,
													maintainAspectRatio: false,
													plugins: {
														legend: {
															position: "bottom",
														},
													},
												}}
											/>
										) : (
											<div className='h-full flex items-center justify-center'>
												<p className='text-gray-500 text-xs md:text-sm'>
													No expense data available
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Monthly Breakdown */}
								<div>
									<h3 className='text-xs md:text-md font-medium text-gray-700 mb-2 flex items-center'>
										<BarChart2 size={14} className='mr-1 md:h-[18px] md:w-[18px]' />
										Expenses Over Time
									</h3>
									<div className='h-56 md:h-64'>
										{expenseAnalytics?.monthlyBreakdown?.length > 0 ? (
											<Bar
												data={monthlyChartData}
												options={{
													responsive: true,
													maintainAspectRatio: false,
													scales: {
														y: {
															beginAtZero: true,
														},
													},
												}}
											/>
										) : (
											<div className='h-full flex items-center justify-center'>
												<p className='text-gray-500 text-xs md:text-sm'>
													No expense data available
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Expense List */}
			<div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
				<h2 className='text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4'>Expenses</h2>

				{loadingExpenses ? (
					<div className='flex justify-center py-6 md:py-10'>
						<div className='animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-indigo-700'></div>
					</div>
				) : expenses.length > 0 ? (
					<>
						{/* Desktop view */}
						<div className='hidden md:block overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead>
									<tr>
										<th 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                      onClick={() => handleSort('date')}
                    >
											<div className="flex items-center">
                        <span>Date</span>
                        {getSortIcon('date')}
                      </div>
										</th>
										<th 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                      onClick={() => handleSort('category')}
                    >
											<div className="flex items-center">
                        <span>Category</span>
                        {getSortIcon('category')}
                      </div>
										</th>
										<th 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                      onClick={() => handleSort('amount')}
                    >
											<div className="flex items-center">
                        <span>Amount</span>
                        {getSortIcon('amount')}
                      </div>
										</th>
										<th 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                      onClick={() => handleSort('paymentMode')}
                    >
											<div className="flex items-center">
                        <span>Payment Mode</span>
                        {getSortIcon('paymentMode')}
                      </div>
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{sortedExpenses.map((expense) => (
										<tr
											key={expense._id}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{new Date(expense.date).toLocaleDateString()}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${
														CATEGORY_COLORS[expense.category] ||
														"bg-gray-100 text-gray-800"
													}`}
												>
													{expense.category}
												</span>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
												₹{expense.amount.toFixed(2)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{expense.paymentMode}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
												<div className='flex gap-3'>
													<button
														onClick={() => handleEdit(expense)}
														className='text-indigo-600 cursor-pointer hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-50 rounded'
														title='Edit Expense'
													>
														<Edit size={18} />
													</button>
													<button
														onClick={() => handleDeleteClick(expense)}
														className='text-red-600 cursor-pointer hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded'
														title='Delete Expense'
													>
														<Trash size={18} />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						
						{/* Mobile expense cards */}
						<div className='md:hidden divide-y divide-gray-200'>
							{sortedExpenses.map((expense) => (
								<div key={expense._id} className="py-3">
									<div className="flex justify-between items-center mb-1.5">
										<div className="flex items-center gap-2">
											<Calendar size={14} className="text-gray-500" />
											<span className="text-xs text-gray-800">
												{new Date(expense.date).toLocaleDateString()}
											</span>
										</div>
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${
												CATEGORY_COLORS[expense.category] ||
												"bg-gray-100 text-gray-800"
											}`}
										>
											{expense.category}
										</span>
									</div>
									
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm font-semibold text-gray-900">
											₹{expense.amount.toFixed(2)}
										</span>
										<div className="flex items-center gap-1 text-xs text-gray-600">
											<CreditCard size={12} />
											<span>{expense.paymentMode}</span>
										</div>
									</div>
									
									{expense.notes && (
										<p className="text-xs text-gray-500 mb-2 line-clamp-1">{expense.notes}</p>
									)}
									
									<div className="flex gap-2 mt-1">
										<button
											onClick={() => handleEdit(expense)}
											className="text-xs flex items-center gap-1 text-indigo-600 cursor-pointer p-1 hover:bg-indigo-50 rounded"
										>
											<Edit size={14} />
											Edit
										</button>
										<button
											onClick={() => handleDeleteClick(expense)}
											className="text-xs flex items-center gap-1 text-red-600 cursor-pointer p-1 hover:bg-red-50 rounded"
										>
											<Trash size={14} />
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				) : (
					<div className='py-6 md:py-8 text-center'>
						<p className='text-gray-500 text-xs md:text-sm'>
							No expenses found. Add your first expense!
						</p>
					</div>
				)}
			</div>

			{/* Edit Expense Modal */}
			{selectedExpense && (
				<EditExpenseModal
					isOpen={showEditModal}
					onClose={handleModalClose}
					expense={selectedExpense}
				/>
			)}

			{/* Delete Expense Modal */}
			{selectedExpense && (
				<DeleteExpenseModal
					isOpen={showDeleteModal}
					onClose={handleModalClose}
					expense={selectedExpense}
					onDelete={handleDelete}
				/>
			)}
		</div>
	);
};

export default Expenses; 