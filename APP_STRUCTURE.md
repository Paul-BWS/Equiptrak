# EquipTrack Application Structure

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