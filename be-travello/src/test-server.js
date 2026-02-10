const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test experience data (in-memory for now)
let experiences = [
  {
    id: 1,
    logo: '/welocalize_logo.jpeg',
    logoAlt: 'Welocalize',
    title: 'Ads Quality Rater',
    company: 'Welocalize',
    period: 'Mar 2023 hingga Mei 2025',
    duration: '2 thn 3 bln'
  },
  {
    id: 2,
    logo: '/ginitalent.jpeg',
    logoAlt: 'Gini Talent',
    title: 'Search Quality Improvement Lead',
    company: 'Gini Talent',
    period: 'Jun 2025 hingga Saat ini',
    duration: '8 bln'
  }
];

// Experience routes
app.get('/api/experiences', (req, res) => {
  res.json({
    success: true,
    message: 'Experiences retrieved successfully',
    data: {
      experiences: experiences,
      count: experiences.length
    }
  });
});

app.get('/api/experiences/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const experience = experiences.find(exp => exp.id === id);
  
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
});

app.post('/api/experiences', (req, res) => {
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
    duration: duration || ''
  };
  
  experiences.push(newExperience);
  
  res.status(201).json({
    success: true,
    message: 'Experience created successfully',
    data: {
      experience: newExperience
    }
  });
});

app.put('/api/experiences/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const experienceIndex = experiences.findIndex(exp => exp.id === id);
  
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
    duration: duration !== undefined ? duration : experiences[experienceIndex].duration
  };
  
  res.json({
    success: true,
    message: 'Experience updated successfully',
    data: {
      experience: experiences[experienceIndex]
    }
  });
});

app.delete('/api/experiences/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const experienceIndex = experiences.findIndex(exp => exp.id === id);
  
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
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📝 Experience API: http://localhost:${PORT}/api/experiences`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
