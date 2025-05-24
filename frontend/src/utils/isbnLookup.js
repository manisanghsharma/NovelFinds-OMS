// Utility function to fetch book data from ISBN using Open Library API
export const fetchBookDataByISBN = async (isbn) => {
  try {
    // Clean ISBN (remove hyphens, spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    // Fetch from Open Library API
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
    const data = await response.json();
    
    // Check if book was found
    const bookKey = `ISBN:${cleanIsbn}`;
    if (!data[bookKey]) {
      throw new Error('Book not found');
    }
    
    const bookData = data[bookKey];
    
    // Extract relevant information
    return {
      title: bookData.title || '',
      author: bookData.authors ? bookData.authors[0]?.name || '' : '',
      isbn: cleanIsbn,
      genre: bookData.subjects ? bookData.subjects[0]?.name || '' : '',
      // We don't get weight, purchase cost, or condition from API - these need manual input
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    throw new Error('Failed to fetch book data. Please enter details manually.');
  }
};