import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiArrowRight, FiHeart } = FiIcons;

const ToolCard = ({ tool, index, onClick }) => {
  const { user, addToFavorites, removeFromFavorites, isFavorite, trackActivity } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFavorited(isFavorite(tool.id));
    }
  }, [user, tool.id, isFavorite]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    
    if (!user) {
      // Could show a login prompt here
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await removeFromFavorites(tool.id);
        setFavorited(false);
      } else {
        await addToFavorites(tool.id, tool.title);
        setFavorited(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      // Could show an error message here
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (user) {
      trackActivity('tool_opened', tool.id);
    }
    onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleCardClick}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer group hover:scale-105 relative"
    >
      {/* Favorite Button */}
      {user && (
        <button
          onClick={handleFavoriteClick}
          disabled={loading}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
            favorited
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-red-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <SafeIcon
            icon={FiHeart}
            className={`text-sm transition-all ${favorited ? 'fill-current scale-110' : ''}`}
          />
        </button>
      )}

      <div
        className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <SafeIcon icon={tool.icon} className="text-white text-xl" />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2 pr-8">{tool.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{tool.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-purple-400 text-sm">Click to use</span>
        <SafeIcon
          icon={FiArrowRight}
          className="text-slate-400 group-hover:text-white transition-colors"
        />
      </div>
    </motion.div>
  );
};

export default ToolCard;