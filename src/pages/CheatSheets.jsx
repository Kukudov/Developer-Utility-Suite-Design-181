import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiBook, FiTerminal, FiDatabase, FiGitBranch } = FiIcons;

const CheatSheets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState(null);

  const cheatSheets = [
    {
      id: 'git',
      title: 'Git Commands',
      description: 'Essential Git commands for version control',
      icon: FiGitBranch,
      color: 'from-orange-500 to-red-500',
      commands: [
        { command: 'git init', description: 'Initialize a new Git repository' },
        { command: 'git clone <url>', description: 'Clone a repository from remote' },
        { command: 'git add .', description: 'Stage all changes' },
        { command: 'git commit -m "message"', description: 'Commit staged changes' },
        { command: 'git push origin main', description: 'Push to remote repository' },
        { command: 'git pull origin main', description: 'Pull latest changes' },
        { command: 'git branch', description: 'List all branches' },
        { command: 'git checkout -b <branch>', description: 'Create and switch to new branch' },
        { command: 'git merge <branch>', description: 'Merge branch into current branch' },
        { command: 'git status', description: 'Check repository status' },
      ]
    },
    {
      id: 'linux',
      title: 'Linux Commands',
      description: 'Common Linux terminal commands',
      icon: FiTerminal,
      color: 'from-green-500 to-emerald-500',
      commands: [
        { command: 'ls -la', description: 'List files with details' },
        { command: 'cd <directory>', description: 'Change directory' },
        { command: 'mkdir <name>', description: 'Create directory' },
        { command: 'rm -rf <file/dir>', description: 'Remove file or directory' },
        { command: 'cp <source> <dest>', description: 'Copy file or directory' },
        { command: 'mv <source> <dest>', description: 'Move/rename file or directory' },
        { command: 'chmod 755 <file>', description: 'Change file permissions' },
        { command: 'ps aux', description: 'List running processes' },
        { command: 'kill -9 <pid>', description: 'Force kill process' },
        { command: 'grep -r "text" .', description: 'Search for text in files' },
      ]
    },
    {
      id: 'docker',
      title: 'Docker Commands',
      description: 'Docker containerization commands',
      icon: FiDatabase,
      color: 'from-blue-500 to-cyan-500',
      commands: [
        { command: 'docker build -t <name> .', description: 'Build image from Dockerfile' },
        { command: 'docker run -p 8080:80 <image>', description: 'Run container with port mapping' },
        { command: 'docker ps', description: 'List running containers' },
        { command: 'docker ps -a', description: 'List all containers' },
        { command: 'docker stop <container>', description: 'Stop running container' },
        { command: 'docker rm <container>', description: 'Remove container' },
        { command: 'docker images', description: 'List all images' },
        { command: 'docker rmi <image>', description: 'Remove image' },
        { command: 'docker exec -it <container> bash', description: 'Execute command in container' },
        { command: 'docker-compose up -d', description: 'Start services in background' },
      ]
    },
    {
      id: 'vim',
      title: 'Vim Editor',
      description: 'Essential Vim editor commands',
      icon: FiBook,
      color: 'from-purple-500 to-pink-500',
      commands: [
        { command: 'i', description: 'Enter insert mode' },
        { command: 'Esc', description: 'Exit insert mode' },
        { command: ':w', description: 'Save file' },
        { command: ':q', description: 'Quit vim' },
        { command: ':wq', description: 'Save and quit' },
        { command: ':q!', description: 'Quit without saving' },
        { command: 'dd', description: 'Delete current line' },
        { command: 'yy', description: 'Copy current line' },
        { command: 'p', description: 'Paste' },
        { command: '/<search>', description: 'Search for text' },
      ]
    },
  ];

  const filteredSheets = cheatSheets.filter(sheet =>
    sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedSheet) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 min-h-screen"
      >
        <div className="mb-6">
          <button
            onClick={() => setSelectedSheet(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} />
            <span>Back to Cheat Sheets</span>
          </button>
          <h1 className="text-3xl font-bold text-white">{selectedSheet.title}</h1>
          <p className="text-slate-400 mt-2">{selectedSheet.description}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {selectedSheet.commands.map((cmd, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <code className="text-green-400 font-mono text-lg">{cmd.command}</code>
                    <p className="text-slate-300 mt-1">{cmd.description}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(cmd.command)}
                    className="mt-2 md:mt-0 md:ml-4 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
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
        <h1 className="text-4xl font-bold text-white mb-2">Cheat Sheets</h1>
        <p className="text-slate-400 text-lg">Quick reference guides for developers</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cheat sheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Cheat Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSheets.map((sheet, index) => (
          <motion.div
            key={sheet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => setSelectedSheet(sheet)}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer group hover:scale-105"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${sheet.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <SafeIcon icon={sheet.icon} className="text-white text-xl" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{sheet.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{sheet.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm">{sheet.commands.length} commands</span>
              <SafeIcon icon={FiIcons.FiArrowRight} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CheatSheets;