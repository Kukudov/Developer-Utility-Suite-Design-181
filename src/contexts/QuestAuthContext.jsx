import React, { createContext, useContext, useState, useEffect } from 'react';

const QuestAuthContext = createContext({});

export const useQuestAuth = () => {
  const context = useContext(QuestAuthContext);
  if (!context) {
    throw new Error('useQuestAuth must be used within a QuestAuthProvider');
  }
  return context;
};

export const QuestAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const storedUserId = localStorage.getItem('quest_userId');
    const storedToken = localStorage.getItem('quest_token');
    const storedOnboarding = localStorage.getItem('quest_onboarded');

    if (storedUserId && storedToken) {
      setIsAuthenticated(true);
      setUser({
        userId: storedUserId,
        token: storedToken
      });
      setIsOnboarded(storedOnboarding === 'true');
    }
    
    setLoading(false);
  }, []);

  const login = ({ userId, token, newUser }) => {
    localStorage.setItem('quest_userId', userId);
    localStorage.setItem('quest_token', token);
    
    setUser({ userId, token });
    setIsAuthenticated(true);
    
    if (newUser) {
      setIsOnboarded(false);
      localStorage.setItem('quest_onboarded', 'false');
    } else {
      setIsOnboarded(true);
      localStorage.setItem('quest_onboarded', 'true');
    }
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('quest_onboarded', 'true');
  };

  const logout = () => {
    localStorage.removeItem('quest_userId');
    localStorage.removeItem('quest_token');
    localStorage.removeItem('quest_onboarded');
    
    setUser(null);
    setIsAuthenticated(false);
    setIsOnboarded(false);
  };

  const value = {
    isAuthenticated,
    user,
    isOnboarded,
    loading,
    login,
    logout,
    completeOnboarding
  };

  return (
    <QuestAuthContext.Provider value={value}>
      {children}
    </QuestAuthContext.Provider>
  );
};