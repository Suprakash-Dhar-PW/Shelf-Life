export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRecord {
  _id: string;
  book: Book | string; // Can be populated Book object or string ID
  member: Member | string; // Can be populated Member object or string ID
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'issued' | 'returned' | 'overdue';
  createdAt?: string;
  updatedAt?: string;
}

export interface Librarian {
  _id: string;
  name: string;
  email: string;
  role: 'librarian';
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  membershipId: string;
}
