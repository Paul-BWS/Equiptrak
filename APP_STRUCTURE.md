# EquipTrack Application Structure

<<<<<<< HEAD
## Core Components

### Authentication & User Management
- `src/contexts/AuthContext.tsx` - Authentication context and user state management
- `src/pages/Login.tsx` - Login page with version tracking
- User roles: admin, user

### Navigation & Layout
- `src/App.tsx` - Main routing and layout structure
- `src/components/Layout.tsx` - Main application layout
- `src/components/Sidebar.tsx` - Navigation sidebar

### Company Management
- `src/pages/CompanyDetails.tsx` - Company details and equipment overview
- `src/pages/Dashboard.tsx` - User dashboard with company list
- `src/pages/AdminDashboard.tsx` - Admin dashboard

### Work Orders System (v1.0.7)
- `src/pages/WorkOrderPage.tsx` - Unified work order creation/editing
  - Unsaved changes protection
  - Dynamic form validation
  - Line items management
  - Status tracking
- `src/pages/WorkOrdersList.tsx` - Work orders overview
- `src/components/work-orders/ProductSelector.tsx` - Product selection interface

### Equipment Management
- Base equipment tracking
- Specialized equipment types:
  - Compressors
  - Spot Welders
  - Lifts
- Each type follows standard implementation pattern

### Service Management
- Service scheduling
- Service history tracking
- Certificate generation
- Inspection records

## Database Structure

### Core Tables
- users
- companies
- products
- equipment
- service_records
- work_orders

### Equipment-Specific Tables
- compressor_records
- spot_welder_records
- lift_service_records

## API Structure

### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/verify

### Companies
- GET /api/companies
- GET /api/companies/:id
- POST /api/companies
- PUT /api/companies/:id

### Work Orders
- GET /api/work-orders
- GET /api/work-orders/:id
- POST /api/work-orders
- PUT /api/work-orders/:id
- DELETE /api/work-orders/:id

### Equipment
- GET /api/equipment
- Equipment-specific endpoints for each type

## Frontend Architecture

### State Management
- React Context for global state
- Local state for component-specific data
- Form state management

### UI Components
- shadcn/ui component library
- Custom components in src/components
- Responsive design patterns

### Routing
- React Router v6
- Protected routes
- Role-based access control

## Development Workflow

### Version Control
- Git branching strategy
- Version tracking in Login.tsx
- Backup system in /backups

### Development Environment
- Vite development server (port 5173)
- Express backend (port 3001)
- PostgreSQL database

### Deployment
- Vercel hosting
- Environment-specific configurations
- Database migration system 
=======
## Overview
EquipTrack is a full-stack application for equipment tracking and servicing, built with:
- Frontend: Vite + React + TypeScript
- Backend: Express.js API
- Database: PostgreSQL

## Directory Structure

```
equiptrak-vite/
├── src/                      # Frontend source code
│   ├── components/          # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── contacts/       # Contact management components
│   │   ├── work-orders/    # Work order related components
│   │   └── spot-welder/    # Spot welder specific components
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ThemeContext.tsx# Theme management
│   ├── lib/               # Utility functions and helpers
│   ├── pages/             # Page components
│   └── styles/            # Global styles
├── server/                 # Backend Express.js server
│   ├── index.js           # Main server file
│   ├── routes/            # API route handlers
│   │   ├── compressors.js
│   │   ├── spot-welders.js
│   │   ├── service-records.js
│   │   └── work-orders.js
│   └── src/              # Server source code
│       └── services/     # External service integrations
├── public/               # Static assets
└── backups/             # Database backups

## Key Features

### Authentication
- JWT-based authentication
- Role-based access control (Admin/User)
- Company-specific access restrictions

### Equipment Management
1. Spot Welders
   - Service records
   - Certification tracking
   - Testing results

2. Compressors
   - Maintenance history
   - Performance metrics
   - Service scheduling

3. Work Orders
   - Creation and tracking
   - Assignment to engineers
   - Status updates
   - Parts and labor tracking

### Company Management
- Company profiles
- Contact management
- Service history
- Equipment inventory

### Product Management
- Shopify integration
- Price management
- Inventory tracking
- Cost tracking

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/refresh - Refresh token

### Companies
- GET /api/companies - List all companies
- POST /api/companies - Create new company
- GET /api/companies/:id - Get company details
- PUT /api/companies/:id - Update company
- GET /api/companies/:id/contacts - Get company contacts
- GET /api/companies/:id/notes - Get company notes
- POST /api/companies/:id/notes - Add company note

### Equipment
- GET /api/companies/:id/equipment - List company equipment
- GET /api/spot-welders - List spot welders
- GET /api/compressors - List compressors
- POST /api/service-records - Create service record

### Work Orders
- GET /api/work-orders - List work orders
- POST /api/work-orders - Create work order
- GET /api/work-orders/:id - Get work order details
- PUT /api/work-orders/:id - Update work order
- DELETE /api/work-orders/:id - Delete work order

### Products
- GET /api/products - List products
- POST /api/products/sync - Sync with Shopify
- PATCH /api/products/:id/price - Update product price
- PATCH /api/products/:id/cost_price - Update product cost

## Database Schema

### Key Tables
1. users
   - Authentication and user management
   - Role-based access control

2. companies
   - Company information
   - Contact details
   - Service history

3. contacts
   - Company contact persons
   - Role and access management

4. service_records
   - Equipment service history
   - Certification tracking
   - Engineer assignments

5. work_orders
   - Service scheduling
   - Task management
   - Parts and labor tracking

6. products
   - Equipment catalog
   - Pricing information
   - Shopify integration

## Development Guidelines

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling

### State Management
- Use React Context for global state
- Local state for component-specific data
- Redux not required for current scope

### API Integration
- Axios for HTTP requests
- JWT token management
- Error handling middleware

### Testing
- Jest for unit tests
- React Testing Library
- API endpoint testing

### Security
- JWT authentication
- Role-based access control
- Input validation
- SQL injection prevention

## Deployment
- Frontend: Vercel
- Backend: Custom hosting
- Database: Self-hosted PostgreSQL
- Environment-specific configurations 
>>>>>>> development
