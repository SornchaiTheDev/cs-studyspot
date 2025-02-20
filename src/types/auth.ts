export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: 'teacher' | 'student';
  // add any other user fields needed
  //อันนี้เราไม่รู้ว่า OAuth ใช้ฟีลไรบ้าง เติมได้เลยนะคับ แหะๆ
}

export interface AuthResponse {
  user: User;
  token: string;
  // add any other authentication response fields needed
}

export interface AuthError extends Error {
  code?: string;
  // add any other error fields needed
} 