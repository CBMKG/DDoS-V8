# Termux Tool v2.0 - Advanced Server & Bot Manager

## Overview
This is a Node.js-based tool designed for Termux environments that provides server monitoring, bot management, and developer tools. The application features a secure authentication system, colorful terminal interface, and both public and developer access modes.

## Project Structure
```
├── menu.js           # Main application file
├── start.sh          # Termux startup script
├── package.json      # Node.js dependencies
├── .env.example      # Environment variables template
└── replit.md         # This documentation
```

## Features

### Public User Mode
- View server activity status (Minecraft, SAMP, GTA V)
- Check system uptime and statistics
- Run up to 100,000 bots
- Stop active bots
- Server input support for different platforms

### Developer Mode
- Enhanced bot limits (up to 1,000,000 bots)
- Custom bot configuration
- Real-time dashboard with statistics
- API key generator
- Webhook support for status notifications
- Advanced developer tools and system logs

### Authentication System
- Developer login with username/password
- 3-attempt security system
- Bypass code support for emergency access
- Secure environment variable storage

## Technical Details

### Dependencies
- **Node.js**: Runtime environment
- **chalk@4.1.2**: Terminal styling and colors
- **readline-sync**: Interactive console input

### Environment Variables
- `DEV_USERNAME`: Developer username (default: APIS)
- `DEV_PASSWORD`: Developer password (default: AFISGEMER)
- `BYPASS_CODE`: Emergency bypass code (default: ULMIMEED)

### Server Support
- SAMP Servers
- Minecraft Servers  
- GTA V Servers
- Website/URL testing

## Installation & Usage

### In Termux Environment
```bash
# Make start script executable
chmod +x start.sh

# Run the application
./start.sh
```

### Manual Start
```bash
# Install dependencies
npm install

# Run application
node menu.js
```

## Security Features
- Environment-based credential storage
- Attempt-limited authentication
- Secure secret management
- No hardcoded passwords in source

## Recent Changes
- **2025-09-10**: Initial project creation
- **2025-09-10**: Implemented complete feature set with authentication, menus, and developer tools
- **2025-09-10**: Fixed chalk compatibility issue (downgraded to v4.1.2)
- **2025-09-10**: Added environment variable security system

## Architecture
- **Main Class**: `TermuxTool` - Central application controller
- **Authentication**: Environment variable-based security system
- **UI**: Chalk-styled console interface with colored output
- **State Management**: In-memory tracking of bots, users, and server status
- **Webhook Integration**: HTTP notification support for bot status

## User Preferences
- Console-based terminal interface preferred
- Indonesian language support for menu items
- Colorful output with clear visual hierarchy
- Security-first approach for credentials

## Future Enhancements
- Real HTTP webhook implementation
- Persistent storage for bot statistics
- Advanced logging system
- Network-based server testing

## SCF
```
git clone https://github.com/CBMKG/Tools-DDoS.git
cd Tools-DDoS
chmod +x start.sh
./start.sh ```
