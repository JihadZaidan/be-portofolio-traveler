const { Certification, initCertification } = require('../models/Certification.model');

// Get all certifications
const getAllCertifications = async (req, res) => {
  try {
    await initCertification();
    const certifications = await Certification.findAll({
      order: [['id', 'ASC']]
    });
    
    res.json({
      success: true,
      message: 'Certifications retrieved successfully',
      data: {
        certifications: certifications.map(cert => cert.toJSON()),
        count: certifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certifications',
      error: error.message
    });
  }
};

// Get certification by ID
const getCertificationById = async (req, res) => {
  try {
    const { id } = req.params;
    await initCertification();
    
    const certification = await Certification.findByPk(id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Certification retrieved successfully',
      data: {
        certification: certification.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certification',
      error: error.message
    });
  }
};

// Create new certification
const createCertification = async (req, res) => {
  try {
    const { logo, title, subtitle, organization } = req.body;
    
    await initCertification();
    
    const newCertification = await Certification.create({
      logo,
      title,
      subtitle,
      organization
    });
    
    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: {
        certification: newCertification.toJSON()
      }
    });
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create certification',
      error: error.message
    });
  }
};

// Update certification
const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { logo, title, subtitle, organization } = req.body;
    
    await initCertification();
    
    const certification = await Certification.findByPk(id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }
    
    await certification.update({
      logo: logo || certification.logo,
      title: title || certification.title,
      subtitle: subtitle !== undefined ? subtitle : certification.subtitle,
      organization: organization || certification.organization
    });
    
    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: {
        certification: certification.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certification',
      error: error.message
    });
  }
};

// Delete certification
const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;
    await initCertification();
    
    const deleted = await Certification.destroy({ where: { id } });
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certification',
      error: error.message
    });
  }
};

module.exports = {
  getAllCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification
};
