import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            // Load profile and favorites in parallel but don't block loading
            Promise.all([
              fetchProfile(session.user.id),
              loadFavorites(session.user.id)
            ]).catch(error => {
              console.error('Error loading user data:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // Don't block the auth state change - load data asynchronously
          Promise.all([
            fetchProfile(session.user.id),
            loadFavorites(session.user.id)
          ]).catch(error => {
            console.error('Error loading user data after auth change:', error);
          });
        } else {
          setProfile(null);
          setFavorites([]);
        }

        // Always set loading to false after auth state change
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          await createProfile(userId);
        } else {
          // For other errors, set a default profile to prevent blocking
          setProfile({
            id: userId,
            full_name: '',
            role: 'user', // Default role
            status: 'active', // Default status
            experience: 'beginner',
            interests: [],
            preferences: {},
            onboarding_completed: false,
            created_at: new Date().toISOString()
          });
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Set a default profile to prevent blocking
      setProfile({
        id: userId,
        full_name: '',
        role: 'user',
        status: 'active',
        experience: 'beginner',
        interests: [],
        preferences: {},
        onboarding_completed: false,
        created_at: new Date().toISOString()
      });
    }
  };

  const loadFavorites = async (userId) => {
    try {
      console.log('Loading favorites for user:', userId);
      const { data, error } = await supabase
        .from('user_favorites_devbox_2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } else {
        console.log('Favorites loaded successfully:', data?.length || 0);
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Error in loadFavorites:', error);
      setFavorites([]);
    }
  };

  const createProfile = async (userId) => {
    try {
      console.log('Creating profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .insert({
          id: userId,
          full_name: '',
          role: 'user',
          status: 'active',
          experience: 'beginner',
          interests: [],
          preferences: {},
          onboarding_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // Set a default profile even if creation fails
        setProfile({
          id: userId,
          full_name: '',
          role: 'user',
          status: 'active',
          experience: 'beginner',
          interests: [],
          preferences: {},
          onboarding_completed: false,
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      // Set a default profile even if creation fails
      setProfile({
        id: userId,
        full_name: '',
        role: 'user',
        status: 'active',
        experience: 'beginner',
        interests: [],
        preferences: {},
        onboarding_completed: false,
        created_at: new Date().toISOString()
      });
    }
  };

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || '',
          avatar_url: userData.avatarUrl || ''
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Track login activity (don't await to avoid blocking)
    if (data.user) {
      trackActivity('login').catch(console.error);
    }

    return data;
  };

  const signOut = async () => {
    try {
      await trackActivity('logout');
    } catch (error) {
      console.error('Error tracking logout activity:', error);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating profile with:', updates);

    // Validate role and experience values
    const validRoles = ['user', 'moderator', 'admin'];
    const validExperiences = ['beginner', 'intermediate', 'advanced'];
    const validStatuses = ['active', 'inactive', 'blocked'];

    if (updates.role && !validRoles.includes(updates.role)) {
      updates.role = 'user';
    }
    if (updates.experience && !validExperiences.includes(updates.experience)) {
      updates.experience = 'beginner';
    }
    if (updates.status && !validStatuses.includes(updates.status)) {
      updates.status = 'active';
    }

    const { data, error } = await supabase
      .from('profiles_devbox_2024')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }

    console.log('Profile updated successfully:', data);
    setProfile(data);
    return data;
  };

  const completeOnboarding = async (onboardingData) => {
    if (!user) throw new Error('No user logged in');

    console.log('Completing onboarding with data:', onboardingData);

    const roleMapping = {
      'developer': 'user',
      'designer': 'user',
      'manager': 'user',
      'student': 'user',
      'freelancer': 'user',
      'other': 'user'
    };

    const updates = {
      full_name: onboardingData.fullName || '',
      role: roleMapping[onboardingData.role] || 'user',
      experience: onboardingData.experience || 'beginner',
      interests: onboardingData.interests || [],
      preferences: onboardingData.preferences || {},
      onboarding_completed: true
    };

    console.log('Profile updates to apply:', updates);

    try {
      await updateProfile(updates);
      // Don't await activity tracking to avoid blocking
      trackActivity('onboarding_completed', null, onboardingData).catch(console.error);
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error in completeOnboarding:', error);
      throw error;
    }
  };

  const trackActivity = async (activityType, toolUsed = null, metadata = {}) => {
    if (!user) return;

    try {
      await supabase.from('user_activity_devbox_2024').insert({
        user_id: user.id,
        activity_type: activityType,
        tool_used: toolUsed,
        metadata
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  // Admin functions
  const updateUserRole = async (targetUserId, newRole, currentUserRole) => {
    if (!user || !profile) throw new Error('No user logged in');
    if (profile.role !== 'admin') throw new Error('Only admins can change user roles');

    try {
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      await trackActivity('user_role_updated', null, {
        target_user_id: targetUserId,
        old_role: currentUserRole,
        new_role: newRole,
        admin_action: true
      });

      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserStatus = async (targetUserId, newStatus, currentStatus) => {
    if (!user || !profile) throw new Error('No user logged in');
    if (!['admin', 'moderator'].includes(profile.role)) {
      throw new Error('Only admins and moderators can change user status');
    }

    try {
      const { data, error } = await supabase
        .from('profiles_devbox_2024')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) throw error;

      // Log admin activity
      await trackActivity('user_status_updated', null, {
        target_user_id: targetUserId,
        old_status: currentStatus,
        new_status: newStatus,
        admin_action: true
      });

      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  const deleteUser = async (targetUserId) => {
    if (!user || !profile) throw new Error('No user logged in');
    if (profile.role !== 'admin') throw new Error('Only admins can delete users');
    if (targetUserId === user.id) throw new Error('Cannot delete your own account');

    try {
      // Delete user profile and related data
      const { error } = await supabase
        .from('profiles_devbox_2024')
        .delete()
        .eq('id', targetUserId);

      if (error) throw error;

      // Log admin activity
      await trackActivity('user_deleted', null, {
        target_user_id: targetUserId,
        admin_action: true
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Check user permissions
  const hasPermission = (permission) => {
    if (!profile) return false;

    const rolePermissions = {
      admin: [
        'tools.use', 'favorites.manage', 'profile.edit', 'activity.view',
        'users.view', 'content.moderate', 'reports.view',
        'users.manage', 'users.delete', 'roles.assign', 'system.settings',
        'analytics.view', 'database.access'
      ],
      moderator: [
        'tools.use', 'favorites.manage', 'profile.edit', 'activity.view',
        'users.view', 'content.moderate', 'reports.view'
      ],
      user: [
        'tools.use', 'favorites.manage', 'profile.edit', 'activity.view'
      ]
    };

    const userPermissions = rolePermissions[profile.role] || rolePermissions.user;
    return userPermissions.includes(permission);
  };

  const addToFavorites = async (toolId, toolName) => {
    if (!user) throw new Error('No user logged in');

    // Check if already favorited
    const isAlreadyFavorite = favorites.some(fav => fav.tool_id === toolId);
    if (isAlreadyFavorite) {
      throw new Error('Tool already in favorites');
    }

    const { data, error } = await supabase
      .from('user_favorites_devbox_2024')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        tool_name: toolName
      })
      .select()
      .single();

    if (error) throw error;

    // Update local favorites state
    setFavorites(prev => [data, ...prev]);

    // Don't await activity tracking to avoid blocking
    trackActivity('tool_favorited', toolId).catch(console.error);

    return data;
  };

  const removeFromFavorites = async (toolId) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_favorites_devbox_2024')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (error) throw error;

    // Update local favorites state
    setFavorites(prev => prev.filter(fav => fav.tool_id !== toolId));

    // Don't await activity tracking to avoid blocking
    trackActivity('tool_unfavorited', toolId).catch(console.error);
  };

  const getFavorites = async () => {
    if (!user) return [];
    return favorites;
  };

  const isFavorite = (toolId) => {
    return favorites.some(fav => fav.tool_id === toolId);
  };

  const saveSnippet = async (snippet) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('saved_snippets_devbox_2024')
      .insert({
        user_id: user.id,
        ...snippet
      })
      .select()
      .single();

    if (error) throw error;

    // Don't await activity tracking to avoid blocking
    trackActivity('snippet_saved', null, { title: snippet.title }).catch(console.error);

    return data;
  };

  const getSnippets = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_snippets_devbox_2024')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const updateUserSettings = async (settings) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating user settings:', settings);

    // Prepare the settings object with only OpenRouter API key
    const settingsToSave = {
      user_id: user.id,
      theme: settings.theme,
      openrouter_api_key: settings.openrouter_api_key || '',
      updated_at: new Date().toISOString()
    };

    console.log('Settings to save to database:', settingsToSave);

    try {
      // First, try to get existing settings
      const { data: existingSettings } = await supabase
        .from('user_settings_devbox_2024')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let data, error;

      if (existingSettings) {
        // Update existing settings
        console.log('Updating existing settings for user:', user.id);
        const result = await supabase
          .from('user_settings_devbox_2024')
          .update(settingsToSave)
          .eq('user_id', user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new settings
        console.log('Creating new settings for user:', user.id);
        const result = await supabase
          .from('user_settings_devbox_2024')
          .insert(settingsToSave)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Settings update/insert error:', error);
        throw error;
      }

      console.log('Settings saved successfully:', data);

      // Don't await activity tracking to avoid blocking
      trackActivity('settings_updated', null, settings).catch(console.error);

      return data;
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      throw error;
    }
  };

  const getUserSettings = async () => {
    if (!user) return null;

    console.log('Getting user settings for user:', user.id);

    const { data, error } = await supabase
      .from('user_settings_devbox_2024')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user settings:', error);
      return null;
    }

    console.log('User settings retrieved:', data);
    return data;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    favorites,
    signUp,
    signIn,
    signOut,
    updateProfile,
    completeOnboarding,
    trackActivity,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    isFavorite,
    saveSnippet,
    getSnippets,
    updateUserSettings,
    getUserSettings,
    // Admin functions
    updateUserRole,
    updateUserStatus,
    deleteUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};