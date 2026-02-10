// In-memory certification data for testing
let certifications = [
  {
    id: 1,
    logo: '/react_logo.png',
    title: 'React Developer',
    subtitle: 'Advanced React Patterns',
    organization: 'Tech Academy',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    logo: '/nodejs_logo.png',
    title: 'Node.js Backend',
    subtitle: 'Server-side Development',
    organization: 'Coding Institute',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Get all certifications
const getAllCertifications = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Certifications retrieved successfully',
      data: {
        certifications: certifications,
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
    const certification = certifications.find(cert => cert.id === parseInt(id));
    
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
        certification: certification
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
    
    if (!title || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Title and organization are required'
      });
    }
    
    const newCertification = {
      id: certifications.length > 0 ? Math.max(...certifications.map(cert => cert.id)) + 1 : 1,
      logo: logo || '',
      title,
      subtitle: subtitle || '',
      organization,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    certifications.push(newCertification);
    
    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: {
        certification: newCertification
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
    const certificationIndex = certifications.findIndex(cert => cert.id === parseInt(id));
    
    if (certificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }
    
    const { logo, title, subtitle, organization } = req.body;
    
    certifications[certificationIndex] = {
      ...certifications[certificationIndex],
      logo: logo !== undefined ? logo : certifications[certificationIndex].logo,
      title: title !== undefined ? title : certifications[certificationIndex].title,
      subtitle: subtitle !== undefined ? subtitle : certifications[certificationIndex].subtitle,
      organization: organization !== undefined ? organization : certifications[certificationIndex].organization,
      updated_at: new Date()
    };
    
    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: {
        certification: certifications[certificationIndex]
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
    const certificationIndex = certifications.findIndex(cert => cert.id === parseInt(id));
    
    if (certificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }
    
    certifications.splice(certificationIndex, 1);
    
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
