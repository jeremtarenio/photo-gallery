const { createPool } = require('mysql');

const pool = createPool({
    port: process.env.AWS_DB_PORT,
    host: process.env.AWS_DB_HOST,
    user: process.env.AWS_DB_USER,
    password: process.env.AWS_DB_PASS,
    database: process.env.AWS_MYSQL_DB,
    connectionLimit: 10,
    multipleStatements: true,
    timezone: 'utc'
});


module.exports = pool;

