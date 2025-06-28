import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiUser, FiSave, FiEdit3, FiCalendar, FiMail, FiBriefcase, FiTrendingUp, FiSettings } = FiIcons;

const Profile = () => {
  const { user, profile, updateProfile, favorites, trackActivity } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    role: 'developer',
    experience: 'intermediate',
    interests: []
  });

  useEffect(() => {
    if (user) {
      trackActivity('profile_viewed');
    }
  }, [user, trackActivity]);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        role: profile.role || 'developer',
        experience: profile.experience || 'intermediate',
        interests: profile.interests || []
      });
    }
  }, [profile]);

  const roles = [
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Project Manager' },
    { value: 'student', label: 'Student' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'other', label: 'Other' }
  ];

  const experiences = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const availableInterests = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'DevOps',
    'UI/UX Design',
    'Machine Learning',
    'Cybersecurity',
    'Blockchain',
    'Game Development',
    'Cloud Computing'
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(editData);
      await trackActivity('profile_updated', null, editData);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getMemberSince = () => {
    if (profile?.created_at) {
      return new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'Recently';
  };

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-400 text-lg">Manage your account information and preferences</p>
      </div>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <p className="text-green-400 flex items-center">
            <SafeIcon icon={FiIcons.FiCheck} className="mr-2" />
            Profile updated successfully!
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiEdit3} className="text-sm" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-white font-medium mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-slate-300">{profile?.full_name || 'Not set'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2">Email</label>
                <p className="text-slate-300 flex items-center">
                  <SafeIcon icon={FiMail} className="mr-2 text-slate-400" />
                  {user.email}
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-white font-medium mb-2">Role</label>
                {isEditing ? (
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-300 flex items-center">
                    <SafeIcon icon={FiBriefcase} className="mr-2 text-slate-400" />
                    {roles.find(r => r.value === profile?.role)?.label || 'Developer'}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-white font-medium mb-2">Experience Level</label>
                {isEditing ? (
                  <select
                    value={editData.experience}
                    onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {experiences.map(exp => (
                      <option key={exp.value} value={exp.value}>{exp.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-300 flex items-center">
                    <SafeIcon icon={FiTrendingUp} className="mr-2 text-slate-400" />
                    {experiences.find(e => e.value === profile?.experience)?.label || 'Intermediate'}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiSave} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">Interests</h2>
            
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      editData.interests.includes(interest)
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile?.interests || []).length > 0 ? (
                  profile.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No interests selected</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">{getInitials()}</span>
            </div>
            <h3 className="text-white font-semibold text-lg">{profile?.full_name || 'User'}</h3>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <div className="flex items-center justify-center mt-2">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {profile?.subscription_tier || 'Free'} Plan
              </span>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member since</span>
                <span className="text-white">{getMemberSince()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Favorites</span>
                <span className="text-purple-400">{favorites.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="text-green-400">{profile?.subscription_tier || 'Free'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                <SafeIcon icon={FiSettings} className="text-slate-400" />
                <span className="text-slate-300">Account Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                <SafeIcon icon={FiIcons.FiDownload} className="text-slate-400" />
                <span className="text-slate-300">Export Data</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                <SafeIcon icon={FiIcons.FiTrash} className="text-red-400" />
                <span className="text-red-400">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;