# EquipTrack Deployment Checklist

Use this checklist to ensure you have properly prepared your application for deployment to JustHost.

## Before Deployment

- [ ] Update `.env.production` with actual values:
  - [ ] Set a strong `JWT_SECRET`
  - [ ] Configure database connection details to your on-premises SQL server
  - [ ] Update `CORS_ORIGIN` to match your domain

- [ ] Test database connection:
  - [ ] Run `node scripts/test-db-connection.js` to verify connectivity
  - [ ] Ensure your SQL server allows remote connections
  - [ ] Configure any necessary firewall rules to allow connections

- [ ] Prepare hosting environment:
  - [ ] Verify Node.js support on JustHost
  - [ ] Check for any hosting-specific requirements or limitations

## Deployment Process

- [ ] Create deployment package:
  - [ ] Run `npm run deploy` to generate the deployment package
  - [ ] Verify the `deploy` directory contains all necessary files

- [ ] Upload to JustHost:
  - [ ] Use FTP to upload all files from the `deploy` directory
  - [ ] Set proper permissions on all uploaded files (usually 644 for files, 755 for directories)

- [ ] Configure JustHost:
  - [ ] Set up Node.js in the control panel
  - [ ] Configure the application entry point to `src/server/api.js`
  - [ ] Set up environment variables if your hosting allows it

- [ ] Start the application:
  - [ ] Run `npm start` through the hosting control panel
  - [ ] Verify the application is running by visiting your domain

## Post-Deployment Verification

- [ ] Test core functionality:
  - [ ] Verify login/authentication is working
  - [ ] Check that database operations work properly
  - [ ] Test critical features of your application

- [ ] Check for errors:
  - [ ] Monitor server logs for any errors or warnings
  - [ ] Test with different browsers and devices
  - [ ] Verify API endpoints are accessible

- [ ] Security checks:
  - [ ] Ensure JWT tokens are working properly
  - [ ] Verify proper role-based access controls
  - [ ] Check for any exposed sensitive information

## Maintenance Plan

- [ ] Set up a regular backup schedule for your database
- [ ] Plan for future updates and how they will be deployed
- [ ] Document any hosting-specific details for future reference

## Notes and Issues

Use this section to document any issues encountered during deployment or specific configuration details:

```
# Example:
# 1. Had to modify Node.js version to 18.x to resolve compatibility issues
# 2. Added specific firewall rule to allow connections from JustHost IP range to SQL server
``` 