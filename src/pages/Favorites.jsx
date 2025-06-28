import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiHeart, FiSearch, FiFilter, FiExternalLink, FiTrash2, FiGrid, FiList } = FiIcons;

const Favorites = () => {
  const { user, favorites, removeFromFavorites, trackActivity } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (user) {
      trackActivity('favorites_viewed');
    }
  }, [user, trackActivity]);

  // Tool mapping for navigation
  const toolRoutes = {
    'JSON Formatter': '/utilities',
    'Base64 Encoder': '/utilities',
    'Base64 Encoder/Decoder': '/utilities',
    'URL Encoder': '/utilities',
    'URL Encoder/Decoder': '/utilities',
    'Hash Generator': '/utilities',
    'QR Code Generator': '/utilities',
    'Text Diff Checker': '/utilities',
    'Regex Tester': '/utilities',
    'Image Optimizer': '/utilities',
    'SQL Formatter': '/utilities',
    'HTML Formatter': '/utilities',
    'Password Generator': '/generators',
    'UUID Generator': '/generators',
    'Color Palette Generator': '/generators',
    'Lorem Ipsum Generator': '/generators',
    'Unit Converter': '/converters',
    'Timestamp Converter': '/converters',
    'Number Base Converter': '/converters',
    'CSS Unit Converter': '/converters'
  };

  const getToolIcon = (toolName) => {
    const iconMap = {
      'JSON Formatter': FiIcons.FiCode,
      'Base64 Encoder': FiIcons.FiLock,
      'Base64 Encoder/Decoder': FiIcons.FiLock,
      'URL Encoder': FiIcons.FiLink,
      'URL Encoder/Decoder': FiIcons.FiLink,
      'Hash Generator': FiIcons.FiShield,
      'QR Code Generator': FiIcons.FiSquare,
      'Text Diff Checker': FiIcons.FiGitCommit,
      'Regex Tester': FiIcons.FiSearch,
      'Image Optimizer': FiIcons.FiImage,
      'SQL Formatter': FiIcons.FiDatabase,
      'HTML Formatter': FiIcons.FiCode,
      'Password Generator': FiIcons.FiLock,
      'UUID Generator': FiIcons.FiHash,
      'Color Palette Generator': FiIcons.FiDroplet,
      'Lorem Ipsum Generator': FiIcons.FiType,
      'Unit Converter': FiIcons.FiRefreshCw,
      'Timestamp Converter': FiIcons.FiClock,
      'Number Base Converter': FiIcons.FiHash,
      'CSS Unit Converter': FiIcons.FiMonitor
    };
    return iconMap[toolName] || FiIcons.FiTool;
  };

  const getToolColor = (index) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-yellow-500 to-orange-500',
      'from-cyan-500 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  const filteredFavorites = favorites.filter(favorite =>
    favorite.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToolClick = async (favorite) => {
    const route = toolRoutes[favorite.tool_name] || '/utilities';
    await trackActivity('favorite_tool_clicked', favorite.tool_name);
    navigate(route);
  };

  const handleRemoveFavorite = async (favoriteId, toolName) => {
    setRemoving(favoriteId);
    try {
      await removeFromFavorites(toolName);
      await trackActivity('tool_unfavorited', toolName);
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemoving(null);
    }
  };

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiHeart} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400">Please sign in to view your favorites.</p>
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
          <SafeIcon icon={FiHeart} className="mr-3 text-red-400" />
          Your Favorites
        </h1>
        <p className="text-slate-400 text-lg">
          {favorites.length > 0 
            ? `${favorites.length} favorite tool${favorites.length !== 1 ? 's' : ''} saved`
            : 'No favorite tools saved yet'
          }
        </p>
      </div>

      {favorites.length > 0 && (
        <>
          {/* Search and Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={FiGrid} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={FiList} />
                </button>
              </div>
            </div>
          </div>

          {/* Favorites Grid/List */}
          <AnimatePresence mode="wait">
            {filteredFavorites.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredFavorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 group ${
                      viewMode === 'grid' ? 'p-6' : 'p-4'
                    }`}
                  >
                    <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col text-center' : 'space-x-4'}`}>
                      {/* Tool Icon */}
                      <div className={`bg-gradient-to-br ${getToolColor(index)} rounded-lg flex items-center justify-center ${
                        viewMode === 'grid' ? 'w-12 h-12 mb-4' : 'w-10 h-10 flex-shrink-0'
                      }`}>
                        <SafeIcon icon={getToolIcon(favorite.tool_name)} className="text-white text-xl" />
                      </div>

                      {/* Tool Info */}
                      <div className={`flex-1 ${viewMode === 'grid' ? 'text-center' : ''}`}>
                        <h3 className={`font-semibold text-white group-hover:text-purple-400 transition-colors ${
                          viewMode === 'grid' ? 'text-lg mb-2' : 'text-base mb-1'
                        }`}>
                          {favorite.tool_name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Added {new Date(favorite.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className={`flex items-center space-x-2 ${
                        viewMode === 'grid' ? 'mt-4 justify-center' : 'flex-shrink-0'
                      }`}>
                        <button
                          onClick={() => handleToolClick(favorite)}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                          title="Open tool"
                        >
                          <SafeIcon icon={FiExternalLink} className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(favorite.id, favorite.tool_name)}
                          disabled={removing === favorite.id}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Remove from favorites"
                        >
                          {removing === favorite.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <SafeIcon icon={FiTrash2} className="text-sm" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <SafeIcon icon={FiSearch} className="text-slate-600 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">No favorites found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search term' : 'No favorites match your search'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty State */}
      {favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <SafeIcon icon={FiHeart} className="text-slate-600 text-8xl mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-400 mb-4">No favorites yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Start exploring our tools and click the ❤️ icon to add your most-used tools to your favorites!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/utilities')}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Explore Utilities
            </button>
            <button
              onClick={() => navigate('/generators')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Browse Generators
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Favorites;