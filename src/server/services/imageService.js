// Image upload and storage service
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Base directory for all uploads
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} directory - Directory path to check/create
 */
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(`Creating directory: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
};

/**
 * Initialize the uploads directory structure
 */
const initializeDirectories = () => {
  console.log('Initializing upload directories...');
  
  // Ensure main uploads directory exists
  ensureDirectoryExists(UPLOADS_DIR);
  
  // Ensure entity-specific directories exist
  ensureDirectoryExists(path.join(UPLOADS_DIR, 'companies'));
  ensureDirectoryExists(path.join(UPLOADS_DIR, 'signatures'));
  ensureDirectoryExists(path.join(UPLOADS_DIR, 'equipment'));
  
  console.log('Upload directories initialized successfully');
};

/**
 * Save an uploaded file to disk
 * @param {Object} file - The uploaded file object (from multer or manually handled)
 * @param {string} entityType - Type of entity this file belongs to (companies, equipment, etc.)
 * @returns {Promise<Object>} - File metadata (fileName, filePath, etc.)
 */
const saveFile = async (file, entityType) => {
  // Generate a unique filename with original extension
  const fileExt = path.extname(file.originalname || 'unknown.jpg');
  const fileName = `${uuidv4()}${fileExt}`;
  
  // Determine the full save path based on entity type
  const saveDir = path.join(UPLOADS_DIR, entityType);
  ensureDirectoryExists(saveDir);
  
  const savePath = path.join(saveDir, fileName);
  const publicPath = `/uploads/${entityType}/${fileName}`;
  
  console.log(`Saving file to: ${savePath}`);
  
  return new Promise((resolve, reject) => {
    // Handle file based on whether it's a buffer (buffer) or from multer (stream)
    if (file.buffer) {
      // It's a buffer (e.g., from sharp or manually handled)
      fs.writeFile(savePath, file.buffer, (err) => {
        if (err) {
          console.error('Error saving file:', err);
          return reject(err);
        }
        
        resolve({
          fileName,
          filePath: publicPath,
          fileType: file.mimetype,
          fileSize: file.size
        });
      });
    } else if (file.path) {
      // It's from multer (already saved to disk)
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(savePath);
      
      readStream.on('error', (err) => {
        console.error('Error reading temporary file:', err);
        reject(err);
      });
      
      writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
        reject(err);
      });
      
      writeStream.on('finish', () => {
        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        resolve({
          fileName,
          filePath: publicPath,
          fileType: file.mimetype,
          fileSize: file.size
        });
      });
      
      readStream.pipe(writeStream);
    } else {
      // Direct handling of the file
      const fileStream = fs.createWriteStream(savePath);
      
      fileStream.on('error', (err) => {
        console.error('Error writing file:', err);
        reject(err);
      });
      
      fileStream.on('finish', () => {
        resolve({
          fileName,
          filePath: publicPath,
          fileType: file.mimetype,
          fileSize: file.size
        });
      });
      
      fileStream.write(file.buffer || file.data);
      fileStream.end();
    }
  });
};

/**
 * Save an image record in the database
 * @param {Object} db - Database connection
 * @param {Object} params - Image parameters
 * @returns {Promise<string>} - Image ID
 */
const saveImageRecord = async (db, { entityType, entityId, fileName, filePath, fileType, fileSize, userId }) => {
  console.log('Saving image record to database:', { entityType, entityId, fileName });
  
  const query = `
    INSERT INTO images (
      entity_type, 
      entity_id, 
      file_name, 
      file_path, 
      file_type, 
      file_size, 
      created_by
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  
  try {
    const result = await db.query(query, [
      entityType,
      entityId,
      fileName,
      filePath,
      fileType,
      fileSize,
      userId
    ]);
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving image record:', error);
    throw error;
  }
};

/**
 * Save a company logo
 * @param {Object} db - Database connection
 * @param {string} companyId - Company ID
 * @param {Object} file - Uploaded file
 * @param {string} userId - User ID who uploaded the file
 * @returns {Promise<Object>} - Image ID and URL
 */
const saveCompanyLogo = async (db, companyId, file, userId) => {
  console.log('Saving company logo for company:', companyId);
  
  try {
    // Save the logo file
    const fileInfo = await saveFile(file, 'companies');
    
    // Save the image record
    const imageId = await saveImageRecord(db, {
      entityType: 'companies',
      entityId: companyId,
      fileName: fileInfo.fileName,
      filePath: fileInfo.filePath,
      fileType: fileInfo.fileType,
      fileSize: fileInfo.fileSize,
      userId
    });
    
    // Update the company record with the logo URL
    const updateQuery = `
      UPDATE companies 
      SET logo_url = $1 
      WHERE id = $2
      RETURNING id, company_name, logo_url
    `;
    
    const updateResult = await db.query(updateQuery, [fileInfo.filePath, companyId]);
    
    if (updateResult.rows.length === 0) {
      throw new Error('Company not found or logo URL not updated');
    }
    
    console.log('Company logo updated successfully:', updateResult.rows[0]);
    
    return {
      id: imageId,
      logo_url: fileInfo.filePath,
      company: updateResult.rows[0]
    };
  } catch (error) {
    console.error('Error saving company logo:', error);
    throw error;
  }
};

/**
 * Save a base64 image string as a file
 * @param {Object} db - Database connection
 * @param {Object} params - Parameters containing base64String, entityType, entityId, etc.
 * @returns {Promise<Object>} - Image ID and URL
 */
const saveBase64Image = async (db, { base64String, entityType, entityId, fileName, userId }) => {
  console.log(`Saving base64 image for ${entityType} with ID ${entityId}`);
  
  try {
    // Remove the data URI prefix if present (e.g., "data:image/png;base64,")
    let data = base64String;
    let mimeType = 'image/png'; // Default MIME type
    
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      data = matches[2];
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(data, 'base64');
    
    // Create a file-like object for saveFile
    const file = {
      originalname: fileName || `${uuidv4()}.png`,
      buffer: buffer,
      mimetype: mimeType,
      size: buffer.length
    };
    
    // Save the file
    const fileInfo = await saveFile(file, entityType);
    
    // Save the image record
    const imageId = await saveImageRecord(db, {
      entityType,
      entityId,
      fileName: fileInfo.fileName,
      filePath: fileInfo.filePath,
      fileType: fileInfo.fileType,
      fileSize: fileInfo.fileSize,
      userId
    });
    
    return {
      id: imageId,
      url: fileInfo.filePath
    };
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
};

// Export all functions
module.exports = {
  ensureDirectoryExists,
  initializeDirectories,
  saveFile,
  saveImageRecord,
  saveCompanyLogo,
  saveBase64Image
}; 