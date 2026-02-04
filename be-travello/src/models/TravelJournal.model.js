const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const initTravelJournal = async () => {
  try {
    // Check if model is already initialized
    if (global.sequelize && global.sequelize.models.TravelJournal) {
      return global.sequelize.models.TravelJournal;
    }

    const { sequelize } = require('../config/database.config.js');
    
    // Define TravelJournal model
    const TravelJournal = sequelize.define('TravelJournal', {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        defaultValue: () => uuidv4()
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name is required'
          }
        }
      },
      cover: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Cover image is required'
          }
        }
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: DataTypes.ENUM('active', 'expired'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'travel_journals',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['name'],
          unique: true
        },
        {
          fields: ['status']
        },
        {
          fields: ['created_at']
        }
      ]
    });

    // Sync the model with database
    await TravelJournal.sync({ alter: true });
    
    // Make model globally available
    global.sequelize = global.sequelize || {};
    global.sequelize.models = global.sequelize.models || {};
    global.sequelize.models.TravelJournal = TravelJournal;
    
    console.log('✅ TravelJournal model connected to phpMyAdmin database');
    return TravelJournal;
    
  } catch (error) {
    console.error('❌ Failed to initialize TravelJournal model:', error);
    throw error;
  }
};

const TravelJournal = {
  init: initTravelJournal,
  
  // Helper function to get model
  getModel: () => {
    if (!global.sequelize?.models?.TravelJournal) {
      throw new Error('TravelJournal model not initialized. Call init() first.');
    }
    return global.sequelize.models.TravelJournal;
  },
  
  // Find by name
  findByName: async (name) => {
    const Model = TravelJournal.getModel();
    return await Model.findOne({ where: { name } });
  },
  
  // Create new travel journal
  create: async (data) => {
    const Model = TravelJournal.getModel();
    return await Model.create(data);
  },
  
  // Find all
  findAll: async (options = {}) => {
    const Model = TravelJournal.getModel();
    return await Model.findAll(options);
  },
  
  // Find by ID
  findById: async (id) => {
    const Model = TravelJournal.getModel();
    return await Model.findByPk(id);
  },
  
  // Update by ID
  updateById: async (id, data) => {
    const Model = TravelJournal.getModel();
    const journal = await Model.findByPk(id);
    if (!journal) {
      throw new Error('Travel journal not found');
    }
    return await journal.update(data);
  },
  
  // Delete by ID
  deleteById: async (id) => {
    const Model = TravelJournal.getModel();
    const journal = await Model.findByPk(id);
    if (!journal) {
      throw new Error('Travel journal not found');
    }
    return await journal.destroy();
  },
  
  // Find expired journals (older than 24 hours)
  findExpired: async () => {
    const Model = TravelJournal.getModel();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await Model.findAll({
      where: {
        createdAt: {
          [require.Op.lt]: twentyFourHoursAgo
        }
      }
    });
  },
  
  // Delete expired journals
  deleteExpired: async () => {
    const expiredJournals = await TravelJournal.findExpired();
    const ids = expiredJournals.map(journal => journal.id);
    const Model = TravelJournal.getModel();
    return await Model.destroy({
      where: {
        id: ids
      }
    });
  }
};

module.exports = TravelJournal;
