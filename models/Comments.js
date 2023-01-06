const db = require('../database/connDB');
const User = require('./User');
const Movie = require('./Movie');
const { DataTypes } = require('sequelize');

const Commentary = db.define('Comments', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

Commentary.belongsTo(Movie);
Commentary.belongsTo(User);
Movie.hasMany(Commentary);

module.exports = Commentary;