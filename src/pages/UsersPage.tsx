import React, { useState } from 'react';
import { Edit, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
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
  const activeUsers = users.filter((user) => user.isActive).length;
  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-slate-900 text-white',
    manager: 'bg-emerald-100 text-emerald-800',
    cashier: 'bg-sky-100 text-sky-800'
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ShieldCheck size={24} />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Restricted area</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Only administrators can manage staff accounts, permissions, and account status.
          </p>
        </Card>
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
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Access control</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Manage your store staff.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Create accounts, assign roles, and control whether staff can access the register workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total staff</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{users.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active accounts</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {errors.form && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <div className="flex justify-end">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id} className="rounded-[1.5rem]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold uppercase text-slate-700">
                    {user.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">{user.name}</h3>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${roleStyles[user.role]}`}>
                    {user.role}
                  </span>
                  {!user.isActive && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Inactive
                    </span>
                  )}
                  {currentUser.id === user.id && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      Current account
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <Button
                  variant="secondary"
                  size="sm"
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
                  icon={<Edit size={16} />}
                >
                  Edit
                </Button>

                {currentUser.id !== user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingUserId(user.id);
                      setIsDeleteModalOpen(true);
                    }}
                    icon={<Trash2 size={16} />}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </Button>
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
          {errors.form && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
            placeholder="John Doe"
            error={errors.name}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
            placeholder="john@example.com"
            error={errors.email}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              disabled={currentUser.id === editingUserId}
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {editingUserId && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Account Status</label>
              <select
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, isActive: event.target.value === 'true' }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                disabled={currentUser.id === editingUserId}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {currentUser.id === editingUserId && (
                <p className="mt-2 text-sm text-slate-500">You cannot deactivate or change the role of your own account.</p>
              )}
            </div>
          )}

          <Input
            label={editingUserId ? 'New PIN (optional)' : 'PIN (4 digits)'}
            type="password"
            name="pin"
            value={formData.pin}
            onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            error={errors.pin}
          />

          <div className="flex justify-end gap-2 pt-2">
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
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default UsersPage;
