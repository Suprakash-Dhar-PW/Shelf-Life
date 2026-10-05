import React, { useState, useEffect } from 'react';
import { bookService, memberService, borrowService } from '../services/api';
import type { Book, Member } from '../types';

const IssueBook: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [initialLoading, setInitialLoading] = useState(true);

  // Default due date to 14 days from now
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    setDueDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch members and the first page of books (or a specific search to limit payload)
      // Since this is a simple issue page, we just load 100 books for dropdown simplicity, 
      // though typically we'd use a searchable dropdown
      const [booksRes, membersRes] = await Promise.all([
        bookService.getBooks(1, 100, '', ''),
        memberService.getAllMembers()
      ]);
      setBooks(booksRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError('Failed to load books and members for the form.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember || !dueDate) {
      setError('Please fill in all fields.');
      return;
    }

    const selectedDate = new Date(dueDate);
    if (selectedDate <= new Date()) {
      setError('Due date must be in the future.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await borrowService.issueBook(selectedBook, selectedMember, new Date(dueDate).toISOString());
      setSuccess('Book successfully issued!');
      
      // Reset form but keep members/books loaded
      setSelectedBook('');
      setSelectedMember('');
      
      // Refresh available copies in the dropdown without a full reload
      await fetchData();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorRes = (err as { response: { data: { message?: string } } }).response;
        setError(errorRes?.data?.message || 'Failed to issue book');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter out books that have 0 available copies so we don't present invalid choices
  const availableBooks = books.filter(b => b.availableCopies > 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Book</h2>
        <p className="text-sm text-slate-500 mt-1">Assign a book to a registered library member.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-2xl w-full">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6 flex items-start">
            <svg className="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="book" className="block text-sm font-semibold text-slate-700 mb-1.5">Select Book</label>
            <div className="relative">
              <select
                id="book"
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white shadow-sm transition-shadow appearance-none"
                required
              >
                <option value="" disabled>Choose a book...</option>
                {availableBooks.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title} by {book.author} (Available: {book.availableCopies})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {books.length > 0 && availableBooks.length === 0 && (
              <p className="mt-2 text-xs text-red-500 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No books currently available to issue.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="member" className="block text-sm font-semibold text-slate-700 mb-1.5">Select Member</label>
            <div className="relative">
              <select
                id="member"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white shadow-sm transition-shadow appearance-none"
                required
              >
                <option value="" disabled>Choose a member...</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-1.5">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading || availableBooks.length === 0}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                ${loading || availableBooks.length === 0 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[0.99]'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Issuing...
                </>
              ) : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueBook;
