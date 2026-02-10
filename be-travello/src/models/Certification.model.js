const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'certifications',
  timestamps: true,
  underscored: true
});

const initCertification = async () => {
  try {
    await sequelize.sync();
    console.log('Certification table synced successfully');
  } catch (error) {
    console.error('Error syncing Certification table:', error);
  }
};

module.exports = {
  Certification,
  initCertification
};
