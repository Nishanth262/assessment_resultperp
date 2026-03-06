import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { createServer } from 'http';

// Mock the storage layer so we don't hit the real database
vi.mock('../server/storage', () => {
  return {
    storage: {
      getUserByUsername: vi.fn(),
      createUser: vi.fn(),
      getAllUsers: vi.fn().mockResolvedValue([]), // Return empty so first user becomes admin
      getAllTasks: vi.fn(),
      createTask: vi.fn(),
    }
  };
});

describe('API Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);
  });

  it('POST /api/auth/register should create a new user and return a token', async () => {
    // Mock the storage responses
    (storage.getUserByUsername as any).mockResolvedValue(undefined);
    (storage.createUser as any).mockResolvedValue({
      id: 1,
      username: 'newuser',
      password: 'hashedpassword',
      role: 'admin',
      createdAt: new Date()
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id', 1);
    expect(res.body.user).toHaveProperty('username', 'newuser');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('POST /api/auth/register should fail if username exists', async () => {
    // Mock the storage responses
    (storage.getUserByUsername as any).mockResolvedValue({
      id: 1,
      username: 'existinguser',
      password: 'hashedpassword',
      role: 'user'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'existinguser',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username already exists');
  });

  it('POST /api/tasks should fail without authentication', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'My Task',
        status: 'pending'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });
});
