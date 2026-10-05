import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { Librarian } from '../src/models/Librarian.js';
import { Book } from '../src/models/Book.js';
import { Member } from '../src/models/Member.js';
import { BorrowRecord } from '../src/models/BorrowRecord.js';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let token = '';
let bookId = '';
let memberId = '';
let borrowId = '';

beforeAll(async () => {
  jest.setTimeout(60000); // Wait for Mongo download
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect via mongoose
  await mongoose.connect(uri);

  // Create Librarian
  const passwordHash = await bcrypt.hash('password123', 10);
  await Librarian.create({
    name: 'Test Librarian',
    email: 'librarian@shelflife.com',
    passwordHash,
    role: 'librarian'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('ShelfLife API Tests', () => {
  
  describe('Authentication', () => {
    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'librarian@shelflife.com', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should succeed login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'librarian@shelflife.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    });

    it('should reject protected route without token', async () => {
      const res = await request(app).post('/api/books').send({});
      expect(res.status).toBe(401);
    });

    it('should reject protected route with invalid token', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', 'Bearer invalidtoken')
        .send({});
      expect(res.status).toBe(401);
    });
  });

  describe('Books API', () => {
    it('should validate missing fields when creating a book', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'A' }); // missing fields
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create a book successfully', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          ISBN: '9780743273565',
          genre: 'Fiction',
          totalCopies: 2
        });
      expect(res.status).toBe(201);
      expect(res.body.data.availableCopies).toBe(2);
      bookId = res.body.data._id;
    });

    it('should reject duplicate ISBN', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Duplicate',
          author: 'Author',
          ISBN: '9780743273565',
          genre: 'Fiction',
          totalCopies: 1
        });
      expect(res.status).toBe(409);
    });

    it('should get books with pagination and filter', async () => {
      const res = await request(app).get('/api/books?genre=Fiction&search=Gatsby&page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('Members API', () => {
    it('should validate missing fields when creating a member', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bob' });
      expect(res.status).toBe(400);
    });

    it('should create a member successfully', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@student.com',
          membershipId: 'STU001'
        });
      expect(res.status).toBe(201);
      memberId = res.body.data._id;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe 2',
          email: 'jane@student.com',
          membershipId: 'STU002'
        });
      expect(res.status).toBe(409);
    });

    it('should reject duplicate membershipId', async () => {
      const res = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe 2',
          email: 'jane2@student.com',
          membershipId: 'STU001'
        });
      expect(res.status).toBe(409);
    });
  });

  describe('Borrowing & Returning API', () => {
    it('should reject invalid member', async () => {
      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId,
          memberId: new mongoose.Types.ObjectId().toString(),
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(404);
    });

    it('should reject invalid book', async () => {
      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId: new mongoose.Types.ObjectId().toString(),
          memberId,
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(409); // 409 No copies available since findOneAndUpdate fails
    });

    it('should issue an available book', async () => {
      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId,
          memberId,
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('issued');
      borrowId = res.body.data._id;
    });

    it('should test concurrency safety against 1 remaining copy', async () => {
      // 1 copy left of The Great Gatsby
      const issueReq = () => request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId,
          memberId,
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });

      const [res1, res2] = await Promise.all([issueReq(), issueReq()]);
      const statuses = [res1.status, res2.status].sort();
      expect(statuses[0]).toBe(201);
      expect(statuses[1]).toBe(409); // Only one can get the last copy
    });

    it('should reject issuing an unavailable book', async () => {
      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookId,
          memberId,
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(409);
    });

    it('should return book successfully', async () => {
      const res = await request(app)
        .post(`/api/return/${borrowId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('returned');
    });

    it('should reject duplicate return', async () => {
      const res = await request(app)
        .post(`/api/return/${borrowId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('should check availableCopies incremented correctly', async () => {
      const book = await Book.findById(bookId);
      expect(book?.availableCopies).toBe(1); // Originally 2, 2 issued, 1 returned -> 1 available
    });
  });

  describe('Member History API', () => {
    it('should fetch member history successfully', async () => {
      const res = await request(app)
        .get(`/api/members/${memberId}/history`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.member.email).toBe('jane@student.com');
      expect(res.body.history.length).toBe(2); // Issued once normally, then issued again during concurrency test
      expect(res.body.history[0].book.title).toBe('The Great Gatsby');
      expect(res.body.history[0].status).toBeDefined();
    });
  });
});
