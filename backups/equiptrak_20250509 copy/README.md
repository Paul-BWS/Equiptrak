

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

# Equipment Page Implementation Guide

## Overview
This guide provides a standardized template for implementing new equipment types in the EquipTrack system. Following these standards ensures consistency across the application, reduces bugs, and streamlines development.

> **Current Standard:** All new equipment implementations should follow the pattern established in the Lift Service pages (list, add, edit). The Compressors implementation has been updated to match this pattern and serves as a reference example.

## Directory Structure
For each equipment type, use the following structure:
```
/src
  /pages
    /[EquipmentType]Page.tsx          # List view page
    /Add[EquipmentType]Page.tsx       # Add new record page
    /Edit[EquipmentType]Page.tsx      # Edit existing record
  /components
    /[equipment-type]
      /forms
        [EquipmentType]Form.tsx       # Reusable form component
```

## Standard Implementation Checklist

### 1. API Endpoints
- GET `/api/[equipment-type]?company_id=[id]` - List records
- GET `/api/[equipment-type]/[id]` - Get single record
- POST `/api/[equipment-type]` - Create record
- PUT `/api/[equipment-type]/[id]` - Update record
- DELETE `/api/[equipment-type]/[id]` - Delete record

### 2. Database Table
- Follow naming convention: `[equipment_type]_records`
- Include standard fields:
  - `id` (UUID, primary key)
  - `company_id` (UUID, foreign key)
  - `equipment_name` (VARCHAR)
  - `equipment_serial` (VARCHAR)
  - `service_date` (TIMESTAMP)
  - `certificate_number` (VARCHAR)
  - `status` (VARCHAR)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - Equipment-specific fields as needed

### 3. List Page Template
Use the LiftServiceList pattern:
```tsx
export default function EquipmentTypePage() {
  // State management
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(location.search).get('companyId');
  
  // Fetch records on mount
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!companyId) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/[equipment-type]?company_id=${companyId}`, {
          headers: getAuthHeaders()
        });
        
        setRecords(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching records:', err);
        
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setRecords([]); // Empty array for no records
          setError(null);
        } else {
          setError('Failed to load records. Please try again later.');
        }
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [companyId]);

  // Navigation handlers
  const handleAddNew = () => {
    navigate(`/add-[equipment-type]?companyId=${companyId}`);
  };
  
  // UI with standard states
  return (
    <>
      {/* Header with back/title/add buttons */}
      {/* Loading state */}
      {/* Error state */}
      {/* No records state with icon and helpful text */}
      {/* Records list with actions */}
    </>
  );
}
```

### 4. Add/Edit Page Template
Standalone page with form:
```tsx
export default function AddEquipmentTypePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(location.search).get('companyId');
  
  const handleSubmit = async (formData) => {
    try {
      await axios.post('/api/[equipment-type]', formData, {
        headers: getAuthHeaders()
      });
      toast.success('Record created successfully');
      navigate(`/[equipment-type]?companyId=${companyId}`);
    } catch (err) {
      toast.error('Failed to create record');
      console.error(err);
    }
  };
  
  const handleCancel = () => {
    navigate(`/[equipment-type]?companyId=${companyId}`);
  };
  
  return (
    <>
      {/* Header with title */}
      {/* Reusable form component */}
      <EquipmentTypeForm
        companyId={companyId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
}
```

### 5. Error Handling Standards
- Distinguish between empty data and actual errors
- For 404 responses, treat as empty data, not error
- For actual errors, display error message
- Never show error toast for empty datasets
- Always log detailed errors to console
- Customize empty state message based on context (no company, empty records, etc.)

### 6. UI Component Standards
- Back button: Top left - "< Back"
- Add button: Top right with plus icon - "+ Add [Equipment Type]"
- Colors: Dark mode #a6e15a, Light mode #FFFFFF with thin border
- Empty state: Icon, heading, description, action button
- Error state: Red card with error text
- Loading state: Centered spinner

### 7. Testing Checklist
For each new equipment implementation:
- Verify list page loads with company ID
- Test empty state display
- Test adding new record
- Test viewing/editing existing record
- Test error handling
- Test navigation flow
- Verify consistent styling

## Equipment Implementation Guidelines

### UI/UX Standards Based on Spot Welder Implementation
The spot welder implementation establishes the new standard for equipment page layouts. All future equipment types should follow this pattern:

1. **Single Page Layout**
   - Display all content on a single page without tabs
   - Use separate cards with clear section headers to organize content
   - This makes data verification easier (no need to click between tabs)

2. **Form Design**
   - Use consistent input heights (h-12)
   - Apply gray backgrounds to all inputs (bg-gray-100)
   - Include placeholder text for important fields
   - Group related fields in appropriate grid layouts
   - Keep form sections focused and concise (<200 lines per file)

3. **Certificate Numbering**
   - Auto-generate sequential certificate numbers with appropriate prefix
     - Example: SW-0001, SW-0002 for spot welders
   - Make certificate number fields read-only to prevent manual editing
   - Fetch the highest existing number and increment for new records

4. **Button Styling**
   - Back button: Outline variant with arrow left icon
   - Create/Save button: Green (#21c15b) with white text and appropriate icon
   - Position Create button at top right of header

### Data Handling Standards

1. **Numeric Field Handling**
   - Convert empty strings to null for all numeric database fields
   - Apply this conversion both client-side and server-side
   - Fields like voltage, pressure, dimensions must handle empty inputs gracefully

2. **Default Values**
   - Status: Always set to "Active" for new records
   - Equipment type: Pre-populate with the appropriate type
   - Service date: Default to current date
   - Retest date: Auto-calculate (typically 364 days from service date)

3. **Date Handling**
   - Use consistent date format (YYYY-MM-DD)
   - Implement auto-calculation for related dates
   - Display dates in localized format for users

### Server Implementation Best Practices

1. **Dynamic Query Construction**
   - Build INSERT/UPDATE queries dynamically based on database schema
   - This prevents "more target columns than expressions" errors
   - Automatically handle schema changes without code modifications

2. **Error Handling**
   - Implement comprehensive error logging on both client and server
   - Return specific error messages for better debugging
   - Handle SQL type mismatches (especially for numeric fields)

3. **API Routes**
   - Follow RESTful patterns for all equipment types
   - Include detailed documentation in route handlers
   - Log received data for debugging purposes

### Implementation Process
1. Create database table with appropriate schema
2. Implement server-side routes with dynamic query handling
3. Build frontend single-page layout with distinct sections
4. Implement auto-generated certificate numbers
5. Add proper validation and error handling
6. Test with various data scenarios

This approach ensures consistent implementation across all equipment types while providing a clean, user-friendly interface for data entry and review.

## Implementation Steps
1. Create database table for equipment type
2. Add API endpoints to server
3. Create List page with standard patterns
4. Create Add/Edit pages with forms
5. Test thoroughly using checklist

## Port Configuration
- Main server: 3001
- Debug server: 3456 (for testing)
- Frontend: 5173

To avoid port conflicts:
```bash
# Check running servers
lsof -i :3001
# Kill processes
kill -9 [PID]
# Or run on alternative port
PORT=3002 node server/index.js
```
