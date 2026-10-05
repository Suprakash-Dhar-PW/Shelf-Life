import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/api';
import type { CreateMemberRequest } from '../types';
import axios from 'axios';

const AddMember: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateMemberRequest>({
    name: '',
    email: '',
    membershipId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!formData.name.trim()) return setError("Name is required.");
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return setError("A valid email is required.");
    if (!formData.membershipId.trim()) return setError("Membership ID is required.");

    try {
      setLoading(true);
      await memberService.createMember(formData);
      setSuccess("Member created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/members');
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          setError(err.response.data.message || "Email or Membership ID already exists.");
        } else if (err.response.status === 400) {
          setError(err.response.data.message || "Validation error occurred.");
        } else if (err.response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError(err.response.data.message || "An error occurred while creating the member.");
        }
      } else {
        setError("Network or server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Member</h2>
        <p className="text-sm text-slate-500 mt-1">Register a new member into the library system.</p>
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
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label htmlFor="membershipId" className="block text-sm font-semibold text-slate-700 mb-1.5">Membership ID</label>
            <input
              type="text"
              id="membershipId"
              value={formData.membershipId}
              onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[0.99]'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
