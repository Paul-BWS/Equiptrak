# Spot Welders Setup Guide

This guide walks you through adding Spot Welders equipment records to EquipTrack.

## Setup Process

The setup process involves:
1. Creating a new database table for spot welder records
2. Registering API routes for spot welder data
3. Connecting the frontend to the new API endpoints

## Automated Setup

We've created an automated setup script that handles most of the work for you:

```bash
# Run the setup script from the project root
node setup-spot-welders.js
```

This script will:
- Create the `spot_welder_records` table in the database
- Register the spot-welders API routes in the server
- Verify that everything was set up correctly

## Manual Setup (if needed)

If you prefer to run the individual steps manually:

### 1. Create the database table

```bash
cd server
node create-spot-welder-table.js
```

### 2. Register the API routes

```bash
cd server
node register-spot-welders-route.js
```

### 3. Verify the setup

```bash
cd server
node check-spot-welder-table.js
```

## Using Spot Welders Feature

Once set up, follow these steps to use the new feature:

1. Restart the server:
   ```bash
   cd server
   node index.js
   ```

2. Start the frontend if not already running:
   ```bash
   npm run dev
   ```

3. Navigate to Equipment Types page for a company:
   ```
   http://localhost:5173/equipment-types?companyId=<company_id>
   ```

4. Click on the "Spot Welders" icon to access the spot welders list.

## Troubleshooting

If you encounter any issues:

- Check the console output for detailed error messages
- Verify database connection
- Make sure the server is restarted after setup
- Confirm your company ID is valid
- Check browser console for frontend errors

If problems persist, run the verification script:
```bash
cd server
node check-spot-welder-table.js
```

## Structure

- **Database**: `spot_welder_records` table with fields like `id`, `company_id`, `equipment_name`, `service_date`, etc.
- **API Endpoints**: 
  - GET /api/spot-welders - List all spot welders
  - GET /api/spot-welders/:id - Get a specific spot welder
  - POST /api/spot-welders - Create a new spot welder
  - PUT /api/spot-welders/:id - Update a spot welder
  - DELETE /api/spot-welders/:id - Delete a spot welder
- **Frontend**: Updated `/spot-welders` page that connects to these endpoints

## Fields Available for Spot Welders

- `equipment_name`: Name of the spot welder
- `equipment_serial`: Serial number
- `engineer_name`: Name of engineer who performed service
- `service_date`: Date of service
- `retest_date`: Date of next required service
- `status`: Current status (valid, overdue, etc.)
- `certificate_number`: Certificate reference
- `notes`: Additional notes
- `manufacturer`: Device manufacturer
- `model`: Model number
- `location`: Physical location
- `primary_voltage_test`: Test result
- `secondary_voltage_test`: Test result
- `weld_time_test`: Test result
- `visual_inspection`: Test result
- `tip_condition`: Test result
- `weld_test_result`: Test result
- `electrode_alignment`: Test result
- `pressure_test_result`: Test result
- `timer_test_result`: Test result 