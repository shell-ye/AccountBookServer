const DbClient = require('ali-mysql-client')

const db = new DbClient({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'AccountBook'
})

module.exports = db