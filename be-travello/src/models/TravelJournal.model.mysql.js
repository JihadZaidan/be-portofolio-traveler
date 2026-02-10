const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database-mysql.config.js');

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
  cover_image: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'cover_image',
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'travel_journals',
  timestamps: false,
  underscored: true
});

// Initialize database connection
const initTravelJournal = async () => {
  try {
    await sequelize.authenticate();
    // Don't auto-sync to avoid key limit issues
    console.log('✅ TravelJournal model initialized with MySQL');
  } catch (error) {
    console.error('❌ Failed to initialize TravelJournal model:', error);
    throw error;
  }
};

// Find all journals
const findAll = async (options = {}) => {
  try {
    const journals = await TravelJournal.findAll(options);
    return journals;
  } catch (error) {
    console.error('❌ Error getting all travel journals:', error);
    throw error;
  }
};

// Find by ID
const findById = async (id) => {
  try {
    const journal = await TravelJournal.findByPk(id);
    return journal;
  } catch (error) {
    console.error('❌ Error getting travel journal by ID:', error);
    throw error;
  }
};

// Create new journal
const create = async (data) => {
  try {
    console.log('📝 Creating travel journal with data:', data);
    const journal = await TravelJournal.create(data);
    console.log('✅ Travel journal created successfully:', journal.toJSON());
    return journal;
  } catch (error) {
    console.error('❌ Error creating travel journal:', error);
    throw error;
  }
};

// Update by ID
const updateById = async (id, data) => {
  try {
    const journal = await TravelJournal.findByPk(id);
    if (!journal) {
      throw new Error('Travel journal not found');
    }
    return await journal.update(data);
  } catch (error) {
    console.error('❌ Error updating travel journal:', error);
    throw error;
  }
};

// Delete by ID
const deleteById = async (id) => {
  try {
    const journal = await TravelJournal.findByPk(id);
    if (!journal) {
      throw new Error('Travel journal not found');
    }
    return await journal.destroy();
  } catch (error) {
    console.error('❌ Error deleting travel journal:', error);
    throw error;
  }
};

module.exports = {
  TravelJournal,
  initTravelJournal,
  findAll,
  findById,
  create,
  updateById,
  deleteById
};
