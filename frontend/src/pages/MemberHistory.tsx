import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BorrowRecord, Member } from '../types';
import { memberService, borrowService } from '../services/api';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import axios from 'axios';

const MemberHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await memberService.getMemberHistory(id);
        setMember(res.member);
        setHistory(res.history);
      } catch (err) {
        setError('Failed to fetch member history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  const handleReturnBook = async (recordId: string) => {
    try {
      setActionLoading(recordId);
      setError(null);
      setSuccess(null);
      
      const res = await borrowService.returnBook(recordId);
      const updatedRecord = res.data;
      
      setHistory(prev => prev.map(rec => rec._id === recordId ? {
        ...rec, 
        returnDate: updatedRecord.returnDate,
        status: updatedRecord.status
      } : rec));
      
      setSuccess('Book returned successfully.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to return book.');
      } else {
        setError('Network error occurred while returning book.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<BorrowRecord>[] = [
    {
      header: 'Book Title',
      accessor: (record) => {
        // Book is populated
        const book = record.book as any;
        return <div className="text-sm font-medium text-gray-900">{book?.title || 'Unknown Book'}</div>;
      },
    },
    {
      header: 'Issue Date',
      accessor: (record) => (
        <div className="text-sm text-gray-500">
          {new Date(record.issueDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: (record) => (
        <div className="text-sm text-gray-500">
          {new Date(record.dueDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Return Date',
      accessor: (record) => (
        <div className="text-sm text-gray-500">
          {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (record) => {
        const isOverdue = !record.returnDate && new Date(record.dueDate) < new Date();
        const displayStatus = isOverdue ? 'overdue' : record.status;
        
        let badgeColor = 'bg-gray-100 text-gray-800'; // default
        if (displayStatus === 'returned') badgeColor = 'bg-green-100 text-green-800';
        else if (displayStatus === 'issued') badgeColor = 'bg-blue-100 text-blue-800';
        else if (displayStatus === 'overdue') badgeColor = 'bg-red-100 text-red-800 font-bold border border-red-200 shadow-sm';

        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${badgeColor}`}>
            {displayStatus}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: (record) => {
        const isOverdue = !record.returnDate && new Date(record.dueDate) < new Date();
        const isActive = !record.returnDate || record.status === 'issued' || isOverdue;
        
        if (!isActive) {
          return <span className="text-sm text-gray-400 italic">Returned</span>;
        }
        
        const isProcessing = actionLoading === record._id;
        
        return (
          <button
            onClick={() => handleReturnBook(record._id)}
            disabled={isProcessing}
            className={`text-sm font-medium transition-colors ${
              isProcessing 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-900'
            }`}
          >
            {isProcessing ? 'Returning...' : 'Return Book'}
          </button>
        );
      },
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/members')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1.5 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Members
        </button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Member Profile
        </h2>
      </div>

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

      {member && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-blue-50 rounded-bl-full z-0 opacity-50"></div>
          
          <div className="flex items-center gap-5 z-10 relative">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner border border-blue-200">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Name</p>
              <p className="text-xl font-bold text-slate-900">{member.name}</p>
            </div>
          </div>
          <div className="z-10 relative">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
            <p className="text-base text-slate-700">{member.email}</p>
          </div>
          <div className="z-10 relative">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Membership ID</p>
            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
              {member.membershipId}
            </span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Borrowing History</h3>
      
      <div className="flex-1">
        <DataTable<BorrowRecord>
          data={history}
          columns={columns}
          keyExtractor={(record) => record._id}
          emptyMessage="This member has no borrowing history."
        />
      </div>
    </div>
  );
};

export default MemberHistory;
