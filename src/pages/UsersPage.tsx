import React, { useState } from 'react';
import { Users, UserPlus, Edit, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const UsersPage: React.FC = () => {
  const { users, currentUser } = useAppContext();
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'cashier',
    pin: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleOpenEditModal = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        pin: userToEdit.pin,
      });
      setEditingUserId(userId);
      setIsAddEditModalOpen(true);
    }
  };
  
  const handleOpenDeleteModal = (userId: string) => {
    setDeletingUserId(userId);
    setIsDeleteModalOpen(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.pin.trim()) {
      newErrors.pin = 'PIN is required';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be a 4-digit number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Here we would typically make an API call to save the user
    // For this demo, we'll just simulate updating the local state
    
    alert(`User ${editingUserId ? 'updated' : 'added'} successfully!`);
    setIsAddEditModalOpen(false);
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      role: 'cashier',
      pin: '',
    });
  };
  
  const handleDelete = () => {
    // Here we would typically make an API call to delete the user
    // For this demo, we'll just simulate removing from the local state
    
    alert('User deleted successfully!');
    setIsDeleteModalOpen(false);
    setDeletingUserId(null);
  };
  
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-gray-500 dark:text-gray-400">You don't have access to this page</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              role: 'cashier',
              pin: '',
            });
            setEditingUserId(null);
            setIsAddEditModalOpen(true);
          }}
          icon={<UserPlus size={18} />}
        >
          Add User
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} className="overflow-hidden">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleOpenEditModal(user.id)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                >
                  <Edit size={18} />
                </button>
                
                {currentUser?.id !== user.id && (
                  <button
                    onClick={() => handleOpenDeleteModal(user.id)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingUserId(null);
        }}
        title={editingUserId ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">PIN (4 digits)</label>
            <input
              type="password"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              maxLength={4}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              placeholder="Enter 4-digit PIN"
            />
            {errors.pin && <p className="mt-1 text-sm text-red-600">{errors.pin}</p>}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddEditModalOpen(false);
                setEditingUserId(null);
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
            >
              {editingUserId ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUserId(null);
        }}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default UsersPage;