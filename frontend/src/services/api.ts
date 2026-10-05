import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

export const bookService = {
  getBooks: async (page = 1, limit = 10, genre = '', search = '') => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (genre) params.append('genre', genre);
    if (search) params.append('search', search);

    const response = await api.get(`/books?${params.toString()}`);
    return response.data;
  },
  createBook: async (bookData: { title: string; author: string; ISBN: string; genre: string; totalCopies: number; }) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
};

export const memberService = {
  getAllMembers: async () => {
    const response = await api.get('/members');
    return response.data;
  },
  getMemberHistory: async (id: string) => {
    const response = await api.get(`/members/${id}/history`);
    return response.data;
  },
  createMember: async (memberData: { name: string; email: string; membershipId: string; }) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },
};

export const borrowService = {
  issueBook: async (bookId: string, memberId: string, dueDate: string) => {
    const response = await api.post('/borrow', { bookId, memberId, dueDate });
    return response.data;
  },
  returnBook: async (borrowId: string) => {
    const response = await api.post(`/return/${borrowId}`);
    return response.data;
  },
};

export default api;
