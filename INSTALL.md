# Installation Guide

## Quick Install

### Option 1: Global Installation (Recommended)

```bash
# Navigate to the 2do2 directory
cd /Users/chris/zed/2do2

# Install dependencies and build
npm install

# Install globally from local directory
npm install -g .
# OR use npm link for development
npm link

# Verify installation
2do2 --version
```

### Option 2: Run Without Global Install

```bash
# Navigate to 2do2 directory
cd /Users/chris/zed/2do2

# Install dependencies
npm install

# Run directly with npm
npm start -- --version
npm start -- help
npm start -- list

# Or use development mode (with auto-rebuild)
npm run dev -- --version
```

## Setup

1. **Get your Todoist API Token:**
   - Go to https://todoist.com/prefs/integrations
   - Scroll to "API token" section
   - Copy your token

2. **Configure 2do2:**
   ```bash
   2do2 config set-token YOUR_API_TOKEN_HERE
   ```

3. **Test the setup:**
   ```bash
   2do2 list
   ```

## First Time Usage

```bash
# See all available commands
2do2 help

# List your tasks
2do2 list

# Set a default project (optional)
2do2 config set default-project "Work"

# Add your first task
2do2 add "Try out 2do2 CLI tool!" -d today -r 2
```

## Uninstallation

```bash
# If installed with npm install -g .
npm uninstall -g 2do2

# If installed with npm link
npm unlink -g 2do2

# Remove from current directory
cd /Users/chris/zed/2do2
npm unlink  # if you used npm link
```

## Troubleshooting

### "Command not found" after installation
- Try closing and reopening your terminal
- Check if `~/.npm-global/bin` is in your PATH
- Try `npm run link-global` again

### API token issues
- Verify your token at https://todoist.com/prefs/integrations
- Make sure you copied the full token
- Run `2do2 config show` to verify it's set

### Build errors
- Make sure you have Node.js 16+ installed
- Try `npm run clean && npm install`
- Check that TypeScript is installed: `npm install -g typescript`

### Permission errors
- On Unix systems, you might need `sudo npm install -g`
- Or set up npm to install globally without sudo:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
  source ~/.bashrc
  ```

## Development

```bash
# Watch mode for development
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Clean build artifacts
npm run clean
```