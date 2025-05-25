import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Filter, Pencil, Trash2, Calculator, Eye } from 'lucide-react';
import AddBookModal from '../components/books/AddBookModal';
import EditBookModal from '../components/books/EditBookModal';
import DeleteConfirmModal from '../components/books/DeleteConfirmModal';
import ViewBookModal from '../components/books/ViewBookModal';
import PriceCalculatorModal from '../components/books/PriceCalculatorModal';
// import CameraTestButton from '../components/books/CameraTestButton';


const Inventory = () => {
  const { books, loadingBooks, fetchBooks } = useAppContext();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
  });
  const [filteredBooks, setFilteredBooks] = useState([]);
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  useEffect(() => {
    // Filter books based on search term and filters
    if (!books) return;
    
    let filtered = [...books];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        book => 
          book.title.toLowerCase().includes(term) || 
          (book.author && book.author.toLowerCase().includes(term)) ||
          (book.isbn && book.isbn.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(book => book.status === filters.status);
    }
    
    setFilteredBooks(filtered);
  }, [books, searchTerm, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
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
  
  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setShowCalculatorModal(false);
    setSelectedBook(null);
    fetchBooks(); // Refresh the books list
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 md:gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-2 md:space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400 md:h-4 md:w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or ISBN"
              className="block w-full pl-9 pr-3 py-1.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-gray-400 md:h-4 md:w-4" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="flex-1 border border-gray-300 rounded-md p-1.5 md:p-2 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            
            <button
              onClick={resetFilters}
              className="bg-gray-100 px-3 py-1.5 md:px-3 md:py-2 text-sm md:text-base rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Books List - Mobile View */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
        {loadingBooks ? (
          <div className="flex justify-center py-6 md:py-8">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-indigo-700"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBooks.map((book) => (
              <div 
                key={book._id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewClick(book)}
              >
                <div className="mb-1">
                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
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
        {loadingBooks ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr 
                    key={book._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewClick(book)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
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
      
      {/* Modals */}
      <AddBookModal isOpen={showAddModal} onClose={handleModalClose} />
      <EditBookModal isOpen={showEditModal} onClose={handleModalClose} book={selectedBook} />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={handleModalClose} book={selectedBook} />
      <PriceCalculatorModal isOpen={showCalculatorModal} onClose={handleModalClose} />
      {selectedBook && <ViewBookModal isOpen={showViewModal} onClose={handleModalClose} book={selectedBook} />}
    </div>
  );
};

export default Inventory; 