import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, requireAuth, requireAdmin } from '../server/auth';
import { Request, Response } from 'express';

// Setup environment variables before tests
beforeEach(() => {
  process.env.SESSION_SECRET = 'test_secret_key';
});

describe('Auth Utilities', () => {
  it('generateToken should return a valid JWT', () => {
    const user = { id: 1, username: 'testuser', role: 'user' };
    const token = generateToken(user);
    
    expect(typeof token).toBe('string');
    
    const decoded: any = jwt.decode(token);
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('testuser');
    expect(decoded.role).toBe('user');
  });

  it('requireAuth should call next() for valid Authorization header', () => {
    const user = { id: 1, username: 'testuser', role: 'user' };
    const token = generateToken(user);
    
    const req = {
      headers: { authorization: `Bearer ${token}` }
    } as any;
    
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    
    const next = vi.fn();
    
    requireAuth(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(1);
  });

  it('requireAuth should return 401 if token is missing', () => {
    const req = { headers: {} } as any;
    
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    
    const next = vi.fn();
    
    requireAuth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAdmin should call next() if user is admin', () => {
    const req = { user: { id: 1, username: 'admin', role: 'admin' } } as any;
    const res = {} as any;
    const next = vi.fn();
    
    requireAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  it('requireAdmin should return 403 if user is not admin', () => {
    const req = { user: { id: 2, username: 'user', role: 'user' } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();
    
    requireAdmin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });
});
