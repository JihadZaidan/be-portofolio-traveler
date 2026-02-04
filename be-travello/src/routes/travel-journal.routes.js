const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const router = Router();

// In-memory storage (tanpa database phpMyAdmin)
let travelJournals = [
  {
    id: 1,
    name: "Bali",
    cover: "/foto 2.jpg",
    images: ["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: "active"
  },
  {
    id: 2,
    name: "Tokyo",
    cover: "/foto 1.jpg",
    images: ["/foto 1.jpg"],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    status: "active"
  }
];

// Helper function to get relative time like "54w", "12w", "3d"
function getRelativeTime(dateString) {
  if (!dateString) {
    return 'Just now';
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Just now';
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 7) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w`;
  } else if (diffDays >= 1) {
    return `${diffDays}d`;
  } else {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${hours}h`;
  }
}

// Get all travel journals
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        journals: travelJournals.map(journal => ({
          ...journal,
          // Add timestamp for frontend (like "54w", "12w", etc.)
          timestamp: getRelativeTime(journal.createdAt)
        })),
        count: travelJournals.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travel journals',
      error: error.message
    });
  }
});

// Get travel journal by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const journal = travelJournals.find(j => j.id === parseInt(id));
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Travel journal not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        journal: {
          ...journal,
          timestamp: getRelativeTime(journal.createdAt)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travel journal',
      error: error.message
    });
  }
});

// Create new travel journal
router.post('/', async (req, res) => {
  try {
    const { name, cover, images } = req.body;
    
    if (!name || !cover) {
      return res.status(400).json({
        success: false,
        message: 'Name and cover image are required'
      });
    }
    
    const newJournal = {
      id: travelJournals.length > 0 ? Math.max(...travelJournals.map(j => j.id)) + 1 : 1,
      name,
      cover,
      images: images || [],
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    travelJournals.push(newJournal);
    
    res.status(201).json({
      success: true,
      message: 'Travel journal created successfully',
      data: {
        journal: {
          ...newJournal,
          timestamp: getRelativeTime(newJournal.createdAt)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create travel journal',
      error: error.message
    });
  }
});

// Update travel journal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cover, images } = req.body;
    
    const journalIndex = travelJournals.findIndex(j => j.id === parseInt(id));
    
    if (journalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Travel journal not found'
      });
    }
    
    travelJournals[journalIndex] = {
      ...travelJournals[journalIndex],
      ...(name && { name }),
      ...(cover && { cover }),
      ...(images && { images })
    };
    
    res.json({
      success: true,
      message: 'Travel journal updated successfully',
      data: {
        journal: {
          ...travelJournals[journalIndex],
          timestamp: getRelativeTime(travelJournals[journalIndex].createdAt)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update travel journal',
      error: error.message
    });
  }
});

// Delete travel journal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const journalIndex = travelJournals.findIndex(j => j.id === parseInt(id));
    
    if (journalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Travel journal not found'
      });
    }
    
    const deletedJournal = travelJournals.splice(journalIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Travel journal deleted successfully',
      data: {
        journal: deletedJournal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete travel journal',
      error: error.message
    });
  }
});

// Auto-delete old images (24 hours)
// This should be run as a cron job in production
router.post('/cleanup', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find journals older than 24 hours
    const oldJournals = travelJournals.filter(journal => 
      new Date(journal.createdAt) < twentyFourHoursAgo
    );
    
    // In production, you would also delete the actual image files
    // from your storage (S3, local filesystem, etc.)
    
    // Remove old journals
    travelJournals = travelJournals.filter(journal => 
      new Date(journal.createdAt) >= twentyFourHoursAgo
    );
    
    res.json({
      success: true,
      message: `Cleaned up ${oldJournals.length} old travel journals`,
      data: {
        deletedCount: oldJournals.length,
        deletedJournals: oldJournals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old travel journals',
      error: error.message
    });
  }
});

module.exports = router;
