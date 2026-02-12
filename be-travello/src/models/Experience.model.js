const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database-mysql.config');

const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logoAlt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'experiences',
  timestamps: true,
  underscored: true
});

const initExperience = async () => {
  try {
    await sequelize.sync();
    console.log('Experience table synced successfully');
  } catch (error) {
    console.error('Error syncing Experience table:', error);
  }
};

module.exports = {
  Experience,
  initExperience
};
