const { sequelize } = require('./src/config/database-mysql.config.js');
const { Portfolio, initPortfolio } = require('./src/models/Portfolio.model.mysql.js');

async function testPortfolioConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection OK');

    console.log('🔧 Initializing Portfolio model...');
    await initPortfolio();
    console.log('✅ Portfolio model initialized');

    console.log('📊 Testing Portfolio.findAll...');
    const portfolios = await Portfolio.findAll({ limit: 5 });
    console.log(`✅ Found ${portfolios.length} portfolios`);
    console.log('Sample:', portfolios.map(p => ({ id: p.id, title: p.title, published: p.published })));

    console.log('🔍 Testing getAllPortfolios function...');
    const { getAllPortfolios } = require('./src/models/Portfolio.model.mysql.js');
    const allPortfolios = await getAllPortfolios({});
    console.log(`✅ getAllPortfolios returned ${allPortfolios.length} items`);

  } catch (err) {
    console.error('❌ ERROR:', err);
    console.error('Stack:', err.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testPortfolioConnection();
