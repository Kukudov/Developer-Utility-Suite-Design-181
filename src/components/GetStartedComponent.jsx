import React from 'react';
import { GetStarted } from '@questlabs/react-sdk';
import questConfig from '../config/questConfig';
import { useAuth } from '../contexts/AuthContext';

const GetStartedComponent = () => {
  const { user } = useAuth();
  
  // Get user ID from auth context or localStorage
  const getUserId = () => {
    if (user?.id) return user.id;
    return localStorage.getItem('userId') || 
           localStorage.getItem('quest_userId') || 
           questConfig.USER_ID;
  };

  return (
    <div className="quest-getstarted-container">
      <GetStarted
        questId={questConfig.GET_STARTED_QUESTID}
        uniqueUserId={getUserId()}
        accent={questConfig.PRIMARY_COLOR}
        autoHide={false}
        style={{
          zIndex: 1000,
          maxWidth: '100%',
          width: '100%'
        }}
      >
        <GetStarted.Header />
        <GetStarted.Progress />
        <GetStarted.Content />
        <GetStarted.Footer />
      </GetStarted>
    </div>
  );
};

export default GetStartedComponent;