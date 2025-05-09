# EquipTrak Application Backups

This directory contains backups of the EquipTrak application. Each backup is a compressed tar archive containing all essential application files.

## Backup Contents

Each backup archive includes:
- Source code (`/src`)
- Server code (`/server`)
- Configuration files
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`
  - `tailwind.config.js`
  - Other configuration files
- Documentation files (`.md` files)
- Public assets (`/public`)

## Excluded from Backups
The following directories are excluded from backups as they can be regenerated:
- `node_modules/` (npm dependencies)
- `.git/` (version control data)
- `dist/` (build output)
- `.vercel/` (deployment data)
- `backups/` (backup archives)

## Backup Naming Convention
Backups are named using the following format:
```
equiptrak_YYYYMMDD.tar.gz
```
Where YYYYMMDD is the date the backup was created.

## How to Restore from Backup

1. **Extract the backup archive**
   ```bash
   cd /path/to/project
   tar -xzf backups/equiptrak_YYYYMMDD.tar.gz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run start
   ```

## Database Backup Note
These backups contain application code only. Database backups should be managed separately through your database management system.

## Latest Backup
The most recent backup is: `equiptrak_20250509.tar.gz` (3.2MB)
Created: May 9, 2025

## Creating New Backups
To create a new backup, run the following command from the project root:
```bash
tar --exclude='./node_modules' --exclude='./.git' --exclude='./dist' --exclude='./.vercel' --exclude='./backups' -czf backups/equiptrak_$(date +%Y%m%d).tar.gz .
```

## Backup Verification
After restoring from a backup, verify that:
1. All source files are present
2. Configuration files are properly set up
3. The application builds successfully
4. All routes and features work as expected

## Support
For backup-related issues or questions, please contact the development team. 