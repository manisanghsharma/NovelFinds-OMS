import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Filter, Pencil, Trash2, Calculator, Eye, List, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import AddBookModal from '../components/books/AddBookModal';
import EditBookModal from '../components/books/EditBookModal';
import DeleteConfirmModal from '../components/books/DeleteConfirmModal';
import ViewBookModal from '../components/books/ViewBookModal';
import PriceCalculatorModal from '../components/books/PriceCalculatorModal';
import AddBatchBooksModal from '../components/books/AddBatchBooksModal';
// import CameraTestButton from '../components/books/CameraTestButton';


const Inventory = () => {
  const { books, booksPagination, loadingBooks, fetchBooks } = useAppContext();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  useEffect(() => {
    // Reset to first page when search or filters change
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);
  
  useEffect(() => {
    // Fetch books with current filters and pagination
    const fetchBooksWithPagination = async () => {
      setIsChangingPage(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortField,
        sortDirection,
        ...filters
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      await fetchBooks(params);
      setIsChangingPage(false);
    };
    
    fetchBooksWithPagination();
  }, [fetchBooks, currentPage, itemsPerPage, sortField, sortDirection, debouncedSearchTerm, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;z``
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
    });
    setSortField('createdAt'); // Reset sort field
    setSortDirection('desc'); // Reset sort direction
  };

  const handleSort = (key) => {
    setSortField(key);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = (key) => {
    if (sortField !== key) {
      return null;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="ml-1" /> 
      : <ChevronDown size={14} className="ml-1" />;
  };

  const handleEditClick = (e, book) => {
    e.stopPropagation();
    setSelectedBook(book);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (e, book) => {
    e.stopPropagation();
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleViewClick = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };
  
  const handleModalClose = (shouldReload = false) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setShowCalculatorModal(false);
    setShowBatchModal(false);
    setSelectedBook(null);
    if (shouldReload) fetchBooks();
  };
  
  // Helper function to truncate title
  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return '';
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 md:gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCalculatorModal(true)}
            className="bg-gray-100 text-gray-800 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md flex items-center space-x-1 md:space-x-2 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Calculator size={16} className="md:h-5 md:w-5" />
            <span className="hidden sm:inline">Price Calculator</span>
            <span className="sm:hidden">Calculator</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md flex items-center space-x-1 md:space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} className="md:h-5 md:w-5" />
            <span>Add Book</span>
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md flex items-center space-x-1 md:space-x-2 hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <List size={16} className="md:h-5 md:w-5" />
            <span className="hidden xs:inline">Batch Import</span>
            <span className="xs:hidden">Batch</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or ISBN"
              className="block w-full pl-9 pr-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={14} className="text-gray-400" />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md p-1.5 md:p-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="border border-gray-300 rounded-md p-1.5 md:p-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <button
              onClick={resetFilters}
              className="bg-gray-100 px-2 py-1.5 md:px-3 md:py-2 text-sm rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Books List - Mobile View */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
        {loadingBooks || isChangingPage ? (
          <div className="flex justify-center py-6 md:py-8">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-indigo-700"></div>
          </div>
        ) : books && books.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {books.map((book) => (
              <div 
                key={book._id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewClick(book)}
              >
                <div className="mb-1">
                  <div
                    className="text-sm font-medium text-gray-900 hover:underline cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleViewClick(book); }}
                    title={book.title}
                  >
                    {truncateTitle(book.title)}
                  </div>
                  <div className="text-xs text-gray-500">{book.author || 'Unknown author'}</div>
                </div>
                
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-gray-500">
                    {new Date(book.purchaseDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs font-medium text-gray-900">₹{book.purchaseCost}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${
                    book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status === 'available' ? 'Available' : 'Sold'}
                  </span>
                  
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleEditClick(e, book)}
                      className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-1 hover:bg-indigo-50 rounded"
                      title="Edit Book"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, book)}
                      className="text-red-600 hover:text-red-900 cursor-pointer p-1 hover:bg-red-50 rounded"
                      title="Delete Book"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 text-sm">
            {searchTerm || filters.status ? (
              <p>No books match your search criteria</p>
            ) : (
              <p>No books in inventory. Add some books to get started.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Books Table - Desktop View */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
        {loadingBooks || isChangingPage ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        ) : books && books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      <span>Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('author')}
                  >
                    <div className="flex items-center">
                      <span>Author</span>
                      {getSortIcon('author')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('purchaseDate')}
                  >
                    <div className="flex items-center">
                      <span>Purchase Date</span>
                      {getSortIcon('purchaseDate')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('purchaseCost')}
                  >
                    <div className="flex items-center">
                      <span>Cost</span>
                      {getSortIcon('purchaseCost')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr 
                    key={book._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewClick(book)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleViewClick(book); }}
                        title={book.title}
                      >
                        {truncateTitle(book.title)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{book.author || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {new Date(book.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">₹{book.purchaseCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-3">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-1 hover:bg-indigo-50 rounded"
                          onClick={(e) => handleEditClick(e, book)}
                          title="Edit Book"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 cursor-pointer p-1 hover:bg-red-50 rounded"
                          onClick={(e) => handleDeleteClick(e, book)}
                          title="Delete Book"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            {searchTerm || filters.status ? (
              <p>No books match your search criteria</p>
            ) : (
              <p>No books in inventory. Add some books to get started.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {booksPagination && booksPagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= booksPagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, booksPagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{booksPagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, booksPagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (booksPagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= booksPagination.totalPages - 2) {
                    pageNum = booksPagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= booksPagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <AddBookModal isOpen={showAddModal} onClose={(shouldReload) => handleModalClose(shouldReload)} />
      <EditBookModal isOpen={showEditModal} onClose={(shouldReload) => handleModalClose(shouldReload)} book={selectedBook} />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={(shouldReload) => handleModalClose(shouldReload)} book={selectedBook} />
      <PriceCalculatorModal isOpen={showCalculatorModal} onClose={() => handleModalClose(false)} />
      <AddBatchBooksModal isOpen={showBatchModal} onClose={(shouldReload) => handleModalClose(shouldReload)} />
      {selectedBook && <ViewBookModal isOpen={showViewModal} onClose={() => handleModalClose(false)} book={selectedBook} />}
    </div>
  );
};

export default Inventory; 