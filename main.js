const { authenticateUser, getHardwareID, question } = require('./autholas');

async function main() {
    console.log('═════════════════════════════════');
    console.log('      Autholas Login System      ');
    console.log('       NodeJS Example Code       ');
    console.log('═════════════════════════════════');
    
    const username = await question('Username: ');
    const password = await question('Password: '); // Use questionHidden for hidden input
    const hwid = getHardwareID();
    
    console.log(`Device ID: ${hwid.substring(0, 8)}...`); // Show partial HWID for debugging
    
    const result = await authenticateUser(username, password, hwid);
    
    if (result.success) {
        // User authenticated - start your application
        console.log('\nAuthentication successful!');
        console.log('Starting application...');
        // Your app logic here
        startApplication(result.sessionToken);
    } else {
        console.log('\nAuthentication failed.');
        
        // Provide helpful information based on error code
        if (result.errorCode === 'MAX_DEVICES_REACHED') {
            console.log('Tip: Contact support to reset your device limit or login from a previously used device.');
        } else if (result.errorCode === 'HWID_BANNED') {
            console.log('Tip: This specific device has been banned. Try from a different device or contact support.');
        } else if (result.errorCode === 'INVALID_CREDENTIALS') {
            console.log('Tip: Double-check your username and password spelling.');
        }
        
        await question('Press Enter to exit...');
        process.exit(1);
    }
}

function startApplication(sessionToken) {
    // Your application logic here
    console.log('Application started successfully!');
    // Store session token for API calls
    console.log(`Session token: ${sessionToken}`);
}

// Start the application
main().catch(console.error);