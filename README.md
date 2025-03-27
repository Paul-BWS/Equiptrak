# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c4a2989c-8c9f-4a33-8ad3-cd43f7fe2a6b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c4a2989c-8c9f-4a33-8ad3-cd43f7fe2a6b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c4a2989c-8c9f-4a33-8ad3-cd43f7fe2a6b) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

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
- PostgreSQL database
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
npm run dev:all
```

This will start both the frontend (Vite) and backend (Express.js) servers.

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
   npm run dev:all
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

- Start both servers: `npm run dev:all`
- Start frontend only: `npm run dev`
- Start API server only: `npm run api`
- Stop all servers: `npm run dev:stop`

## Additional Resources

For more detailed information about deployment, configuration, and advanced usage, please refer to the `DEPLOYMENT.md` file in this repository.
