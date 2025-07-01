import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RoleGuard from './RoleGuard';

const { FiUsers, FiSearch, FiFilter, FiEdit3, FiTrash2, FiCheck, FiX, FiShield, FiUserPlus, FiDownload } = FiIcons;

const UserManagement = () => {
  const { user, profile, updateUserRole, updateUserStatus, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadUsers();
  }, [sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .select(`
          id,
          full_name,
          role,
          status,
          experience,
          subscription_tier,
          created_at,
          updated_at,
          last_sign_in_at,
          onboarding_completed
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole, currentRole) => {
    try {
      await updateUserRole(userId, newRole, currentRole);
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating user role: ' + error.message);
    }
  };

  const handleStatusUpdate = async (userId, newStatus, currentStatus) => {
    try {
      await updateUserStatus(userId, newStatus, currentStatus);
      await loadUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating user status: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;

        switch (bulkAction) {
          case 'activate':
            await updateUserStatus(userId, 'active', user.status);
            break;
          case 'deactivate':
            await updateUserStatus(userId, 'inactive', user.status);
            break;
          case 'block':
            await updateUserStatus(userId, 'blocked', user.status);
            break;
          case 'delete':
            await deleteUser(userId);
            break;
        }
      }

      setSelectedUsers([]);
      setBulkAction('');
      await loadUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action: ' + error.message);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Role', 'Status', 'Experience', 'Subscription', 'Created', 'Last Sign In'].join(','),
      ...filteredUsers.map(user => [
        `"${user.full_name || 'Unnamed User'}"`,
        user.role,
        user.status,
        user.experience,
        user.subscription_tier || 'free',
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const roles = [
    { value: 'user', label: 'User', color: 'text-blue-400' },
    { value: 'moderator', label: 'Moderator', color: 'text-purple-400' },
    { value: 'admin', label: 'Admin', color: 'text-red-400' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'text-green-400' },
    { value: 'inactive', label: 'Inactive', color: 'text-yellow-400' },
    { value: 'blocked', label: 'Blocked', color: 'text-red-400' }
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 min-h-screen"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <SafeIcon icon={FiUsers} className="mr-3 text-blue-400" />
            User Management
          </h1>
          <p className="text-slate-400 text-lg">Manage user accounts, roles, and permissions</p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="full_name_asc">Name A-Z</option>
              <option value="full_name_desc">Name Z-A</option>
              <option value="last_sign_in_at_desc">Recently Active</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-white font-medium">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              >
                <option value="">Select action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="block">Block</option>
                <option value="delete">Delete</option>
              </select>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Apply
              </button>
              
              <button
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={exportUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiDownload} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Users</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <span className="text-slate-300 text-sm">Select All</span>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left p-4 text-slate-300 font-medium">Select</th>
                    <th className="text-left p-4 text-slate-300 font-medium">User</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Role</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Subscription</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Joined</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Last Active</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${
                        selectedUsers.includes(user.id) ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        />
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.full_name || 'Unnamed User'}
                            </p>
                            <p className="text-slate-400 text-sm font-mono">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleUpdate(user.id, e.target.value, user.role)}
                          disabled={user.id === profile?.id}
                          className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm disabled:opacity-50"
                        >
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="p-4">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusUpdate(user.id, e.target.value, user.status)}
                          disabled={user.id === profile?.id}
                          className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm disabled:opacity-50"
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                          {user.subscription_tier || 'free'}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-slate-300 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-slate-300 text-sm">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString() 
                            : 'Never'
                          }
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {user.id !== profile?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete user"
                            >
                              <SafeIcon icon={FiTrash2} className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center">
                  <SafeIcon icon={FiUsers} className="text-slate-600 text-4xl mx-auto mb-4" />
                  <p className="text-slate-400">No users found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </RoleGuard>
  );
};

export default UserManagement;