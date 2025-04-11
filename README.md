

## Project info


This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS




# EquipTrack

EquipTrack is a comprehensive equipment tracking and servicing application designed for businesses that need to manage and maintain industrial equipment.

## Features

- Equipment tracking and management
- Service scheduling and history
- Company and customer management
- Administrator and user interfaces
- JWT-based authentication
- Responsive design for desktop and mobile

## Technologies

- React (with Vite)
- TypeScript
- Express.js backend API
- Self-hosted PostgreSQL database (no external service providers)
- TailwindCSS & shadcn/ui
- JWT authentication

## Getting Started

To set up the development environment:

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Start the development servers:
```
npm run dev:server
```

This will start the backend server from the `/server` directory on port 3001 and the frontend (Vite) on port 3000.

## Troubleshooting

### API Connection Issues

If you're experiencing issues with the frontend connecting to the API server, we've provided a diagnostic tool to help:

```
node scripts/fix-proxy.js
```

This script will:
- Check if both servers are running
- Test API connectivity
- Verify the Vite proxy configuration
- Provide recommendations to fix any issues

### Common Issues and Solutions

#### Blank Screen in the Browser
If you're seeing a blank screen when accessing the app:

1. Check the browser console for errors
2. Make sure both servers are running:
   ```
   npm run dev:server
   ```
3. Try accessing the test page to diagnose API connectivity:
   ```
   http://localhost:3000/test
   ```

#### Authentication Issues
If you're getting logged out frequently or seeing authentication errors:

1. Tokens expire after 7 days by default in development (30 days in production)
2. Check your browser storage to ensure cookies and localStorage are enabled
3. Try logging in again with the test credentials:
   - Admin: admin@equiptrak.com / admin@2024
   - User: user@equiptrak.com / user@2024

## Server Management

The main server file is `server/index.js`, which handles all API endpoints including:
- Authentication and user management
- Company and equipment management
- Service records and certificates
- Work orders and maintenance tracking

Server Commands:
- Start both servers: `npm run dev:server` (Backend on 3001, Frontend on 3000)
- Start backend only: `npm run server`
- Start frontend only: `npm run dev`
- Stop all servers: `npm run dev:stop`

Server Configuration:
- Default port: 3001 (configurable via PORT environment variable)
- Database connection: PostgreSQL (configured via environment variables)
- Authentication: JWT-based with token expiration
- CORS enabled for localhost:3000 and localhost:5173

Important Notes:
- Make sure PostgreSQL is running before starting the server
- Check .env file exists in the server directory with correct database credentials
- Server logs will show successful database connection on startup
- Test endpoint available at http://localhost:3001/api/test

## Additional Resources

For more detailed information about deployment, configuration, and advanced usage, please refer to the `DEPLOYMENT.md` file in this repository.
