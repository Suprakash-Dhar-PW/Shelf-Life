import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book, Pagination, ApiResponse } from '../types';
import { bookService } from '../services/api';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when genre changes
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value);
    setPage(1);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: ApiResponse<Book[]> = await bookService.getBooks(page, 10, genre, debouncedSearch);
      setBooks(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: unknown) {
      setError('Failed to fetch books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, genre, debouncedSearch]);

  const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Mystery', 'History', 'Technology', 'Science'];

  // Define columns for DataTable
  const bookColumns: Column<Book>[] = [
    {
      header: 'Title',
      accessor: (book) => <div className="text-sm font-medium text-gray-900">{book.title}</div>,
    },
    {
      header: 'Author',
      accessor: (book) => <div className="text-sm text-gray-500">{book.author}</div>,
    },
    {
      header: 'Genre',
      accessor: (book) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
          {book.genre}
        </span>
      ),
    },
    {
      header: 'ISBN',
      accessor: (book) => <div className="text-sm text-gray-500">{book.ISBN}</div>,
    },
    {
      header: 'Availability',
      accessor: (book) => (
        <div className="text-sm font-medium text-center">
          <span className={book.availableCopies > 0 ? "text-green-600" : "text-red-600"}>
            {book.availableCopies}
          </span>
          <span className="text-gray-500"> / {book.totalCopies}</span>
        </div>
      ),
      headerClassName: 'text-center',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Library Catalog</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and view all books in the inventory.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <button
            onClick={() => navigate('/books/add')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Book
          </button>
          
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-shadow"
            />
          </div>
          
          <select
            value={genre}
            onChange={handleGenreChange}
            className="pl-3 pr-8 py-2 w-full sm:w-48 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-shadow appearance-none"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-start">
          <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="flex-1">
        <DataTable<Book>
          data={books}
          columns={bookColumns}
          loading={loading}
          keyExtractor={(book) => book._id}
          emptyMessage="No books found matching your criteria."
        />
      </div>

      {/* Pagination Controls */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white border border-slate-100 px-4 py-3 sm:px-6 rounded-xl shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing page <span className="font-medium text-slate-900">{pagination.page}</span> of <span className="font-medium text-slate-900">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium">Prev</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="mr-1 text-sm font-medium">Next</span>
                  <span className="sr-only">Next</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;
