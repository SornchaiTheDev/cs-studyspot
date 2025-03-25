// ตรงนี้เราขอแก้ type หน่อยน้า ตรง AuthResponse, AuthError คิดว่าน่าจะไม่มีเพราะว่าแปะมาใน Cookie หลังจาก login คับ

export interface User {
  id?: string; // Add optional ID for the user
  name: string;
  email: string;
  profileImage: string;
  role?: "teacher" | "student";
  //อันนี้เราไม่รู้ว่า OAuth ใช้ฟีลไรบ้าง เติมได้เลยนะคับ แหะๆ
}
