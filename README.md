# Autholas Node.js Authentication System

A Node.js implementation for Autholas authentication service with hardware ID verification.

## Features

- User authentication via Autholas API
- Hardware ID generation using system information
- Cross-platform support (Windows/Linux/macOS)
- Built-in crypto module for SHA-256 hashing
- Comprehensive error handling
- Promise-based async/await support

## Prerequisites

- Node.js 12.0 or higher
- npm (Node Package Manager)

## Installation

### Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org/)

### Initialize Project and Install Dependencies

```bash
# Initialize a new Node.js project
npm init -y

# Install required dependencies
npm install axios

# Alternative: Install specific version
npm install axios@^1.0.0
```

### Package.json Dependencies

Create or update your `package.json`:

```json
{
  "name": "autholas-auth",
  "version": "1.0.0",
  "description": "Autholas Authentication System",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js"
  },
  "dependencies": {
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  },
  "keywords": ["autholas", "authentication", "api"],
  "author": "Your Name",
  "license": "MIT"
}
```

## File Structure

```
├── autholas.js         # Authentication functions and utilities
├── main.js             # Main program entry point
├── package.json        # Node.js project configuration
├── package-lock.json   # Dependency lock file
└── README.md          # This file
```

## Configuration

1. Open `autholas.js`
2. Replace `YOUR_API_KEY_HERE` with your actual Autholas API key:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

## Usage

### Basic Usage

```bash
# Run the application
node main.js

# Or using npm script
npm start

# For development with auto-restart
npm install -g nodemon
nodemon main.js
```

### Using the Module in Your Code

```javascript
const { authenticateUser, getHardwareID } = require('./autholas');

async function login() {
    const hwid = getHardwareID();
    console.log(`Hardware ID: ${hwid}`);
    
    const result = await authenticateUser('username', 'password', hwid);
    
    if (result.success) {
        console.log('Authentication successful!');
        console.log(`Session token: ${result.sessionToken}`);
        return result.sessionToken;
    } else {
        console.log(`Authentication failed: ${result.error}`);
        return null;
    }
}

login().then(token => {
    if (token) {
        // Start your application
        console.log('Welcome to the application!');
    }
}).catch(console.error);
```

## API Reference

### Functions

#### `getHardwareID()`
Generates a unique hardware ID based on:
- System hostname
- Username  
- System architecture

**Returns:** `string` - SHA-256 hash of combined system info

#### `authenticateUser(username, password, hwid)`
Authenticates user with Autholas API.

**Parameters:**
- `username` (string) - User's username
- `password` (string) - User's password  
- `hwid` (string) - Hardware ID from `getHardwareID()`

**Returns:** `Promise<Object>`
```javascript
{
    success: true/false,
    sessionToken: 'token_string',  // Only if success
    error: 'error_message',        // Only if failed
    errorCode: 'ERROR_CODE'        // Only if failed
}
```

#### `handleAuthError(errorCode, errorMessage)`
Displays user-friendly error messages for different error codes.

#### `question(query)`
Helper function for command-line input.

**Parameters:**
- `query` (string) - Question to display

**Returns:** `Promise<string>` - User input

## Error Handling

The system handles various authentication errors:

- `INVALID_CREDENTIALS` - Wrong username/password
- `USER_BANNED` - Account suspended
- `SUBSCRIPTION_EXPIRED` - Subscription ended
- `MAX_DEVICES_REACHED` - Device limit exceeded
- `HWID_BANNED` - Device banned
- `RATE_LIMIT_EXCEEDED` - Too many attempts
- `MISSING_PARAMETERS` - Invalid request
- Network errors (ECONNREFUSED, ENOTFOUND, ECONNABORTED)

## Example Integration

```javascript
const { authenticateUser, getHardwareID, question } = require('./autholas');

class AuthManager {
    constructor() {
        this.sessionToken = null;
        this.hwid = getHardwareID();
    }
    
    async login() {
        const username = await question('Username: ');
        const password = await question('Password: ');
        
        const result = await authenticateUser(username, password, this.hwid);
        
        if (result.success) {
            this.sessionToken = result.sessionToken;
            return true;
        }
        return false;
    }
    
    isAuthenticated() {
        return this.sessionToken !== null;
    }
    
    getToken() {
        return this.sessionToken;
    }
}

// Usage
async function main() {
    const auth = new AuthManager();
    
    if (await auth.login()) {
        console.log('Access granted!');
        // Start your application
        startApp(auth.getToken());
    } else {
        console.log('Access denied!');
        process.exit(1);
    }
}

function startApp(token) {
    console.log(`Application started with token: ${token}`);
    // Your application logic here
}

main().catch(console.error);
```

## Environment Variables

For production, use environment variables:

```javascript
// In autholas.js
const API_KEY = process.env.AUTHOLAS_API_KEY || 'YOUR_API_KEY_HERE';
const API_URL = process.env.AUTHOLAS_API_URL || 'https://autholas.web.id/api/auth';
```

Create a `.env` file:
```bash
AUTHOLAS_API_KEY=your_actual_api_key_here
AUTHOLAS_API_URL=https://autholas.web.id/api/auth
```

Install and use dotenv:
```bash
npm install dotenv
```

```javascript
// At the top of your main.js
require('dotenv').config();
```

## Troubleshooting

### Common Issues

1. **Error: Cannot find module 'axios'**
   ```bash
   npm install axios
   ```

2. **ECONNREFUSED errors**
   - Check internet connection
   - Verify API URL is correct
   - Check if firewall is blocking the connection

3. **Request timeout**
   - Increase timeout in axios config
   - Check network stability

4. **SSL/TLS errors**
   ```bash
   npm update
   # Or disable SSL verification (not recommended)
   process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
   ```

### Testing Connection

```javascript
const axios = require('axios');

async function testConnection() {
    try {

        const response = await axios.get('https://httpbin.org/status/200', { timeout: 5000 });

