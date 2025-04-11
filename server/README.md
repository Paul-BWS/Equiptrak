# EquipTrak Server

This is the backend server for EquipTrak, handling API requests, database operations, and authentication.

## Setup

1. Make sure you have Node.js installed
2. Install dependencies:
   ```
   cd server
   npm install
   ```
3. Create a `.env` file in the server directory with proper configuration

## Starting the Server

There are multiple server files in this directory, which can cause confusion.
The recommended way to start the server is:

```bash
# Kill any existing Node processes to prevent port conflicts
pkill -f node || true

# Start the server on port 3001
cd server cd server && PORT=3001 node start.jscd server && PORT=3001 node start.js node server-start.js
```

In a separate terminal, start the frontend:

```bash
# Start the frontend on port 3000
cd .. && PORT=3000 npm run dev
```

## Troubleshooting

If the service-records endpoints are not working:

1. First check that the service_records table exists in the database:
   ```
   cd server && node check-service-records-table.js
   ```

2. If the table doesn't exist, the above script will create it automatically.

3. Make sure you're using the correct server file. The `start.js` script will use `simple-server.js` which has all the necessary routes.

## API Endpoints

The server provides the following main endpoints:

- Authentication: `/api/auth/login`
- Companies: `/api/companies`
- Contacts: `/api/companies/:id/contacts`
- Notes: `/api/companies/:id/notes`
- Service Records: `/api/service-records`

## Server Files

- `start.js` - **Use this to start the server** (calls simple-server.js)
- `simple-server.js` - Simplified server with all essential endpoints
- `index.js` - Original full server (more complex, may have issues)
- `server-start.js` - Legacy startup script (calls simple-server.js)
- `check-service-records-table.js` - Utility to check/create the service_records table 