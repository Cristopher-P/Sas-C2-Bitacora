const mysql = require('mysql2');

const pool = mysql.createPool(process.env.MYSQL_URL);
console.log('MYSQL_URL:', process.env.MYSQL_URL ? 'OK' : 'NO DEFINIDA');

module.exports = pool.promise();
