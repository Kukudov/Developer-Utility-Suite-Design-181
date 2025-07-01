import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HIERARCHY = {
  user: 0,
  moderator: 1,
  admin: 2
};

const PERMISSIONS = {
  // Basic user permissions
  'tools.use': ['user', 'moderator', 'admin'],
  'favorites.manage': ['user', 'moderator', 'admin'],
  'profile.edit': ['user', 'moderator', 'admin'],
  'activity.view': ['user', 'moderator', 'admin'],
  
  // Moderator permissions
  'users.view': ['moderator', 'admin'],
  'content.moderate': ['moderator', 'admin'],
  'reports.view': ['moderator', 'admin'],
  
  // Admin permissions
  'users.manage': ['admin'],
  'users.delete': ['admin'],
  'roles.assign': ['admin'],
  'system.settings': ['admin'],
  'analytics.view': ['admin'],
  'database.access': ['admin']
};

export const usePermissions = () => {
  const { user, profile } = useAuth();

  const permissions = useMemo(() => {
    const userRole = profile?.role || 'user';
    
    const hasPermission = (permission) => {
      const allowedRoles = PERMISSIONS[permission];
      return allowedRoles ? allowedRoles.includes(userRole) : false;
    };

    const hasRole = (role) => {
      return userRole === role;
    };

    const hasMinimumRole = (minimumRole) => {
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
      return userLevel >= requiredLevel;
    };

    const canAccess = (requiredRoles) => {
      if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
      }
      return requiredRoles.includes(userRole);
    };

    const getAccessLevel = () => {
      return ROLE_HIERARCHY[userRole] || 0;
    };

    return {
      userRole,
      hasPermission,
      hasRole,
      hasMinimumRole,
      canAccess,
      getAccessLevel,
      isUser: userRole === 'user',
      isModerator: userRole === 'moderator',
      isAdmin: userRole === 'admin',
      isAuthenticated: !!user
    };
  }, [user, profile]);

  return permissions;
};

export default usePermissions;