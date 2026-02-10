const {
  LandingPage,
  initLandingPage,
  createLandingPage,
  getAllLandingPages,
  getLandingPageById,
  updateLandingPage,
  deleteLandingPage,
  getLandingPagesBySection
} = require('../models/LandingPage.model.mysql.js');

// Initialize landing page model
const initController = async () => {
  await initLandingPage();
};

// Get all landing pages
const getAllLandingPagesController = async (req, res) => {
  try {
    const { section, isActive, includeUser = 'false' } = req.query;
    
    const filters = {
      section,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      includeUser: includeUser === 'true'
    };

    const pages = await getAllLandingPages(filters);
    
    res.json({
      success: true,
      message: 'Landing pages retrieved successfully',
      data: {
        pages: pages.map(page => page.toJSON()),
        count: pages.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching landing pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing pages',
      error: error.message
    });
  }
};

// Get landing pages by section
const getLandingPagesBySectionController = async (req, res) => {
  try {
    const { section } = req.params;
    
    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section is required'
      });
    }

    const pages = await getLandingPagesBySection(section);
    
    res.json({
      success: true,
      message: `Landing pages for ${section} section retrieved successfully`,
      data: {
        pages: pages.map(page => page.toJSON()),
        count: pages.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching landing pages by section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing pages by section',
      error: error.message
    });
  }
};

// Get landing page by ID
const getLandingPageByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await getLandingPageById(id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }

    res.json({
      success: true,
      message: 'Landing page retrieved successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing page',
      error: error.message
    });
  }
};

// Create new landing page
const createLandingPageController = async (req, res) => {
  try {
    const pageData = {
      ...req.body,
      createdBy: req.user?.id || 'admin'
    };

    const page = await createLandingPage(pageData);

    res.status(201).json({
      success: true,
      message: 'Landing page created successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('❌ Error creating landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create landing page',
      error: error.message
    });
  }
};

// Update landing page
const updateLandingPageController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const page = await updateLandingPage(id, updateData);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }

    res.json({
      success: true,
      message: 'Landing page updated successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('❌ Error updating landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update landing page',
      error: error.message
    });
  }
};

// Delete landing page
const deleteLandingPageController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteLandingPage(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }

    res.json({
      success: true,
      message: 'Landing page deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete landing page',
      error: error.message
    });
  }
};

// Get hero section data
const getHeroSectionController = async (req, res) => {
  try {
    console.log('🔍 Fetching hero section...');
    const pages = await getLandingPagesBySection('hero');
    console.log('📊 Hero pages found:', pages.length);
    
    res.json({
      success: true,
      message: 'Hero section data retrieved successfully',
      data: {
        hero: pages.map(page => page.toJSON())
      }
    });
  } catch (error) {
    console.error('❌ Error fetching hero section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero section',
      error: error.message
    });
  }
};

// Get about section data
const getAboutSectionController = async (req, res) => {
  try {
    console.log('🔍 Fetching about section...');
    const pages = await getLandingPagesBySection('about');
    console.log('📊 About pages found:', pages.length);
    
    if (pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }
    
    res.json({
      success: true,
      message: 'About section data retrieved successfully',
      data: {
        about: pages.map(page => page.toJSON())
      }
    });
  } catch (error) {
    console.error('❌ Error fetching about section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about section',
      error: error.message
    });
  }
};

module.exports = {
  initController,
  getAllLandingPages: getAllLandingPagesController,
  getLandingPagesBySection: getLandingPagesBySectionController,
  getLandingPageById: getLandingPageByIdController,
  createLandingPage: createLandingPageController,
  updateLandingPage: updateLandingPageController,
  deleteLandingPage: deleteLandingPageController,
  getHeroSection: getHeroSectionController,
  getAboutSection: getAboutSectionController
};
