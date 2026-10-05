import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import BookList from './pages/BookList';
import MemberList from './pages/MemberList';
import MemberHistory from './pages/MemberHistory';
import IssueBook from './pages/IssueBook';
import AddBook from './pages/AddBook';
import AddMember from './pages/AddMember';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/books" element={<BookList />} />
              <Route path="/books/add" element={<AddBook />} />
              <Route path="/members" element={<MemberList />} />
              <Route path="/members/add" element={<AddMember />} />
              <Route path="/members/:id/history" element={<MemberHistory />} />
              <Route path="/issue" element={<IssueBook />} />
              <Route path="/" element={<Navigate to="/books" replace />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
