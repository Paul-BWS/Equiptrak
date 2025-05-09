interface UserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  company_name?: string;
  telephone?: string;
  contact_id?: string;
  company_id?: string;
}

export async function createUser(userData: UserData): Promise<any> {
  try {
    console.log('Creating user:', userData);
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}