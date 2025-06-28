import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiActivity, FiFilter, FiCalendar, FiTool, FiHeart, FiUser, FiSettings, FiTrendingUp } = FiIcons;

const Activity = () => {
  const { user, trackActivity } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    if (user) {
      trackActivity('activity_viewed');
      loadActivities();
    }
  }, [user, trackActivity]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual API call
      const mockActivities = [
        {
          id: 1,
          activity_type: 'tool_opened',
          tool_used: 'JSON Formatter',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          metadata: {}
        },
        {
          id: 2,
          activity_type: 'tool_favorited',
          tool_used: 'Base64 Encoder',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          metadata: {}
        },
        {
          id: 3,
          activity_type: 'profile_updated',
          tool_used: null,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          metadata: { full_name: 'John Doe', role: 'developer' }
        },
        {
          id: 4,
          activity_type: 'login',
          tool_used: null,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          metadata: {}
        },
        {
          id: 5,
          activity_type: 'tool_opened',
          tool_used: 'Password Generator',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          metadata: {}
        },
        {
          id: 6,
          activity_type: 'dashboard_visit',
          tool_used: null,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          metadata: {}
        },
        {
          id: 7,
          activity_type: 'tool_unfavorited',
          tool_used: 'QR Code Generator',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
          metadata: {}
        },
        {
          id: 8,
          activity_type: 'onboarding_completed',
          tool_used: null,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
          metadata: { role: 'developer', experience: 'intermediate' }
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      'tool_opened': FiTool,
      'tool_favorited': FiHeart,
      'tool_unfavorited': FiIcons.FiHeartOff,
      'login': FiUser,
      'logout': FiIcons.FiLogOut,
      'profile_updated': FiSettings,
      'dashboard_visit': FiIcons.FiHome,
      'onboarding_completed': FiIcons.FiCheckCircle,
      'settings_updated': FiSettings,
      'feedback_submitted': FiIcons.FiMessageCircle,
      'activity_viewed': FiActivity,
      'favorites_viewed': FiHeart,
      'profile_viewed': FiUser
    };
    return iconMap[activityType] || FiActivity;
  };

  const getActivityColor = (activityType) => {
    const colorMap = {
      'tool_opened': 'text-blue-400 bg-blue-500/20',
      'tool_favorited': 'text-red-400 bg-red-500/20',
      'tool_unfavorited': 'text-slate-400 bg-slate-500/20',
      'login': 'text-green-400 bg-green-500/20',
      'logout': 'text-orange-400 bg-orange-500/20',
      'profile_updated': 'text-purple-400 bg-purple-500/20',
      'dashboard_visit': 'text-cyan-400 bg-cyan-500/20',
      'onboarding_completed': 'text-emerald-400 bg-emerald-500/20',
      'settings_updated': 'text-indigo-400 bg-indigo-500/20',
      'feedback_submitted': 'text-pink-400 bg-pink-500/20',
      'activity_viewed': 'text-yellow-400 bg-yellow-500/20',
      'favorites_viewed': 'text-rose-400 bg-rose-500/20',
      'profile_viewed': 'text-violet-400 bg-violet-500/20'
    };
    return colorMap[activityType] || 'text-slate-400 bg-slate-500/20';
  };

  const getActivityDescription = (activity) => {
    const { activity_type, tool_used, metadata } = activity;
    
    switch (activity_type) {
      case 'tool_opened':
        return `Used ${tool_used}`;
      case 'tool_favorited':
        return `Added ${tool_used} to favorites`;
      case 'tool_unfavorited':
        return `Removed ${tool_used} from favorites`;
      case 'login':
        return 'Signed in to account';
      case 'logout':
        return 'Signed out of account';
      case 'profile_updated':
        return 'Updated profile information';
      case 'dashboard_visit':
        return 'Visited dashboard';
      case 'onboarding_completed':
        return 'Completed account setup';
      case 'settings_updated':
        return 'Updated account settings';
      case 'feedback_submitted':
        return 'Submitted feedback';
      case 'activity_viewed':
        return 'Viewed activity history';
      case 'favorites_viewed':
        return 'Viewed favorite tools';
      case 'profile_viewed':
        return 'Viewed profile page';
      default:
        return activity_type.replace(/_/g, ' ');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === filter);
    }

    // Filter by date range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (dateRange) {
      case '1day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        cutoffDate.setFullYear(1970);
        break;
    }

    filtered = filtered.filter(activity => new Date(activity.created_at) >= cutoffDate);

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const filteredActivities = getFilteredActivities();

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'tool_opened', label: 'Tool Usage' },
    { value: 'tool_favorited', label: 'Favorites' },
    { value: 'login', label: 'Authentication' },
    { value: 'profile_updated', label: 'Profile Updates' }
  ];

  const dateRanges = [
    { value: '1day', label: 'Last 24 hours' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: 'all', label: 'All time' }
  ];

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiActivity} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400">Please sign in to view your activity history.</p>
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
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <SafeIcon icon={FiActivity} className="mr-3 text-green-400" />
          Activity History
        </h1>
        <p className="text-slate-400 text-lg">Track your usage and interactions across DevBox Tools</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-white font-medium mb-2">Filter by Type</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-white font-medium mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiTool} className="text-blue-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activities.filter(a => a.activity_type === 'tool_opened').length}
          </h3>
          <p className="text-slate-400 text-sm">Tools Used</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiHeart} className="text-red-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activities.filter(a => a.activity_type === 'tool_favorited').length}
          </h3>
          <p className="text-slate-400 text-sm">Favorites Added</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiUser} className="text-green-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {activities.filter(a => a.activity_type === 'login').length}
          </h3>
          <p className="text-slate-400 text-sm">Sessions</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiTrendingUp} className="text-purple-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{activities.length}</h3>
          <p className="text-slate-400 text-sm">Total Activities</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <p className="text-slate-400 text-sm mt-1">
            {filteredActivities.length} activities found
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading activities...</p>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-4 p-4 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                    <SafeIcon icon={getActivityIcon(activity.activity_type)} className="text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{getActivityDescription(activity)}</p>
                    <p className="text-slate-400 text-sm">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                  <div className="text-slate-500 text-xs">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiActivity} className="text-slate-600 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No activities found</h3>
              <p className="text-slate-500">
                {filter !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your filters to see more activities'
                  : 'Start using tools to see your activity history here'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Activity;