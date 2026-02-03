import { Request, Response } from 'express';
import { User } from '../models/User.model.js';

interface AuthController {
  login(req: Request, res: Response): Promise<void>;
  register(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  getMe(req: Request, res: Response): Promise<void>;
}

interface ChatController {
  sendMessage(req: Request, res: Response): Promise<void>;
  getHistory(req: Request, res: Response): Promise<void>;
  clearChat(req: Request, res: Response): Promise<void>;
}

export type { AuthController, ChatController };
