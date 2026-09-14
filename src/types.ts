export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: Role;
}

export interface FundEntry {
  id: number;
  person_name: string;
  year: number;
  amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
