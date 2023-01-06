const { DataTypes } = require('sequelize');
const User = require('./User');
const db = require('../database/connDB');

const Movies = db.define('Movie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,        
    },
    commentary: {
        type: DataTypes.TEXT,
        allowNull: false,        
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: false,        
    },
    movieImage: {
        type: DataTypes.STRING,
        allowNull: false,        
    } 
})

User.hasMany(Movies);
Movies.belongsTo(User);

module.exports = Movies;