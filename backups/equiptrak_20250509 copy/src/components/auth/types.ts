export interface LoginFormProps {
  isCustomer: boolean;
  isSignUp: boolean;
  onToggleSignUp: () => void;
}

export interface AuthFormState {
  email: string;
  password: string;
  company?: string;
}