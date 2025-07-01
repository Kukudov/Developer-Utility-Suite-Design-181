import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const { FiUsers, FiShield, FiActivity, FiSettings, FiSearch, FiFilter, FiEdit3, FiTrash2, FiUserPlus, FiCheck, FiX } = FiIcons;

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    blockedUsers: 0
  });

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadUsers();
      loadStats();
    }
  }, [user, profile]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .select(`
          *,
          auth.users(email, created_at, last_sign_in_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .select('role, status');

      if (error) throw error;

      const stats = {
        totalUsers: data.length,
        activeUsers: data.filter(u => u.status === 'active').length,
        adminUsers: data.filter(u => u.role === 'admin').length,
        blockedUsers: data.filter(u => u.status === 'blocked').length
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles_devbox_2024')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      await loadStats();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles_devbox_2024')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      await loadStats();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles_devbox_2024')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Delete related data
      await Promise.all([
        supabase.from('user_favorites_devbox_2024').delete().eq('user_id', userId),
        supabase.from('user_activity_devbox_2024').delete().eq('user_id', userId),
        supabase.from('user_settings_devbox_2024').delete().eq('user_id', userId)
      ]);

      await loadUsers();
      await loadStats();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  // Check if current user is admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiShield} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <SafeIcon icon={FiShield} className="mr-3 text-red-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 text-lg">Manage users, roles, and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <SafeIcon icon={FiUsers} className="text-blue-400 text-2xl" />
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <SafeIcon icon={FiCheck} className="text-green-400 text-2xl" />
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Admins</p>
              <p className="text-3xl font-bold text-white">{stats.adminUsers}</p>
            </div>
            <SafeIcon icon={FiShield} className="text-red-400 text-2xl" />
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Blocked</p>
              <p className="text-3xl font-bold text-white">{stats.blockedUsers}</p>
            </div>
            <SafeIcon icon={FiX} className="text-orange-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
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
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Showing {filteredUsers.length} of {users.length} users
          </p>
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
                  <th className="text-left p-4 text-slate-300 font-medium">User</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Role</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Status</th>
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
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        >
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          roles.find(r => r.value === user.role)?.color || 'text-slate-400'
                        } bg-slate-700/50`}>
                          {roles.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statuses.find(s => s.value === user.status)?.color || 'text-slate-400'
                      } bg-slate-700/50`}>
                        {statuses.find(s => s.value === user.status)?.label || user.status || 'Active'}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <span className="text-slate-300 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <span className="text-slate-300 text-sm">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit role"
                        >
                          <SafeIcon icon={FiEdit3} className="text-sm" />
                        </button>
                        
                        <button
                          onClick={() => updateUserStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked')}
                          className={`p-2 transition-colors ${
                            user.status === 'blocked' 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-orange-400 hover:text-orange-300'
                          }`}
                          title={user.status === 'blocked' ? 'Unblock user' : 'Block user'}
                        >
                          <SafeIcon icon={user.status === 'blocked' ? FiCheck : FiX} className="text-sm" />
                        </button>
                        
                        {user.id !== profile?.id && (
                          <button
                            onClick={() => deleteUser(user.id)}
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
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="p-8 text-center">
            <SafeIcon icon={FiUsers} className="text-slate-600 text-4xl mx-auto mb-4" />
            <p className="text-slate-400">No users found matching your filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;