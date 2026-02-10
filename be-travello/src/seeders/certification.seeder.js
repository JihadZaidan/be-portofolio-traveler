const { Certification, initCertification } = require('../models/Certification.model');

const seedCertifications = async () => {
  try {
    await initCertification();
    
    const existingCertifications = await Certification.findAll();
    
    if (existingCertifications.length === 0) {
      const certifications = [
        {
          logo: '/EF-Logo.png',
          title: 'EF SET English Certification',
          subtitle: 'C2 Proficient',
          organization: 'EF Standard English Test'
        },
        {
          logo: '/Google-Logo.png',
          title: 'The Fundamentals of Digital Marketing',
          subtitle: '',
          organization: 'Google'
        }
      ];

      await Certification.bulkCreate(certifications);
      console.log('Certifications seeded successfully');
    } else {
      console.log('Certifications already exist, skipping seeding');
    }
  } catch (error) {
    console.error('Error seeding certifications:', error);
  }
};

module.exports = { seedCertifications };
