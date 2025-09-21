export type Role = "USER" | "ADMIN";
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}