# EquipTrack Deployment Guide for JustHost

This guide covers how to deploy EquipTrack to your JustHost domain with connection to your on-premises SQL server.

## Preparing for Deployment

1. **Build and package the application**:
   ```bash
   # From your local development environment
   npm run deploy
   ```
   This creates a `deploy` folder with everything needed for your application.

2. **Edit configuration for production**:
   Open `.env` in the deploy folder and update it with your production settings:
   - Set your strong JWT_SECRET
   - Configure database connection to your on-premises SQL server
   - Ensure NODE_ENV=production is set

## Uploading to JustHost

1. **Connect to your JustHost account using FTP**:
   - Use an FTP client like FileZilla
   - Connect to your JustHost FTP server
   - Navigate to your website's root directory or a subdirectory where you want to host the application

2. **Upload files**:
   - Upload all contents from the `deploy` folder to your server

3. **Set up Node.js**:
   - Log in to your JustHost control panel
   - Navigate to the "Software" or "Advanced" section
   - Find "Node.js" and enable it for your domain
   - Set the Node.js version to at least 16.x or higher
   - Set the application entry point to `src/server/api.js`

4. **Set up environment variables**:
   - In the JustHost control panel, find the section for environment variables
   - Add all the variables from your `.env` file

## Configuring for Your On-Premises SQL Server

1. **Network configuration**:
   - Ensure your SQL server is accessible from your JustHost server
   - You may need to:
     - Open specific ports on your network firewall
     - Set up a VPN connection
     - Configure your SQL server to accept remote connections

2. **Security considerations**:
   - Use a dedicated database user with limited permissions
   - Consider setting up a secure, encrypted connection
   - Regularly back up your database

## Starting the Application

In the JustHost control panel:

1. Find the "Node.js Applications" section
2. Create a new application pointing to your uploaded files
3. Set the start command to `npm run start:prod`
4. Start the application

## Troubleshooting

1. **Connection issues to your SQL server**:
   - Verify IP whitelisting on your firewall
   - Check that database credentials are correct
   - Test the connection using a simple script

2. **Application not starting**:
   - Check the error logs in the JustHost control panel
   - Verify that Node.js is properly configured
   - Ensure all dependencies are properly installed

3. **Token expiration issues**:
   - If users are still getting logged out too frequently, you may need to adjust the TOKEN_EXPIRY setting in your environment variables

## Maintenance

1. **Regular updates**:
   - When you make updates to your application:
     - Run `npm run deploy` locally
     - Upload the new deploy folder to your server
     - Restart the Node.js application

2. **Monitoring**:
   - Regularly check the logs for errors
   - Monitor database performance
   - Set up alerts for server downtime

3. **Database backups**:
   - Set up regular backups of your SQL database
   - Test restoring from backups periodically 