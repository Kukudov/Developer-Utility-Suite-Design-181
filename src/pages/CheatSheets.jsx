import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiBook, FiTerminal, FiDatabase, FiGitBranch, FiPackage, FiGlobe, FiCode, FiServer, FiKey, FiCloud, FiLock, FiArchive, FiLink, FiDollarSign } = FiIcons;

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
        { command: 'git status', description: 'Check repository status' }
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
        { command: 'grep -r "text" .', description: 'Search for text in files' }
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
        { command: 'docker-compose up -d', description: 'Start services in background' }
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
        { command: '/<search>', description: 'Search for text' }
      ]
    },
    {
      id: 'apt',
      title: 'APT Commands',
      description: 'Advanced Package Tool for Debian/Ubuntu',
      icon: FiPackage,
      color: 'from-red-500 to-pink-500',
      commands: [
        { command: 'apt update', description: 'Update package index' },
        { command: 'apt upgrade', description: 'Upgrade all packages' },
        { command: 'apt install <package>', description: 'Install a package' },
        { command: 'apt remove <package>', description: 'Remove a package' },
        { command: 'apt purge <package>', description: 'Remove package and config files' },
        { command: 'apt autoremove', description: 'Remove unused packages' },
        { command: 'apt search <term>', description: 'Search for packages' },
        { command: 'apt show <package>', description: 'Show package information' },
        { command: 'apt list --installed', description: 'List installed packages' },
        { command: 'apt list --upgradable', description: 'List upgradable packages' }
      ]
    },
    {
      id: 'apt-get',
      title: 'APT-GET Commands',
      description: 'Traditional APT package management',
      icon: FiPackage,
      color: 'from-orange-500 to-red-500',
      commands: [
        { command: 'apt-get update', description: 'Update package lists' },
        { command: 'apt-get upgrade', description: 'Upgrade installed packages' },
        { command: 'apt-get dist-upgrade', description: 'Smart upgrade with dependencies' },
        { command: 'apt-get install <package>', description: 'Install a package' },
        { command: 'apt-get remove <package>', description: 'Remove a package' },
        { command: 'apt-get purge <package>', description: 'Remove package completely' },
        { command: 'apt-get autoremove', description: 'Remove orphaned packages' },
        { command: 'apt-get autoclean', description: 'Clean package cache' },
        { command: 'apt-get check', description: 'Check for broken dependencies' },
        { command: 'apt-get source <package>', description: 'Download source code' }
      ]
    },
    {
      id: 'homebrew',
      title: 'Homebrew Commands',
      description: 'Package manager for macOS and Linux',
      icon: FiPackage,
      color: 'from-yellow-500 to-orange-500',
      commands: [
        { command: 'brew install <package>', description: 'Install a package' },
        { command: 'brew uninstall <package>', description: 'Uninstall a package' },
        { command: 'brew update', description: 'Update Homebrew and formulae' },
        { command: 'brew upgrade', description: 'Upgrade all packages' },
        { command: 'brew upgrade <package>', description: 'Upgrade specific package' },
        { command: 'brew list', description: 'List installed packages' },
        { command: 'brew search <term>', description: 'Search for packages' },
        { command: 'brew info <package>', description: 'Show package information' },
        { command: 'brew cleanup', description: 'Remove old versions' },
        { command: 'brew doctor', description: 'Check for issues' }
      ]
    },
    {
      id: 'yarn',
      title: 'Yarn Commands',
      description: 'Fast, reliable JavaScript package manager',
      icon: FiPackage,
      color: 'from-blue-500 to-purple-500',
      commands: [
        { command: 'yarn init', description: 'Initialize new package' },
        { command: 'yarn add <package>', description: 'Add dependency' },
        { command: 'yarn add <package> --dev', description: 'Add dev dependency' },
        { command: 'yarn remove <package>', description: 'Remove dependency' },
        { command: 'yarn install', description: 'Install all dependencies' },
        { command: 'yarn upgrade', description: 'Upgrade dependencies' },
        { command: 'yarn start', description: 'Run start script' },
        { command: 'yarn build', description: 'Run build script' },
        { command: 'yarn test', description: 'Run test script' },
        { command: 'yarn global add <package>', description: 'Install package globally' }
      ]
    },
    {
      id: 'ascii-codes',
      title: 'ASCII Codes',
      description: 'Common ASCII character codes',
      icon: FiCode,
      color: 'from-green-500 to-teal-500',
      commands: [
        { command: '32', description: 'Space' },
        { command: '33', description: '! (Exclamation mark)' },
        { command: '34', description: '" (Double quote)' },
        { command: '35', description: '# (Hash/Pound)' },
        { command: '36', description: '$ (Dollar sign)' },
        { command: '37', description: '% (Percent)' },
        { command: '38', description: '& (Ampersand)' },
        { command: '39', description: '\' (Single quote)' },
        { command: '40', description: '( (Left parenthesis)' },
        { command: '41', description: ') (Right parenthesis)' },
        { command: '42', description: '* (Asterisk)' },
        { command: '43', description: '+ (Plus sign)' },
        { command: '44', description: ', (Comma)' },
        { command: '45', description: '- (Hyphen/Minus)' },
        { command: '46', description: '. (Period/Dot)' },
        { command: '47', description: '/ (Forward slash)' },
        { command: '48-57', description: '0-9 (Numbers)' },
        { command: '58', description: ': (Colon)' },
        { command: '59', description: '; (Semicolon)' },
        { command: '60', description: '< (Less than)' },
        { command: '61', description: '= (Equal sign)' },
        { command: '62', description: '> (Greater than)' },
        { command: '63', description: '? (Question mark)' },
        { command: '64', description: '@ (At symbol)' },
        { command: '65-90', description: 'A-Z (Uppercase letters)' },
        { command: '91', description: '[ (Left bracket)' },
        { command: '92', description: '\\ (Backslash)' },
        { command: '93', description: '] (Right bracket)' },
        { command: '94', description: '^ (Caret)' },
        { command: '95', description: '_ (Underscore)' },
        { command: '96', description: '` (Backtick)' },
        { command: '97-122', description: 'a-z (Lowercase letters)' },
        { command: '123', description: '{ (Left brace)' },
        { command: '124', description: '| (Vertical bar)' },
        { command: '125', description: '} (Right brace)' },
        { command: '126', description: '~ (Tilde)' },
        { command: '127', description: 'DEL (Delete)' }
      ]
    },
    {
      id: 'alt-keys',
      title: 'Alt Key Combinations',
      description: 'Windows Alt key shortcuts',
      icon: FiKey,
      color: 'from-indigo-500 to-purple-500',
      commands: [
        { command: 'Alt + Tab', description: 'Switch between applications' },
        { command: 'Alt + F4', description: 'Close active window' },
        { command: 'Alt + Space', description: 'Open window menu' },
        { command: 'Alt + Enter', description: 'Properties of selected item' },
        { command: 'Alt + Left Arrow', description: 'Go back' },
        { command: 'Alt + Right Arrow', description: 'Go forward' },
        { command: 'Alt + Up Arrow', description: 'Go up one level' },
        { command: 'Alt + D', description: 'Select address bar' },
        { command: 'Alt + 0169', description: '© (Copyright symbol)' },
        { command: 'Alt + 0174', description: '® (Registered symbol)' },
        { command: 'Alt + 0153', description: '™ (Trademark symbol)' },
        { command: 'Alt + 0176', description: '° (Degree symbol)' },
        { command: 'Alt + 0177', description: '± (Plus/minus symbol)' },
        { command: 'Alt + 0188', description: '¼ (One quarter)' },
        { command: 'Alt + 0189', description: '½ (One half)' },
        { command: 'Alt + 0190', description: '¾ (Three quarters)' }
      ]
    },
    {
      id: 'aws-cli',
      title: 'AWS CLI Commands',
      description: 'Amazon Web Services Command Line Interface',
      icon: FiCloud,
      color: 'from-yellow-500 to-orange-500',
      commands: [
        { command: 'aws configure', description: 'Configure AWS credentials' },
        { command: 'aws s3 ls', description: 'List S3 buckets' },
        { command: 'aws s3 cp <file> s3://<bucket>/', description: 'Copy file to S3' },
        { command: 'aws s3 sync <dir> s3://<bucket>/', description: 'Sync directory to S3' },
        { command: 'aws ec2 describe-instances', description: 'List EC2 instances' },
        { command: 'aws ec2 start-instances --instance-ids <id>', description: 'Start EC2 instance' },
        { command: 'aws ec2 stop-instances --instance-ids <id>', description: 'Stop EC2 instance' },
        { command: 'aws lambda list-functions', description: 'List Lambda functions' },
        { command: 'aws iam list-users', description: 'List IAM users' },
        { command: 'aws logs describe-log-groups', description: 'List CloudWatch log groups' }
      ]
    },
    {
      id: 'country-codes',
      title: 'Country Codes',
      description: 'ISO 3166-1 alpha-2 country codes',
      icon: FiGlobe,
      color: 'from-blue-500 to-green-500',
      commands: [
        { command: 'US', description: 'United States' },
        { command: 'GB', description: 'United Kingdom' },
        { command: 'CA', description: 'Canada' },
        { command: 'AU', description: 'Australia' },
        { command: 'DE', description: 'Germany' },
        { command: 'FR', description: 'France' },
        { command: 'IT', description: 'Italy' },
        { command: 'ES', description: 'Spain' },
        { command: 'NL', description: 'Netherlands' },
        { command: 'CH', description: 'Switzerland' },
        { command: 'SE', description: 'Sweden' },
        { command: 'NO', description: 'Norway' },
        { command: 'DK', description: 'Denmark' },
        { command: 'FI', description: 'Finland' },
        { command: 'JP', description: 'Japan' },
        { command: 'KR', description: 'South Korea' },
        { command: 'CN', description: 'China' },
        { command: 'IN', description: 'India' },
        { command: 'BR', description: 'Brazil' },
        { command: 'MX', description: 'Mexico' },
        { command: 'AR', description: 'Argentina' },
        { command: 'RU', description: 'Russia' },
        { command: 'ZA', description: 'South Africa' },
        { command: 'EG', description: 'Egypt' },
        { command: 'NG', description: 'Nigeria' }
      ]
    },
    {
      id: 'curl',
      title: 'cURL Commands',
      description: 'Command line tool for data transfer',
      icon: FiGlobe,
      color: 'from-cyan-500 to-blue-500',
      commands: [
        { command: 'curl <url>', description: 'Basic GET request' },
        { command: 'curl -X POST <url>', description: 'POST request' },
        { command: 'curl -H "Content-Type: application/json" <url>', description: 'Add header' },
        { command: 'curl -d "data" <url>', description: 'Send data' },
        { command: 'curl -d @file.json <url>', description: 'Send file data' },
        { command: 'curl -o output.txt <url>', description: 'Save output to file' },
        { command: 'curl -L <url>', description: 'Follow redirects' },
        { command: 'curl -I <url>', description: 'Head request (headers only)' },
        { command: 'curl -u user:pass <url>', description: 'Basic authentication' },
        { command: 'curl -k <url>', description: 'Ignore SSL certificate' },
        { command: 'curl -v <url>', description: 'Verbose output' },
        { command: 'curl -s <url>', description: 'Silent mode' },
        { command: 'curl -w "%{http_code}" <url>', description: 'Show HTTP status code' },
        { command: 'curl --max-time 10 <url>', description: 'Set timeout' },
        { command: 'curl -A "User-Agent" <url>', description: 'Set user agent' }
      ]
    },
    {
      id: 'currencies',
      title: 'Currency Codes',
      description: 'ISO 4217 currency codes',
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-500',
      commands: [
        { command: 'USD', description: 'US Dollar' },
        { command: 'EUR', description: 'Euro' },
        { command: 'GBP', description: 'British Pound' },
        { command: 'JPY', description: 'Japanese Yen' },
        { command: 'AUD', description: 'Australian Dollar' },
        { command: 'CAD', description: 'Canadian Dollar' },
        { command: 'CHF', description: 'Swiss Franc' },
        { command: 'CNY', description: 'Chinese Yuan' },
        { command: 'SEK', description: 'Swedish Krona' },
        { command: 'NZD', description: 'New Zealand Dollar' },
        { command: 'MXN', description: 'Mexican Peso' },
        { command: 'SGD', description: 'Singapore Dollar' },
        { command: 'HKD', description: 'Hong Kong Dollar' },
        { command: 'NOK', description: 'Norwegian Krone' },
        { command: 'KRW', description: 'South Korean Won' },
        { command: 'TRY', description: 'Turkish Lira' },
        { command: 'RUB', description: 'Russian Ruble' },
        { command: 'INR', description: 'Indian Rupee' },
        { command: 'BRL', description: 'Brazilian Real' },
        { command: 'ZAR', description: 'South African Rand' }
      ]
    },
    {
      id: 'http-status',
      title: 'HTTP Status Codes',
      description: 'Common HTTP response status codes',
      icon: FiGlobe,
      color: 'from-red-500 to-pink-500',
      commands: [
        { command: '200', description: 'OK - Request successful' },
        { command: '201', description: 'Created - Resource created' },
        { command: '204', description: 'No Content - Success, no response body' },
        { command: '301', description: 'Moved Permanently' },
        { command: '302', description: 'Found - Temporary redirect' },
        { command: '304', description: 'Not Modified - Use cached version' },
        { command: '400', description: 'Bad Request - Invalid syntax' },
        { command: '401', description: 'Unauthorized - Authentication required' },
        { command: '403', description: 'Forbidden - Access denied' },
        { command: '404', description: 'Not Found - Resource not found' },
        { command: '405', description: 'Method Not Allowed' },
        { command: '409', description: 'Conflict - Request conflicts' },
        { command: '422', description: 'Unprocessable Entity' },
        { command: '429', description: 'Too Many Requests - Rate limited' },
        { command: '500', description: 'Internal Server Error' },
        { command: '502', description: 'Bad Gateway' },
        { command: '503', description: 'Service Unavailable' },
        { command: '504', description: 'Gateway Timeout' }
      ]
    },
    {
      id: 'redis',
      title: 'Redis Commands',
      description: 'Redis in-memory data structure store',
      icon: FiDatabase,
      color: 'from-red-500 to-orange-500',
      commands: [
        { command: 'SET key value', description: 'Set a key-value pair' },
        { command: 'GET key', description: 'Get value by key' },
        { command: 'DEL key', description: 'Delete a key' },
        { command: 'EXISTS key', description: 'Check if key exists' },
        { command: 'KEYS pattern', description: 'Find keys matching pattern' },
        { command: 'EXPIRE key seconds', description: 'Set key expiration' },
        { command: 'TTL key', description: 'Get time to live' },
        { command: 'INCR key', description: 'Increment number' },
        { command: 'DECR key', description: 'Decrement number' },
        { command: 'LPUSH list value', description: 'Add to list start' },
        { command: 'RPUSH list value', description: 'Add to list end' },
        { command: 'LPOP list', description: 'Remove from list start' },
        { command: 'LLEN list', description: 'Get list length' },
        { command: 'SADD set value', description: 'Add to set' },
        { command: 'SMEMBERS set', description: 'Get all set members' },
        { command: 'HSET hash field value', description: 'Set hash field' },
        { command: 'HGET hash field', description: 'Get hash field' },
        { command: 'FLUSHALL', description: 'Clear all data' }
      ]
    },
    {
      id: 'regexp',
      title: 'Regular Expressions',
      description: 'Common regex patterns and syntax',
      icon: FiCode,
      color: 'from-purple-500 to-indigo-500',
      commands: [
        { command: '.', description: 'Any character except newline' },
        { command: '*', description: 'Zero or more of preceding' },
        { command: '+', description: 'One or more of preceding' },
        { command: '?', description: 'Zero or one of preceding' },
        { command: '^', description: 'Start of string' },
        { command: '$', description: 'End of string' },
        { command: '\\d', description: 'Any digit (0-9)' },
        { command: '\\w', description: 'Any word character (a-z, A-Z, 0-9, _)' },
        { command: '\\s', description: 'Any whitespace character' },
        { command: '\\D', description: 'Any non-digit' },
        { command: '\\W', description: 'Any non-word character' },
        { command: '\\S', description: 'Any non-whitespace' },
        { command: '[abc]', description: 'Any character in brackets' },
        { command: '[^abc]', description: 'Any character not in brackets' },
        { command: '[a-z]', description: 'Any lowercase letter' },
        { command: '[A-Z]', description: 'Any uppercase letter' },
        { command: '[0-9]', description: 'Any digit' },
        { command: '(abc)', description: 'Capture group' },
        { command: '(?:abc)', description: 'Non-capturing group' },
        { command: 'a{3}', description: 'Exactly 3 of a' },
        { command: 'a{3,}', description: '3 or more of a' },
        { command: 'a{3,6}', description: 'Between 3 and 6 of a' },
        { command: 'a|b', description: 'a or b' },
        { command: '\\b', description: 'Word boundary' }
      ]
    },
    {
      id: 'ssh',
      title: 'SSH Commands',
      description: 'Secure Shell remote access commands',
      icon: FiLock,
      color: 'from-green-500 to-blue-500',
      commands: [
        { command: 'ssh user@host', description: 'Connect to remote host' },
        { command: 'ssh -p 2222 user@host', description: 'Connect on specific port' },
        { command: 'ssh -i keyfile user@host', description: 'Connect with private key' },
        { command: 'ssh-keygen -t rsa', description: 'Generate SSH key pair' },
        { command: 'ssh-copy-id user@host', description: 'Copy public key to remote' },
        { command: 'scp file.txt user@host:/path/', description: 'Copy file to remote' },
        { command: 'scp user@host:/path/file.txt .', description: 'Copy file from remote' },
        { command: 'scp -r dir/ user@host:/path/', description: 'Copy directory recursively' },
        { command: 'ssh -L 8080:localhost:80 user@host', description: 'Local port forwarding' },
        { command: 'ssh -R 8080:localhost:80 user@host', description: 'Remote port forwarding' },
        { command: 'ssh -D 1080 user@host', description: 'Dynamic port forwarding (SOCKS)' },
        { command: 'ssh -N -f user@host', description: 'Background tunnel (no shell)' },
        { command: 'ssh -o StrictHostKeyChecking=no user@host', description: 'Skip host key verification' },
        { command: 'ssh -v user@host', description: 'Verbose connection info' },
        { command: 'ssh-agent', description: 'Start SSH agent' },
        { command: 'ssh-add ~/.ssh/id_rsa', description: 'Add key to SSH agent' }
      ]
    },
    {
      id: 'subversion',
      title: 'Subversion (SVN)',
      description: 'Subversion version control commands',
      icon: FiGitBranch,
      color: 'from-blue-500 to-purple-500',
      commands: [
        { command: 'svn checkout <url>', description: 'Check out working copy' },
        { command: 'svn update', description: 'Update working copy' },
        { command: 'svn add <file>', description: 'Add file to version control' },
        { command: 'svn commit -m "message"', description: 'Commit changes' },
        { command: 'svn status', description: 'Show working copy status' },
        { command: 'svn diff', description: 'Show differences' },
        { command: 'svn log', description: 'Show commit history' },
        { command: 'svn info', description: 'Show working copy info' },
        { command: 'svn revert <file>', description: 'Revert changes to file' },
        { command: 'svn delete <file>', description: 'Delete file' },
        { command: 'svn move <old> <new>', description: 'Move/rename file' },
        { command: 'svn copy <src> <dest>', description: 'Copy file or directory' },
        { command: 'svn merge <url>', description: 'Merge changes' },
        { command: 'svn switch <url>', description: 'Switch to different branch' },
        { command: 'svn cleanup', description: 'Clean up working copy' }
      ]
    },
    {
      id: 'tar',
      title: 'Tar Commands',
      description: 'Archive and compression commands',
      icon: FiArchive,
      color: 'from-yellow-500 to-red-500',
      commands: [
        { command: 'tar -cf archive.tar files/', description: 'Create tar archive' },
        { command: 'tar -czf archive.tar.gz files/', description: 'Create gzipped archive' },
        { command: 'tar -cjf archive.tar.bz2 files/', description: 'Create bzip2 archive' },
        { command: 'tar -tf archive.tar', description: 'List archive contents' },
        { command: 'tar -xf archive.tar', description: 'Extract archive' },
        { command: 'tar -xzf archive.tar.gz', description: 'Extract gzipped archive' },
        { command: 'tar -xjf archive.tar.bz2', description: 'Extract bzip2 archive' },
        { command: 'tar -xf archive.tar -C /path/', description: 'Extract to specific directory' },
        { command: 'tar -rf archive.tar newfile', description: 'Append file to archive' },
        { command: 'tar --exclude="*.log" -czf archive.tar.gz dir/', description: 'Exclude files by pattern' },
        { command: 'tar -czf - files/ | ssh user@host "cat > archive.tar.gz"', description: 'Create and transfer archive' },
        { command: 'tar -xzf archive.tar.gz file.txt', description: 'Extract specific file' },
        { command: 'tar -df archive.tar', description: 'Compare archive with filesystem' },
        { command: 'tar --delete -f archive.tar file.txt', description: 'Delete file from archive' }
      ]
    },
    {
      id: 'url-encoding',
      title: 'URL Encoding',
      description: 'Common URL encoded characters',
      icon: FiLink,
      color: 'from-cyan-500 to-teal-500',
      commands: [
        { command: '%20', description: 'Space' },
        { command: '%21', description: '! (Exclamation mark)' },
        { command: '%22', description: '" (Double quote)' },
        { command: '%23', description: '# (Hash)' },
        { command: '%24', description: '$ (Dollar sign)' },
        { command: '%25', description: '% (Percent)' },
        { command: '%26', description: '& (Ampersand)' },
        { command: '%27', description: '\' (Single quote)' },
        { command: '%28', description: '( (Left parenthesis)' },
        { command: '%29', description: ') (Right parenthesis)' },
        { command: '%2A', description: '* (Asterisk)' },
        { command: '%2B', description: '+ (Plus sign)' },
        { command: '%2C', description: ', (Comma)' },
        { command: '%2F', description: '/ (Forward slash)' },
        { command: '%3A', description: ': (Colon)' },
        { command: '%3B', description: '; (Semicolon)' },
        { command: '%3C', description: '< (Less than)' },
        { command: '%3D', description: '= (Equal sign)' },
        { command: '%3E', description: '> (Greater than)' },
        { command: '%3F', description: '? (Question mark)' },
        { command: '%40', description: '@ (At symbol)' },
        { command: '%5B', description: '[ (Left bracket)' },
        { command: '%5C', description: '\\ (Backslash)' },
        { command: '%5D', description: '] (Right bracket)' },
        { command: '%7B', description: '{ (Left brace)' },
        { command: '%7C', description: '| (Vertical bar)' },
        { command: '%7D', description: '} (Right brace)' }
      ]
    }
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
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${selectedSheet.color} rounded-lg flex items-center justify-center`}>
              <SafeIcon icon={selectedSheet.icon} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedSheet.title}</h1>
              <p className="text-slate-400 mt-1">{selectedSheet.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6">
            <div className="space-y-3">
              {selectedSheet.commands.map((cmd, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="flex-1">
                    <code className="text-green-400 font-mono text-sm md:text-base font-medium">
                      {cmd.command}
                    </code>
                    <p className="text-slate-300 mt-1 text-sm">{cmd.description}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(cmd.command)}
                    className="mt-2 md:mt-0 md:ml-4 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 transition-colors text-sm opacity-100 md:opacity-0 group-hover:opacity-100"
                    title="Copy command"
                  >
                    Copy
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{selectedSheet.commands.length} commands available</span>
            <span>Click any command to copy it</span>
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
        <h1 className="text-4xl font-bold text-white mb-2">Developer Cheat Sheets</h1>
        <p className="text-slate-400 text-lg">Quick reference guides for developers and system administrators</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSheets.map((sheet, index) => (
          <motion.div
            key={sheet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
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

      {/* No Results */}
      {filteredSheets.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiSearch} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No cheat sheets found</h3>
          <p className="text-slate-500">Try adjusting your search term</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{cheatSheets.length}</h3>
            <p className="text-slate-400 text-sm">Cheat Sheets</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {cheatSheets.reduce((total, sheet) => total + sheet.commands.length, 0)}
            </h3>
            <p className="text-slate-400 text-sm">Total Commands</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{filteredSheets.length}</h3>
            <p className="text-slate-400 text-sm">Showing</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">∞</h3>
            <p className="text-slate-400 text-sm">Always Free</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheatSheets;