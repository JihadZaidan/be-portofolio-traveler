// In-memory experience data for testing
let experiences = [
  {
    id: 1,
    logo: '/welocalize_logo.jpeg',
    logoAlt: 'Welocalize',
    title: 'Ads Quality Rater',
    company: 'Welocalize',
    period: 'Mar 2023 hingga Mei 2025',
    duration: '2 thn 3 bln',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    logo: '/ginitalent.jpeg',
    logoAlt: 'Gini Talent',
    title: 'Search Quality Improvement Lead',
    company: 'Gini Talent',
    period: 'Jun 2025 hingga Saat ini',
    duration: '8 bln',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Get all experiences
const getAllExperiences = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Experiences retrieved successfully',
      data: {
        experiences: experiences,
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
    const experience = experiences.find(exp => exp.id === parseInt(id));
    
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
        experience: experience
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
    const { logo, logoAlt, title, company, period, duration } = req.body;
    
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Title and company are required'
      });
    }
    
    const newExperience = {
      id: experiences.length > 0 ? Math.max(...experiences.map(exp => exp.id)) + 1 : 1,
      logo: logo || '',
      logoAlt: logoAlt || company,
      title,
      company,
      period: period || '',
      duration: duration || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    experiences.push(newExperience);
    
    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: {
        experience: newExperience
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
    const experienceIndex = experiences.findIndex(exp => exp.id === parseInt(id));
    
    if (experienceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    const { logo, logoAlt, title, company, period, duration } = req.body;
    
    experiences[experienceIndex] = {
      ...experiences[experienceIndex],
      logo: logo !== undefined ? logo : experiences[experienceIndex].logo,
      logoAlt: logoAlt !== undefined ? logoAlt : experiences[experienceIndex].logoAlt,
      title: title !== undefined ? title : experiences[experienceIndex].title,
      company: company !== undefined ? company : experiences[experienceIndex].company,
      period: period !== undefined ? period : experiences[experienceIndex].period,
      duration: duration !== undefined ? duration : experiences[experienceIndex].duration,
      updated_at: new Date()
    };
    
    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: {
        experience: experiences[experienceIndex]
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
    const experienceIndex = experiences.findIndex(exp => exp.id === parseInt(id));
    
    if (experienceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    experiences.splice(experienceIndex, 1);
    
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
