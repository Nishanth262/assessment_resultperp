import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAuth, requireAdmin, generateToken, type AuthRequest } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // AUTH
  app.post(api.auth.register.path, async (req: Request, res: Response) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const isFirstUser = (await storage.getAllUsers()).length === 0;
      const role = isFirstUser ? "admin" : "user";
      
      const user = await storage.createUser({
        username: input.username,
        password: hashedPassword,
        role
      });
      
      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ token, user: userWithoutPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req: Request, res: Response) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({ token, user: userWithoutPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // USERS
  app.get(api.users.me.path, requireAuth, async (req: AuthRequest, res: Response) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });

  app.get(api.users.list.path, requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    const users = await storage.getAllUsers();
    const usersWithoutPassword = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.status(200).json(usersWithoutPassword);
  });

  app.delete(api.users.delete.path, requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const user = await storage.getUser(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await storage.deleteUser(id);
    res.status(204).send();
  });

  // TASKS
  app.get(api.tasks.list.path, requireAuth, async (req: AuthRequest, res: Response) => {
    if (req.user!.role === 'admin') {
      const tasks = await storage.getAllTasks();
      return res.status(200).json(tasks);
    } else {
      const tasks = await storage.getTasksByUserId(req.user!.id);
      return res.status(200).json(tasks);
    }
  });

  app.post(api.tasks.create.path, requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({
        ...input,
        userId: req.user!.id
      });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.tasks.update.path, requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const task = await storage.getTask(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      
      if (task.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Not your task" });
      }

      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(id, input);
      res.status(200).json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.tasks.delete.path, requireAuth, async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const task = await storage.getTask(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    if (task.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Not your task" });
    }
    
    await storage.deleteTask(id);
    res.status(204).send();
  });

  return httpServer;
}
