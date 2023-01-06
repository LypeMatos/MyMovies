require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_ADMIN, process.env.DB_PASS, {
    host: 'localhost',
    dialect:'mysql'
})

try{
    sequelize.authenticate();
    console.log('Conectado ao banco de dados');
}catch(error){
    console.log('Não foi possível se conectar: ' + error);
}

module.exports = sequelize;