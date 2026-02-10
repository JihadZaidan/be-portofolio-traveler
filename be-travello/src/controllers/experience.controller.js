const { Experience, initExperience } = require('../models/Experience.model');

// Get all experiences
const getAllExperiences = async (req, res) => {
  try {
    await initExperience();
    const experiences = await Experience.findAll({
      order: [['id', 'ASC']]
    });
    
    res.json({
      success: true,
      message: 'Experiences retrieved successfully',
      data: {
        experiences: experiences.map(exp => exp.toJSON()),
        count: experiences.length
      }
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiences',
      error: error.message
    });
  }
};

// Get experience by ID
const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    await initExperience();
    
    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Experience retrieved successfully',
      data: {
        experience: experience.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience',
      error: error.message
    });
  }
};

// Create new experience
const createExperience = async (req, res) => {
  try {
    await initExperience();
    const { logo, logoAlt, title, company, period, duration } = req.body;
    
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Title and company are required'
      });
    }
    
    const experience = await Experience.create({
      logo: logo || '',
      logoAlt: logoAlt || company,
      title,
      company,
      period: period || '',
      duration: duration || ''
    });
    
    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: {
        experience: experience.toJSON()
      }
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create experience',
      error: error.message
    });
  }
};

// Update experience
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await initExperience();
    
    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    const { logo, logoAlt, title, company, period, duration } = req.body;
    
    await experience.update({
      logo: logo !== undefined ? logo : experience.logo,
      logoAlt: logoAlt !== undefined ? logoAlt : experience.logoAlt,
      title: title !== undefined ? title : experience.title,
      company: company !== undefined ? company : experience.company,
      period: period !== undefined ? period : experience.period,
      duration: duration !== undefined ? duration : experience.duration
    });
    
    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: {
        experience: experience.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update experience',
      error: error.message
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await initExperience();
    
    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    await experience.destroy();
    
    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete experience',
      error: error.message
    });
  }
};

module.exports = {
  getAllExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
};
