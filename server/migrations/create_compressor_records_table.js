module.exports = {
  name: 'create_compressor_records_table',
  description: 'Creates the compressor_records table if it does not exist',
  
  async up(client) {
    console.log('Creating compressor_records table if it does not exist...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS compressor_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL,
        engineer_name VARCHAR(255) NOT NULL,
        test_date DATE NOT NULL,
        retest_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        certificate_number VARCHAR(50),
        notes TEXT,
        equipment_name VARCHAR(255),
        equipment_serial VARCHAR(100) NOT NULL,
        compressor_model VARCHAR(255),
        pressure_test_result VARCHAR(50),
        safety_valve_test VARCHAR(50),
        oil_level VARCHAR(50),
        belt_condition VARCHAR(50),
        filter_check_result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Done creating compressor_records table');
    
    // Check if the uuid-ossp extension is available and enabled
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    return true;
  },
  
  async down(client) {
    console.log('Removing compressor_records table...');
    
    // In a real production environment, you might want to 
    // be more careful about dropping tables
    await client.query(`DROP TABLE IF EXISTS compressor_records;`);
    
    console.log('Done removing compressor_records table');
    
    return true;
  }
}; 