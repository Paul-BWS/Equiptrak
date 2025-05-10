export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'customer';
  company_id: string;
  created_at: string;
  updated_at: string;
} 