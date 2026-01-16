const axios = require('axios');
const os = require('os');
const crypto = require('crypto');

// Your API configuration
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://autholas.web.id/api/auth';

function handleAuthError(errorCode, errorMessage) {
    const errorMessages = {
        'INVALID_CREDENTIALS': {
            title: 'Login Failed',
            message: 'Username or password is incorrect.\nPlease double-check your credentials and try again.'
        },
        'USER_BANNED': {
            title: 'Account Banned',
            message: 'Your account has been suspended.\nPlease contact support for assistance.'
        },
        'SUBSCRIPTION_EXPIRED': {
            title: 'Subscription Expired',
            message: 'Your subscription has ended.\nPlease renew your subscription to continue.'
        },
        'MAX_DEVICES_REACHED': {
            title: 'Device Limit Reached',
            message: 'Maximum number of devices exceeded.\nPlease contact support to reset your devices.'
        },
        'HWID_BANNED': {
            title: 'Device Banned',
            message: 'This device has been banned.\nPlease contact support for assistance.'
        },
        'INVALID_API_KEY': {
            title: 'Service Error',
            message: 'Authentication service unavailable.\nPlease try again later or contact support.'
        },
        'RATE_LIMIT_EXCEEDED': {
            title: 'Too Many Attempts',
            message: 'Please wait before trying again.'
        },
        'DEVELOPER_SUSPENDED': {
            title: 'Service Unavailable',
            message: 'Authentication service is temporarily unavailable.\nPlease contact support.'
        },
        'MISSING_PARAMETERS': {
            title: 'Invalid Request',
            message: 'Missing required parameters.\nPlease try again.'
        },
        'SERVICE_ERROR': {
            title: 'Service Error',
            message: 'Authentication service is temporarily unavailable.\nPlease try again later.'
        }
    };

    if (errorMessages[errorCode]) {
        const error = errorMessages[errorCode];
        console.log(error.title);
        console.log(error.message);
    } else {
        console.log(`Error: ${errorMessage}`);
    }
}

async function authenticateUser(username, password, hwid) {
    const payload = {
        api_key: API_KEY,
        username: username,
        password: password,
        hwid: hwid,
        device_name: 'User PC'
    };

    try {
        console.log('Authenticating...');
        
        const response = await axios.post(API_URL, payload, {
            timeout: 10000,
            validateStatus: function (status) {
                // Don't throw for any status code - we'll handle it manually
                return status < 500;
            }
        });

        if (response.data.success) {
            console.log('Login successful!');
            console.log(`Welcome, ${username}!`);
            
            // Display user info if available
            if (response.data.user && response.data.user.expires_at) {
                console.log(`Subscription expires: ${response.data.user.expires_at}`);
            }
            
            return {
                success: true,
                sessionToken: response.data.session_token
            };
        } else {
            // Handle specific errors with user-friendly messages
            const errorCode = response.data.error_code || 'UNKNOWN';
            const errorMessage = response.data.error || 'Unknown error';
            
            handleAuthError(errorCode, errorMessage);
            return { success: false, error: errorMessage, errorCode: errorCode };
        }
    } catch (error) {
        // Check if it's an HTTP error with response data
        if (error.response && error.response.data) {
            const errorCode = error.response.data.error_code || 'UNKNOWN';
            const errorMessage = error.response.data.error || 'Unknown error';
            
            handleAuthError(errorCode, errorMessage);
            return { success: false, error: errorMessage, errorCode: errorCode };
        }
        
        // Handle network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log('Connection Error: Unable to reach authentication server.');
            console.log('Please check your internet connection and try again.');
        } else if (error.code === 'ECONNABORTED') {
            console.log('Request Timeout: Server is taking too long to respond.');
            console.log('Please try again later.');
        } else {
            console.log(`Unexpected error: ${error.message}`);
        }
        return { success: false, error: error.message };
    }
}

function getHardwareID() {
    const hostname = os.hostname();
    const username = os.userInfo().username || 'unknown';
    const architecture = os.arch();
    const combined = `${hostname}|${username}|${architecture}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
}

function question(query) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

module.exports = {
    authenticateUser,
    getHardwareID,
    handleAuthError,
    question

};

