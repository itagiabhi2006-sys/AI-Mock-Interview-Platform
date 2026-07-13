import React, { useEffect, useState } from 'react';
import { Users, Trash2, Power, PowerOff, ShieldAlert } from 'lucide-react';
import api from '../../Api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to toggle deactivation for this user?")) return;
    try {
      await api.put(`/api/admin/users/${id}/deactivate`);
      toast.success('User status toggled successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">View, deactivate, or delete registered users.</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-500" />
          <div className="font-semibold text-gray-800">{users.length} Total Users</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-500 text-sm">{user.id}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.active !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleDeactivate(user.id)}
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title={user.active !== false ? "Deactivate User" : "Activate User"}
                      >
                        {user.active !== false ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
