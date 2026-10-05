import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Member } from '../types';
import { memberService } from '../services/api';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await memberService.getAllMembers();
        setMembers(res.data || []);
      } catch (err) {
        setError('Failed to fetch members.');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const columns: Column<Member>[] = [
    {
      header: 'Name',
      accessor: (member) => <div className="text-sm font-medium text-gray-900">{member.name}</div>,
    },
    {
      header: 'Email',
      accessor: (member) => <div className="text-sm text-gray-500">{member.email}</div>,
    },
    {
      header: 'Membership ID',
      accessor: (member) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {member.membershipId}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (member) => (
        <button 
          onClick={() => navigate(`/members/${member._id}/history`)}
          className="text-sm text-blue-600 hover:text-blue-900 font-medium transition-colors"
        >
          View History &rarr;
        </button>
      ),
    }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Members</h2>
          <p className="text-sm text-slate-500 mt-1">Manage library members and their borrowing history.</p>
        </div>
        
        <button
          onClick={() => navigate('/members/add')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
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
        <DataTable<Member>
          data={members}
          columns={columns}
          loading={loading}
          keyExtractor={(member) => member._id}
          emptyMessage="No members found."
        />
      </div>
    </div>
  );
};

export default MemberList;
