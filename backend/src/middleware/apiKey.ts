import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== config.apiKey) {
    res.status(403).json({ message: 'Invalid or missing API key' });
    return;
  }

  next();
};
