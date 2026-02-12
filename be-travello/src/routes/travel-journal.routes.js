const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const router = Router();

// Import travel journal model functions
const {
  TravelJournal,
  findAll,
  findById,
  create,
  updateById,
  deleteById
} = require('../models/TravelJournal.model.mysql.js');

// In-memory storage for contact messages
let contactMessages = [];
let messageIdCounter = 1;

// In-memory storage for admin replies
let adminReplies = [];

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
    console.log('🔄 GET /api/travel-journal - Fetching all journals');
    const journals = await findAll();
    console.log('📊 Found journals:', journals.length);
    
    res.json({
      success: true,
      data: {
        journals: journals.map(journal => ({
          id: journal.id,
          name: journal.name,
          cover: journal.cover_image,
          images: typeof journal.images === 'string' ? JSON.parse(journal.images) : (journal.images || []),
          createdAt: journal.created_at,
          status: journal.status,
          // Add timestamp for frontend (like "54w", "12w", etc.)
          timestamp: getRelativeTime(journal.created_at)
        })),
        count: journals.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching travel journals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch travel journals',
      error: error.message
    });
  }
});

// Contact Messages API - Connect shop contact to admin chat

// Get all contact messages for admin chat
router.get('/contact-messages', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        messages: contactMessages,
        count: contactMessages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
});

// Create new contact message from shop
router.post('/contact-messages', async (req, res) => {
  try {
    const { name, email, message, productId, productTitle } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name and message are required'
      });
    }
    
    const newContactMessage = {
      id: messageIdCounter++,
      name: name || 'Anonymous User',
      email: email || '',
      message: message,
      productId: productId || null,
      productTitle: productTitle || '',
      createdAt: new Date().toISOString(),
      status: 'unread',
      source: 'shop'
    };
    
    contactMessages.unshift(newContactMessage); // Add to beginning of array
    
    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: {
        message: newContactMessage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send contact message',
      error: error.message
    });
  }
});

// Mark contact message as read
router.put('/contact-messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const messageIndex = contactMessages.findIndex(m => m.id === parseInt(id));
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    contactMessages[messageIndex].status = 'read';
    
    res.json({
      success: true,
      message: 'Contact message marked as read',
      data: {
        message: contactMessages[messageIndex]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// Delete contact message
router.delete('/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const messageIndex = contactMessages.findIndex(m => m.id === parseInt(id));
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    const deletedMessage = contactMessages.splice(messageIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      data: {
        message: deletedMessage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
});

// Admin replies endpoint
router.post('/admin-replies', async (req, res) => {
  try {
    const { message, customerName, adminName } = req.body;
    
    if (!message || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Message and customer name are required'
      });
    }
    
    // Store admin reply (in a real app, this would be stored in database)
    const adminReply = {
      id: adminReplies.length > 0 ? Math.max(...adminReplies.map(r => r.id)) + 1 : 1,
      message: message,
      customerName: customerName,
      adminName: adminName || 'Admin',
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    
    adminReplies.push(adminReply);
    
    console.log(`Admin reply sent to ${customerName}: ${message}`);
    
    res.status(201).json({
      success: true,
      message: 'Admin reply sent successfully',
      data: {
        reply: adminReply
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send admin reply',
      error: error.message
    });
  }
});

// Get admin replies for customer
router.get('/admin-replies/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    
    const customerReplies = adminReplies.filter(reply => reply.customerName === customerName);
    
    res.json({
      success: true,
      data: {
        replies: customerReplies,
        count: customerReplies.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin replies',
      error: error.message
    });
  }
});

// Get travel journal by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const journal = await findById(id);
    
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
          id: journal.id,
          name: journal.name,
          cover: journal.cover_image,
          images: typeof journal.images === 'string' ? JSON.parse(journal.images) : (journal.images || []),
          createdAt: journal.created_at,
          status: journal.status,
          timestamp: getRelativeTime(journal.created_at)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching travel journal:', error);
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
    
    // Handle base64 images - ensure they're properly stored
    const processedImages = Array.isArray(images) ? images : [];
    
    const journalData = {
      name,
      cover_image: cover,
      images: processedImages,
      status: 'active'
    };
    
    console.log('📝 Creating travel journal with data:', journalData);
    const newJournal = await create(journalData);
    
    res.status(201).json({
      success: true,
      message: 'Travel journal created successfully',
      data: {
        journal: {
          id: newJournal.id,
          name: newJournal.name,
          cover: newJournal.cover_image,
          images: typeof newJournal.images === 'string' ? JSON.parse(newJournal.images) : (newJournal.images || []),
          createdAt: newJournal.created_at,
          status: newJournal.status,
          timestamp: getRelativeTime(newJournal.created_at)
        }
      }
    });
  } catch (error) {
    console.error('Error creating travel journal:', error);
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
    
    const updateData = {};
    if (name) updateData.name = name;
    if (cover) updateData.cover_image = cover;
    if (images) {
      // Handle base64 images - ensure they're properly stored
      updateData.images = Array.isArray(images) ? images : [];
    }
    
    console.log('📝 Updating travel journal with data:', updateData);
    const updatedJournal = await updateById(id, updateData);
    
    res.json({
      success: true,
      message: 'Travel journal updated successfully',
      data: {
        journal: {
          id: updatedJournal.id,
          name: updatedJournal.name,
          cover: updatedJournal.cover_image,
          images: typeof updatedJournal.images === 'string' ? JSON.parse(updatedJournal.images) : (updatedJournal.images || []),
          createdAt: updatedJournal.created_at,
          status: updatedJournal.status,
          timestamp: getRelativeTime(updatedJournal.created_at)
        }
      }
    });
  } catch (error) {
    console.error('Error updating travel journal:', error);
    if (error.message === 'Travel journal not found') {
      return res.status(404).json({
        success: false,
        message: 'Travel journal not found'
      });
    }
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
    
    const deletedJournal = await deleteById(id);
    
    res.json({
      success: true,
      message: 'Travel journal deleted successfully',
      data: {
        journal: {
          id: deletedJournal.id,
          name: deletedJournal.name,
          cover: deletedJournal.cover_image,
          images: deletedJournal.images || [],
          createdAt: deletedJournal.created_at,
          status: deletedJournal.status
        }
      }
    });
  } catch (error) {
    console.error('Error deleting travel journal:', error);
    if (error.message === 'Travel journal not found') {
      return res.status(404).json({
        success: false,
        message: 'Travel journal not found'
      });
    }
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
    const journals = await findAll();
    const oldJournals = journals.filter(journal => 
      new Date(journal.created_at) < twentyFourHoursAgo
    );
    
    // In production, you would also delete the actual image files
    // from your storage (S3, local filesystem, etc.)
    
    // Delete old journals from database
    for (const journal of oldJournals) {
      await deleteById(journal.id);
    }
    
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
