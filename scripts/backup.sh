#!/bin/bash

# Create timestamp for backup name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/backup_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Files and directories to backup
FILES_TO_BACKUP=(
    "src"
    "server"
    "public"
    "scripts"
    "tests"
    "package.json"
    "package-lock.json"
    "vite.config.ts"
    "tsconfig.json"
    "tsconfig.app.json"
    "tsconfig.node.json"
    "tailwind.config.ts"
    "postcss.config.js"
    "components.json"
    "eslint.config.js"
    "vercel.json"
    "README.md"
    "APP_STRUCTURE.md"
    "UI.md"
    "DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "HOSTING.md"
    "SPOT_WELDERS_SETUP.md"
)

# Create backup
echo "Creating backup in $BACKUP_DIR..."

# Use rsync to exclude node_modules and test folders
rsync -av --progress ./ "$BACKUP_DIR" \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude backups \
  --exclude "*/test" \
  --exclude "*/__tests__" \
  --exclude "*.log" \
  --exclude "*.DS_Store" \
  --exclude "*.zip" \
  --exclude "*.tar.gz" \
  --exclude "*.bak" \
  --exclude "*.backup*"

# Remove any test folders that may have been copied
find "$BACKUP_DIR" -type d -name "test" -exec rm -rf {} +
find "$BACKUP_DIR" -type d -name "__tests__" -exec rm -rf {} +

# Create a backup info file
echo "Backup created at: $(date)" > "$BACKUP_DIR/backup_info.txt"
echo "Backup directory: $BACKUP_DIR" >> "$BACKUP_DIR/backup_info.txt"
echo "Files included:" >> "$BACKUP_DIR/backup_info.txt"
for item in "${FILES_TO_BACKUP[@]}"; do
    echo "- $item" >> "$BACKUP_DIR/backup_info.txt"
done

# Create a zip archive
echo "Creating zip archive..."
cd backups
zip -r "backup_$TIMESTAMP.zip" "backup_$TIMESTAMP"
cd ..

echo "Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"
echo "Zip archive: backups/backup_$TIMESTAMP.zip" 