import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserFormModal } from '@/components/users/UserFormModal';

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>(['Company A', 'Company B', 'Company C']);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (refreshNeeded: boolean) => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddUser} className="bg-green-500 hover:bg-green-600">
          Add User
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Administration</h2>
        <p className="mb-4">
          Use this page to create new users for the system. User management is handled through Supabase.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Click "Add User" to create a new user</li>
            <li>Fill in the required information</li>
            <li>The user will be created in Supabase</li>
            <li>For advanced user management, use the Supabase dashboard</li>
          </ul>
        </div>
        
        <Button onClick={handleAddUser} className="bg-green-500 hover:bg-green-600">
          Add User
        </Button>
      </div>

      {/* User form modal */}
      <UserFormModal
        user={null}
        open={isModalOpen}
        onClose={handleCloseModal}
        companies={companies}
      />
    </div>
  );
};

export default UserManagement; 