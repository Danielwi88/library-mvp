export type Role = "user" | "admin";
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}