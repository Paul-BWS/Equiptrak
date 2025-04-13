

## Project info


This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS




# EquipTrack

EquipTrack is a comprehensive equipment tracking and servicing application designed for businesses that need to manage and maintain industrial equipment.

## Current Configuration

### Important Setup Details
- Backend runs on port 3001 (Express server)
- Frontend runs on port 5173 (Vite development server)
- Uses self-hosted PostgreSQL database (no Supabase)
- Database host: 185.25.144.64
- JWT authentication with token expiration
- Main server file: server/index.js

### Server Commands
```bash
# Kill all Node processes
pkill -f node
# or
killall node

# Start backend server (from project root)
cd server && PORT=3001 node index.js

# Start frontend server (from project root)
npm run dev
```

## Features

- Equipment tracking and management
- Service scheduling and history
- Company and customer management
- Administrator and user interfaces
- JWT-based authentication
- Responsive design for desktop and mobile
- Product management and pricing
- Work order management

## Technologies

- React 18+ (with Vite)
- TypeScript
- Express.js backend API
- Self-hosted PostgreSQL database
- TailwindCSS & shadcn/ui
- JWT authentication

## Getting Started

To set up the development environment:

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Ensure PostgreSQL server is running
4. Set up environment variables in server/.env:
```env
PORT=3001
JWT_SECRET=your_jwt_secret
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_HOST=185.25.144.64
POSTGRES_PORT=5432
POSTGRES_DB=your_db_name
```
5. Start the servers:
   - Backend: `cd server && PORT=3001 node index.js`
   - Frontend: `npm run dev`

## Database Tables
Key tables in the system:
- users (authentication and user management)
- companies (client company information)
- products (equipment and parts catalog)
- equipment (installed equipment tracking)
- service_records (maintenance history)
- work_orders (service scheduling)

## Troubleshooting

### Common Issues and Solutions

#### Blank Screen in Browser
1. Check browser console for errors
2. Verify both servers are running
3. Check authentication token in localStorage
4. Ensure database connection is active

#### Server Won't Start
1. Check if port 3001 is already in use
2. Verify PostgreSQL connection
3. Confirm all environment variables are set
4. Check server logs for specific errors

#### Authentication Issues
1. Clear browser localStorage
2. Verify JWT_SECRET in .env
3. Check token expiration
4. Confirm database connection

## Additional Notes
- Frontend uses Vite for development
- API endpoints are authenticated using JWT tokens
- Database backups are stored in /backups with date stamps
- Server logs are available in /server/logs
- Environment configurations are separate for development and production

For deployment information, refer to DEPLOYMENT.md in this repository.
