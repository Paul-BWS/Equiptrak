# EquipTrack Application Structure

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