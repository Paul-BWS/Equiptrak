# EquipTrack Deployment Guide

This guide covers both development workflow and production deployment for the EquipTrack application.

## Development Workflow

### Starting and Stopping Servers

We've created a simple bash script to manage your development servers:

```bash
# Start both API and frontend servers
./scripts/server-manager.sh start

# Check server status
./scripts/server-manager.sh status

# Stop all servers
./scripts/server-manager.sh stop

# Restart all servers
./scripts/server-manager.sh restart
```

Alternatively, you can use npm scripts directly:

```bash
# Start both servers (API on port 3001, frontend on port 3000)
npm run dev:start

# Stop all servers
npm run dev:stop
```

### Development URLs

- Frontend: http://localhost:3000
- API Server: http://localhost:3001

## Production Deployment

### Building for Production

To build the application for production:

```bash
# Build the frontend
npm run build:all
```

This will:
1. Compile the TypeScript code
2. Build the frontend into the `dist` directory
3. Prepare everything for production deployment

### Starting in Production Mode

To start the production server:

```bash
# Start the API server in production mode
npm run start:prod
```

In production mode:
1. JWT tokens will expire after 30 days (instead of 7 days in development)
2. Performance optimizations will be enabled
3. Detailed logging will be reduced

### Environment Variables

For production, make sure to set these environment variables:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-secret-key-here
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
```

### Deployment Options

#### Option 1: Basic Server Deployment

1. Clone the repository to your server
2. Install dependencies with `npm install --production`
3. Build the application with `npm run build:all`
4. Set up environment variables
5. Start the server with `npm run start:prod`
6. Use a process manager like PM2 to keep the server running

```bash
# Install PM2 if you haven't already
npm install -g pm2

# Start the app with PM2
pm2 start npm --name "equiptrak" -- run start:prod

# Other useful PM2 commands
pm2 status
pm2 logs equiptrak
pm2 restart equiptrak
```

#### Option 2: Docker Deployment

If you prefer using Docker, you can create a Dockerfile and docker-compose.yml file for your deployment.
For detailed instructions on Docker deployment, please refer to the Docker documentation.

## Troubleshooting

### Authentication Issues

If you're experiencing token expiration issues:

1. Try logging in again to get a fresh token
2. Check that your system clock is synchronized correctly
3. Verify that the JWT_SECRET environment variable is consistent

### Connection Issues

If the API server is not accessible:

1. Verify the API server is running with `./scripts/server-manager.sh status`
2. Check that ports 3000 and 3001 are not blocked by a firewall
3. Look at the server logs for any error messages

### Database Issues

If you encounter database connection problems:

1. Verify your database credentials in the .env file
2. Check that the database server is running
3. Make sure the database has the necessary tables and schema 