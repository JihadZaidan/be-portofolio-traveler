const sequelize = require('./src/config/database-mysql.config.js');
const { initLandingPage } = require('./src/models/LandingPage.model.mysql.js');

async function fixDatabase() {
  try {
    console.log('Dropping existing table...');
    await sequelize.query('DROP TABLE IF EXISTS landing_pages');
    
    console.log('Recreating table...');
    await initLandingPage();
    
    console.log('Database fixed successfully!');
    
    // Test creating a sample entry
    const { createLandingPage } = require('./src/models/LandingPage.model.mysql.js');
    const sample = await createLandingPage({
      section: 'hero',
      title: 'Welcome to Travello',
      subtitle: 'Your journey starts here',
      content: 'Discover amazing places and create unforgettable memories.',
      orderIndex: 0,
      isActive: true,
      createdBy: 'admin-001'
    });
    
    console.log('Sample entry created:', sample.toJSON());
    
  } catch (error) {
    console.error('Error fixing database:', error.message);
  } finally {
    process.exit(0);
  }
}

fixDatabase();
