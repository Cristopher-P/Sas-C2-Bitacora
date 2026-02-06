const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.MYSQL_URL);

module.exports = pool;
