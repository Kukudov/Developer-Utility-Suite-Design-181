import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { FiActivity, FiFilter, FiCalendar, FiTool, FiHeart, FiUser, FiSettings, FiTrendingUp, FiMoreHorizontal } = FiIcons;

const Activity = () => {
  const { user, trackActivity } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('24hours');
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalActivities: 0,
    toolsUsed: 0,
    favoritesAdded: 0,
    loginSessions: 0
  });

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (user) {
      trackActivity('activity_viewed');
      loadActivities(true); // Reset to first page
    }
  }, [user, trackActivity, filter, dateRange]);

  const getDateRangeStart = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '1hour':
        startDate.setHours(now.getHours() - 1);
        break;
      case '3hours':
        startDate.setHours(now.getHours() - 3);
        break;
      case '12hours':
        startDate.setHours(now.getHours() - 12);
        break;
      case '24hours':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1day':
        startDate.setDate(now.getDate() - 1);
        break;
      case '3days':
        startDate.setDate(now.getDate() - 3);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'all':
        startDate.setFullYear(2020); // Far back date
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }
    
    return startDate;
  };

  const loadActivities = async (reset = false) => {
    if (!user) return;
    
    if (reset) {
      setLoading(true);
      setActivities([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const startDate = getDateRangeStart();
      const offset = reset ? 0 : activities.length;

      // First, get total count for the current filters
      let countQuery = supabase
        .from('user_activity_devbox_2024')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (filter !== 'all') {
        countQuery = countQuery.eq('activity_type', filter);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Then get the actual data
      let query = supabase
        .from('user_activity_devbox_2024')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (filter !== 'all') {
        query = query.eq('activity_type', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading activities:', error);
        if (reset) setActivities([]);
      } else {
        const newActivities = data || [];
        
        if (reset) {
          setActivities(newActivities);
          calculateStats(newActivities);
        } else {
          const updatedActivities = [...activities, ...newActivities];
          setActivities(updatedActivities);
        }

        // Check if there are more activities to load
        setHasMore((offset + newActivities.length) < (count || 0));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      if (reset) setActivities([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreActivities = () => {
    if (!loadingMore && hasMore) {
      loadActivities(false);
    }
  };

  const calculateStats = async (activitiesData) => {
    if (!user) return;

    try {
      const startDate = getDateRangeStart();

      // Get stats for the current date range (not just the displayed activities)
      let statsQuery = supabase
        .from('user_activity_devbox_2024')
        .select('activity_type, tool_used')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (filter !== 'all') {
        statsQuery = statsQuery.eq('activity_type', filter);
      }

      const { data: allActivitiesInRange } = await statsQuery;

      if (allActivitiesInRange) {
        const stats = {
          totalActivities: allActivitiesInRange.length,
          toolsUsed: new Set(allActivitiesInRange.filter(a => a.activity_type === 'tool_opened' && a.tool_used).map(a => a.tool_used)).size,
          favoritesAdded: allActivitiesInRange.filter(a => a.activity_type === 'tool_favorited').length,
          loginSessions: allActivitiesInRange.filter(a => a.activity_type === 'login').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
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
      'profile_viewed': FiUser,
      'ai_chat_viewed': FiIcons.FiMessageSquare,
      'ai_chat_message_sent': FiIcons.FiSend,
      'ai_chat_cleared': FiIcons.FiTrash2,
      'ai_agent_selected': FiIcons.FiBot,
      'openrouter_models_loaded': FiIcons.FiCpu,
      'favorite_tool_clicked': FiIcons.FiExternalLink,
      'snippet_saved': FiIcons.FiCode,
      'cheatsheets_viewed': FiIcons.FiBookOpen,
      'utilities_viewed': FiTool,
      'generators_viewed': FiIcons.FiCpu,
      'converters_viewed': FiIcons.FiRefreshCw
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
      'profile_viewed': 'text-violet-400 bg-violet-500/20',
      'ai_chat_viewed': 'text-blue-400 bg-blue-500/20',
      'ai_chat_message_sent': 'text-green-400 bg-green-500/20',
      'ai_chat_cleared': 'text-red-400 bg-red-500/20',
      'ai_agent_selected': 'text-purple-400 bg-purple-500/20',
      'openrouter_models_loaded': 'text-cyan-400 bg-cyan-500/20',
      'favorite_tool_clicked': 'text-orange-400 bg-orange-500/20',
      'snippet_saved': 'text-teal-400 bg-teal-500/20',
      'cheatsheets_viewed': 'text-amber-400 bg-amber-500/20',
      'utilities_viewed': 'text-blue-400 bg-blue-500/20',
      'generators_viewed': 'text-purple-400 bg-purple-500/20',
      'converters_viewed': 'text-green-400 bg-green-500/20'
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
        return `Submitted feedback: ${metadata?.type || 'general'}`;
      case 'activity_viewed':
        return 'Viewed activity history';
      case 'favorites_viewed':
        return 'Viewed favorite tools';
      case 'profile_viewed':
        return 'Viewed profile page';
      case 'ai_chat_viewed':
        return 'Opened AI Chat Agent';
      case 'ai_chat_message_sent':
        return `Sent message to ${metadata?.agent || 'AI'} agent`;
      case 'ai_chat_cleared':
        return `Cleared ${metadata?.agent || 'AI'} chat session`;
      case 'ai_agent_selected':
        return `Selected ${tool_used} AI agent`;
      case 'openrouter_models_loaded':
        return `Loaded ${metadata?.count || 0} AI models (${metadata?.freeCount || 0} free)`;
      case 'favorite_tool_clicked':
        return `Opened ${tool_used} from favorites`;
      case 'snippet_saved':
        return `Saved code snippet: ${metadata?.title || 'Untitled'}`;
      case 'cheatsheets_viewed':
        return 'Browsed developer cheat sheets';
      case 'utilities_viewed':
        return 'Browsed developer utilities';
      case 'generators_viewed':
        return 'Browsed code generators';
      case 'converters_viewed':
        return 'Browsed data converters';
      default:
        return activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'tool_opened', label: 'Tool Usage' },
    { value: 'tool_favorited', label: 'Favorites Added' },
    { value: 'tool_unfavorited', label: 'Favorites Removed' },
    { value: 'ai_chat_message_sent', label: 'AI Chat Messages' },
    { value: 'login', label: 'Authentication' },
    { value: 'profile_updated', label: 'Profile Updates' },
    { value: 'settings_updated', label: 'Settings Updates' },
    { value: 'feedback_submitted', label: 'Feedback Submitted' }
  ];

  const dateRanges = [
    { value: '1hour', label: 'Last hour' },
    { value: '3hours', label: 'Last 3 hours' },
    { value: '12hours', label: 'Last 12 hours' },
    { value: '24hours', label: 'Last 24 hours' },
    { value: '1day', label: 'Last day' },
    { value: '3days', label: 'Last 3 days' },
    { value: '7days', label: 'Last 7 days' },
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
      className="p-6 min-h-screen max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <SafeIcon icon={FiActivity} className="mr-3 text-green-400" />
          Activity History
        </h1>
        <p className="text-slate-400 text-lg">
          Track your usage and interactions across DevBox Tools
        </p>
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
          <label className="block text-white font-medium mb-2">Time Range</label>
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
            {stats.toolsUsed}
          </h3>
          <p className="text-slate-400 text-sm">Unique Tools Used</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiHeart} className="text-red-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {stats.favoritesAdded}
          </h3>
          <p className="text-slate-400 text-sm">Favorites Added</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiUser} className="text-green-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {stats.loginSessions}
          </h3>
          <p className="text-slate-400 text-sm">Login Sessions</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <SafeIcon icon={FiTrendingUp} className="text-purple-400 text-2xl mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{stats.totalActivities}</h3>
          <p className="text-slate-400 text-sm">Total Activities</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <p className="text-slate-400 text-sm mt-1">
            Showing {activities.length} of {totalCount} activities
            {filter !== 'all' && ` for ${activityTypes.find(t => t.value === filter)?.label}`}
            {dateRange !== 'all' && ` in ${dateRanges.find(r => r.value === dateRange)?.label.toLowerCase()}`}
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-start space-x-4 p-4 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                      <SafeIcon icon={getActivityIcon(activity.activity_type)} className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{getActivityDescription(activity)}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-slate-400 text-sm">{formatTimeAgo(activity.created_at)}</p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="text-slate-500 text-xs">
                            {activity.metadata.agent && (
                              <span className="bg-slate-600/50 px-2 py-1 rounded">
                                Agent: {activity.metadata.agent}
                              </span>
                            )}
                            {activity.metadata.model && (
                              <span className="bg-slate-600/50 px-2 py-1 rounded ml-1">
                                Model: {activity.metadata.model}
                              </span>
                            )}
                            {activity.metadata.type && (
                              <span className="bg-slate-600/50 px-2 py-1 rounded ml-1">
                                Type: {activity.metadata.type}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-slate-500 text-xs">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8 pt-6 border-t border-slate-700">
                  <button
                    onClick={loadMoreActivities}
                    disabled={loadingMore}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiMoreHorizontal} />
                        <span>Load More Activities</span>
                        <span className="text-slate-400 text-sm">
                          ({totalCount - activities.length} remaining)
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-slate-500 text-xs mt-2">
                    Showing {activities.length} of {totalCount} total activities
                  </p>
                </div>
              )}
            </>
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
              {filter !== 'all' || dateRange !== 'all' ? (
                <button
                  onClick={() => {
                    setFilter('all');
                    setDateRange('24hours');
                  }}
                  className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Reset Filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Activity Insights */}
      {activities.length > 0 && (
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Activity Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Most Used Tools</h4>
              <div className="space-y-2">
                {Object.entries(
                  activities
                    .filter(a => a.activity_type === 'tool_opened' && a.tool_used)
                    .reduce((acc, activity) => {
                      acc[activity.tool_used] = (acc[activity.tool_used] || 0) + 1;
                      return acc;
                    }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([tool, count]) => (
                    <div key={tool} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{tool}</span>
                      <span className="text-purple-400">{count} uses</span>
                    </div>
                  ))}
                {Object.keys(activities.filter(a => a.activity_type === 'tool_opened' && a.tool_used)).length === 0 && (
                  <p className="text-slate-500 text-sm">No tools used yet</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Activity Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(
                  activities.reduce((acc, activity) => {
                    const type = activityTypes.find(t => t.value === activity.activity_type)?.label || activity.activity_type;
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="text-blue-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Activity;