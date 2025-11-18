import jwt from 'jsonwebtoken';
import { IUser } from '../types/user.types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
