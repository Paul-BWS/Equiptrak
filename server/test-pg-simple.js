require('dotenv').config();
const { Client } = require('pg');

console.log('Attempting to connect to PostgreSQL with these settings:');
console.log('Host:', process.env.POSTGRES_HOST);
console.log('Port:', process.env.POSTGRES_PORT);
console.log('Database:', process.env.POSTGRES_DB);
console.log('User:', process.env.POSTGRES_USER);
console.log('Password:', process.env.POSTGRES_PASSWORD ? '******' : 'not set');

const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  // Add a longer timeout
  connectionTimeoutMillis: 10000,
  // Add SSL mode
  ssl: false
});

console.log('Connecting to PostgreSQL...');
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('Current timestamp from database:', result.rows[0].now);
    return client.end();
  })
  .then(() => {
    console.log('Connection closed');
  })
  .catch(err => {
    console.error('Error:', err);
    client.end();
  }); 