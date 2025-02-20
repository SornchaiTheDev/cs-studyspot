import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;           
  email: string;
  name: string;
  image?: string;
  role?: 'teacher' | 'student';
  googleId: string;        // ID from Google OAuth
  createdAt: Date;        // Timestamp for user creation
  updatedAt: Date;        // Timestamp for last update
  //อันนี้เราไม่รู้ว่า OAuth ใช้ฟีลไรบ้าง เติมได้เลยนะคับ แหะๆ
}

export interface AuthResponse {
  user: User;
  token: string;
  //add any other authentication response fields needed
}

export interface AuthError extends Error {
  code?: string;
  statusCode?: number;
  // add any other error fields needed
} 