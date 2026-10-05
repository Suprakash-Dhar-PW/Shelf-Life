# ShelfLife

ShelfLife is a modern, full-stack College Library Management System. It provides a reliable interface for librarians to catalog books, register members, and manage the complete lifecycle of issuing and returning books, while enforcing rigorous backend validation and concurrency controls.

## Features

- **Authentication:** Secure JWT-based librarian authentication with bcrypt password hashing.
- **Book Management:** Add new books, enforce positive integer constraints, and view the catalog with search, genre filtering, and pagination.
- **Member Management:** Register new members and view active members.
- **Borrowing Workflow:** Issue books to members, preventing double-issues or borrowing beyond available inventory constraints.
- **Return Workflow:** Process book returns dynamically, immediately updating available copies.
- **Member History:** View a complete, paginated, and status-aware log (issued, returned, overdue) of a member's borrowing history.
- **Concurrency Control:** Atomic conditional updates prevent double-checkout race conditions on the final available copy of a book.

## Architecture

The system is decoupled into two primary layers:
1. **Frontend:** A React Single Page Application (SPA) styled with Tailwind CSS, utilizing React Router for navigation and Axios for HTTP requests. It acts as the presentation layer.
2. **Backend:** A Node.js/Express REST API written in TypeScript. It handles business logic, securely hashes passwords, validates requests strictly with Zod, and interacts directly with MongoDB via Mongoose.

## Tech Stack

**Backend:**
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod

**Frontend:**
- React
- TypeScript
- Vite
- React Router
- Axios

## Project Structure

```
ShelfLife/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── controllers/      # Route logic & Zod validation
│   │   ├── middleware/       # JWT auth & error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API route definitions
│   │   ├── scripts/          # Database seeding
│   │   ├── utils/            # JWT & helper functions
│   │   └── server.ts         # App entry point
│   ├── tests/                # Jest API tests
│   └── package.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI (DataTable, etc.)
│   │   ├── context/          # React AuthContext
│   │   ├── layouts/          # App structural layouts
│   │   ├── pages/            # View components
│   │   ├── routes/           # Protected routing logic
│   │   ├── services/         # Axios API clients
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── docs/                     # System design documentation
```

## Prerequisites

- **Node.js**: v18+ recommended.
- **MongoDB**: A running MongoDB instance locally or a MongoDB Atlas cluster URI.

## Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shelflife
PORT=5000
JWT_SECRET=your_secure_random_jwt_secret
JWT_EXPIRES_IN=1d
SEED_LIBRARIAN_PASSWORD=ShelfLife@2026
```

Create a `.env` file in the `frontend/` directory (optional, defaults to port 5000):
```env
VITE_API_URL=http://localhost:5000/api
```

## Running

**1. Seed the Librarian (Backend):**
Before starting, create the initial librarian account:
```bash
cd backend
npm run seed:librarian
```

**2. Start Development Servers:**
In the backend terminal:
```bash
cd backend
npm run dev
```

In the frontend terminal:
```bash
cd frontend
npm run dev
```

## Authentication

The application requires librarian authentication. After running the seed command above, log in at `http://localhost:5173/login` using:
- **Email:** `librarian@shelflife.com`
- **Password:** The value of your `SEED_LIBRARIAN_PASSWORD` (e.g., `ShelfLife@2026`).

---

## API Documentation

### 1. Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  { "email": "librarian@shelflife.com", "password": "password123" }
  ```
- **Response:**
  ```json
  { "success": true, "token": "eyJhb...", "user": { "id": "...", "name": "ShelfLife Librarian", "email": "librarian@shelflife.com", "role": "librarian" } }
  ```
- **Errors:** `401 Unauthorized`, `400 Bad Request`

### 2. Add Book
- **Method:** `POST`
- **URL:** `/api/books`
- **Auth Required:** Yes (Bearer Token)
- **Request Body:**
  ```json
  { "title": "Dune", "author": "Frank Herbert", "ISBN": "9780441172719", "genre": "Sci-Fi", "totalCopies": 5 }
  ```
- **Response:**
  ```json
  { "success": true, "data": { "_id": "60d5ecb8b392...", "title": "Dune", "availableCopies": 5, "totalCopies": 5, ... } }
  ```
- **Errors:** `409 Conflict` (Duplicate ISBN), `400 Bad Request`

### 3. Get Books
- **Method:** `GET`
- **URL:** `/api/books`
- **Auth Required:** Yes
- **Query Parameters:** `page`, `limit`, `genre`, `search`
- **Response:**
  ```json
  {
    "success": true,
    "data": [ { "_id": "...", "title": "Dune", "author": "Frank Herbert", ... } ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### 4. Add Member
- **Method:** `POST`
- **URL:** `/api/members`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  { "name": "John Doe", "email": "john@example.com", "membershipId": "MEM-001" }
  ```
- **Response:**
  ```json
  { "success": true, "data": { "_id": "...", "name": "John Doe", "membershipId": "MEM-001", ... } }
  ```
- **Errors:** `409 Conflict` (Duplicate Email/ID), `400 Bad Request`

### 5. Issue Book
- **Method:** `POST`
- **URL:** `/api/borrow`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  { "bookId": "651f8a8b1c2d3e4f5a6b7c8d", "memberId": "651f8a8b1c2d3e4f5a6b7c8e", "dueDate": "2026-11-01T00:00:00Z" }
  ```
- **Response:**
  ```json
  { "success": true, "data": { "_id": "...", "status": "issued", ... } }
  ```
- **Errors:** `409 Conflict` (Book not available, duplicate active borrow), `404 Not Found`

### 6. Return Book
- **Method:** `POST`
- **URL:** `/api/return/:borrowId`
- **Auth Required:** Yes
- **Response:**
  ```json
  { "success": true, "data": { "_id": "...", "status": "returned", "returnDate": "2026-10-05T...", ... } }
  ```
- **Errors:** `400 Bad Request` (Already returned), `404 Not Found`

### 7. Member History
- **Method:** `GET`
- **URL:** `/api/members/:id/history`
- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "success": true,
    "member": { "_id": "...", "name": "John Doe", ... },
    "history": [ { "_id": "...", "book": { "title": "Dune" }, "status": "issued", ... } ]
  }
  ```

---

## Sample curl Requests

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"librarian@shelflife.com", "password":"ShelfLife@2026"}'
```

*For subsequent requests, export the token:*
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR..."
```

**Add Book:**
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"The Hobbit", "author":"J.R.R. Tolkien", "ISBN":"9780547928227", "genre":"Fantasy", "totalCopies":3}'
```

**Get Books:**
```bash
curl -X GET "http://localhost:5000/api/books?search=Hobbit&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

**Add Member:**
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Alice Smith", "email":"alice@example.com", "membershipId":"MEM-999"}'
```

**Issue Book:**
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bookId":"670123abcd456ef789012345", "memberId":"670123abcd456ef789012346", "dueDate":"2026-11-01T00:00:00.000Z"}'
```

**Return Book:**
```bash
curl -X POST http://localhost:5000/api/return/670123abcd456ef789012347 \
  -H "Authorization: Bearer $TOKEN"
```

**Member History:**
```bash
curl -X GET http://localhost:5000/api/members/670123abcd456ef789012346/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## Concurrency Handling

ShelfLife natively protects against issue-book race conditions (e.g., two users trying to check out the last available copy of a book at the exact same millisecond). 

Instead of reading the `availableCopies` value into application memory and calculating the new value, the system leverages an **Atomic Conditional Update** directly within MongoDB:
```javascript
const updatedBook = await Book.findOneAndUpdate(
  { _id: bookId, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } },
  { new: true }
);
```
Because MongoDB locks the document atomically during the update, the condition `{ availableCopies: { $gt: 0 } }` ensures that only one request can successfully claim the final copy. The subsequent request will fail to match the query and return a graceful `409 Conflict` (Book is not available).

---

## Testing

**Backend API Tests:**
The backend uses Jest and Supertest to execute comprehensive integration tests against the database.
```bash
cd backend
npm run test
```

**Backend Typecheck:**
```bash
cd backend
npm run typecheck
```

**Frontend Build & Typecheck:**
The frontend utilizes `tsc` for rigorous typechecking before running the Vite production build.
```bash
cd frontend
npm run build
```

---

## System Design

For an in-depth view of the system architecture, load balancing, sharding strategies, and Redis caching layers, please refer to the [System Design Document](docs/system-design.md).
