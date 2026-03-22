import React, { useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import type { UserRole } from '../types';

const emptyForm = {
  name: '',
  email: '',
  role: 'cashier' as UserRole,
  pin: '',
  isActive: true
};

const UsersPage: React.FC = () => {
  const { users, currentUser, createUser, updateUser, deleteUserById } = useAppContext();
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-gray-500">You do not have access to this page.</p>
      </div>
    );
  }

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingUserId(null);
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid';
    }

    if (!editingUserId || formData.pin.trim()) {
      if (!/^\d{4}$/.test(formData.pin)) {
        nextErrors.pin = 'PIN must be a 4-digit number';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, formData);
      } else {
        await createUser(formData);
      }

      setIsAddEditModalOpen(false);
      resetForm();
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to save the user'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUserId) {
      return;
    }

    try {
      await deleteUserById(deletingUserId);
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to delete the user'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">Create staff accounts and control store permissions.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsAddEditModalOpen(true);
          }}
          icon={<UserPlus size={18} />}
        >
          Add User
        </Button>
      </div>

      {errors.form && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'manager'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  {!user.isActive && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setFormData({
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      pin: '',
                      isActive: user.isActive
                    });
                    setEditingUserId(user.id);
                    setIsAddEditModalOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-blue-600"
                >
                  <Edit size={18} />
                </button>

                {currentUser.id !== user.id && (
                  <button
                    onClick={() => {
                      setDeletingUserId(user.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          resetForm();
        }}
        title={editingUserId ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
              onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={currentUser.id === editingUserId}
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {editingUserId && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Account Status</label>
              <select
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, isActive: event.target.value === 'true' }))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={currentUser.id === editingUserId}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {currentUser.id === editingUserId && (
                <p className="mt-1 text-sm text-gray-500">You cannot deactivate or change the role of your own account.</p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {editingUserId ? 'New PIN (optional)' : 'PIN (4 digits)'}
            </label>
            <input
              type="password"
              name="pin"
              value={formData.pin}
              onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
              maxLength={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingUserId ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>

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
            <Button variant="danger" onClick={handleDelete}>
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
