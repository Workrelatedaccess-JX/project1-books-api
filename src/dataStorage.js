// dataStorage.js act as as an in-memory database for the book collection. 
// It loads the data from books.json at startup and provides functions to query and modify the data.
const fs = require('node:fs');
const path = require('node:path');

// Load books.json ONCE at startup into memory
const booksPath = path.join(__dirname, '..', 'data', 'books.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));

// Give each book a number id + rating field for later edits
books.forEach((book, i) => {
    book.id = i + 1;
    book.rating = null;
});

// Get all books, optionally filtered by query parameters.
const getAllBooks = ({ author, country, year, limit } = {}) => {
    let result = books;

    if (author) result = result.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    if (country) result = result.filter(b => b.country.toLowerCase().includes(country.toLowerCase()));
    if (year) result = result.filter(b => b.year === Number(year));
    if (limit) result = result.slice(0, Number(limit));

    return result;
};

// Find a single book by title, case-insensitive.
const getBookByTitle = (title) => {
    return books.find(b => b.title.toLowerCase() === title.toLowerCase());
};

// Add a new book. Returns { book, created: boolean }.
const addBook = (bookData) => {
    const existing = getBookByTitle(bookData.title);
    if (existing) return { book: existing, created: false };

    const newBook = {
        id: books.length + 1,
        ...bookData,
        rating: null,
    };
    books.push(newBook);
    return { book: newBook, created: true };
};

// Rate a book. Returns updated book or null if not found.
const rateBook = (title, rating) => {
    const book = getBookByTitle(title);
    if (!book) return null;
    book.rating = Number(rating);
    return book;
};

// Get all unique authors and genres, and some stats.
const getAllAuthors = () => [...new Set(books.map(b => b.author))];
const getAllGenres = () => [...new Set(books.flatMap(b => b.genres || []))];
const getStats = () => ({
    totalBooks: books.length,
    averagePages: Math.round(books.reduce((sum, b) => sum + (b.pages || 0), 0) / books.length),
    oldestYear: Math.min(...books.map(b => b.year)),
    newestYear: Math.max(...books.map(b => b.year)),
});

// Export all functions and data
module.exports = {
    books,
    getAllBooks,
    getBookByTitle,
    addBook,
    rateBook,
    getAllAuthors,
    getAllGenres,
    getStats,
};