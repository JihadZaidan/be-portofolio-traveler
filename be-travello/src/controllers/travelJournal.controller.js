const TravelJournal = require('../models/TravelJournal');
const pool = require('../config/mysql.pool');
const crypto = require('crypto');
const { parseDataUrl } = require('./media.controller');
const MediaMySQL = require('../models/MediaMySQL');

const generateId = () => crypto.randomBytes(24).toString('hex');

const storeImageIfDataUrl = async (maybeDataUrl, fileNamePrefix) => {
    try {
        const parsed = parseDataUrl(maybeDataUrl);
        if (!parsed) return maybeDataUrl;
        const created = await MediaMySQL.create({
            fileName: `${fileNamePrefix}_${Date.now()}`,
            mimeType: parsed.mimeType,
            buffer: parsed.buffer
        });
        return `/api/media/${created.id}`;
    } catch (e) {
        console.warn('⚠️ Failed to store travel journal image in DB, keeping original value');
        return maybeDataUrl;
    }
};

// In-memory storage for demo (without database)
let travelJournalsData = [
    {
        _id: '1',
        name: 'Bali',
        cover: '/images/bali-cover.jpg',
        travelImage: '/images/bali-travel.jpg',
        description: 'Beautiful beaches and temples in Bali',
        location: 'Bali, Indonesia',
        date: new Date('2024-01-15'),
        category: 'beach',
        tags: ['beach', 'temple', 'culture'],
        isActive: true,
        featured: true,
        views: 1250,
        likes: 89,
        author: 'TRAVELLO Team',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        _id: '2',
        name: 'Tokyo',
        cover: '/images/tokyo-cover.jpg',
        travelImage: '/images/tokyo-travel.jpg',
        description: 'Modern city life and traditional culture in Tokyo',
        location: 'Tokyo, Japan',
        date: new Date('2024-02-20'),
        category: 'city',
        tags: ['city', 'modern', 'culture'],
        isActive: true,
        featured: false,
        views: 980,
        likes: 67,
        author: 'TRAVELLO Team',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20')
    }
];

// Get all travel journals for admin
exports.getAllJournals = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, isActive } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const where = [];
        const params = [];

        if (search) {
            where.push('(name LIKE ? OR description LIKE ? OR location LIKE ?)');
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (category) {
            where.push('category = ?');
            params.push(category);
        }
        if (isActive !== undefined) {
            where.push('isActive = ?');
            params.push(isActive === 'true');
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM travel_journals ${whereClause}`,
            params
        );

        const total = countRows?.[0]?.total || 0;

        const [rows] = await pool.execute(
            `SELECT * FROM travel_journals ${whereClause} ORDER BY featured DESC, createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        const mapped = (rows || []).map((r) => ({
            ...r,
            _id: r.id,
            cover: r.coverUrl,
            travelImage: r.travelImageUrl,
            tags: r.tags ? JSON.parse(r.tags) : []
        }));

        return res.json({
            success: true,
            data: mapped,
            pagination: {
                current: pageNum,
                pageSize: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting journals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get travel journals',
            error: error.message
        });
    }
};

// Get active travel journals for users
exports.getActiveJournals = async (req, res) => {
    try {
        const { page = 1, limit = 10, featured, category, search } = req.query;
        
        // Filter active journals only
        let filteredData = travelJournalsData.filter(journal => journal.isActive);
        
        if (featured === 'true') {
            filteredData = filteredData.filter(journal => journal.featured);
        }
        
        if (category) {
            filteredData = filteredData.filter(journal => journal.category === category);
        }
        
        if (search) {
            filteredData = filteredData.filter(journal => 
                journal.name.toLowerCase().includes(search.toLowerCase()) ||
                journal.description.toLowerCase().includes(search.toLowerCase()) ||
                journal.location.toLowerCase().includes(search.toLowerCase()) ||
                journal.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
            );
        }
        
        // Sort by featured first, then by date
        filteredData.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: paginatedData,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: filteredData.length,
                pages: Math.ceil(filteredData.length / limit)
            }
        });
    } catch (error) {
        console.error('Error getting active journals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get travel journals',
            error: error.message
        });
    }
};

// Get single travel journal by ID
exports.getJournalById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        // Increment views
        journal.views += 1;
        
        res.json({
            success: true,
            data: journal
        });
    } catch (error) {
        console.error('Error getting journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get travel journal',
            error: error.message
        });
    }
};

// Preview travel journal (without incrementing views)
exports.previewJournal = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        // Check if journal is active (only active journals can be previewed)
        if (!journal.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Travel journal is not active'
            });
        }
        
        res.json({
            success: true,
            data: journal
        });
    } catch (error) {
        console.error('Error previewing journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview travel journal',
            error: error.message
        });
    }
};

// Get journal preview data with related journals
exports.getJournalPreviewData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        // Check if journal is active
        if (!journal.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Travel journal is not active'
            });
        }
        
        // Get related journals (same category, excluding current)
        const relatedJournals = travelJournalsData
            .filter(j => j.isActive && j._id !== id && j.category === journal.category)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        
        // Get latest journals (excluding current)
        const latestJournals = travelJournalsData
            .filter(j => j.isActive && j._id !== id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        
        res.json({
            success: true,
            data: {
                journal,
                relatedJournals,
                latestJournals
            }
        });
    } catch (error) {
        console.error('Error getting journal preview data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get journal preview data',
            error: error.message
        });
    }
};

// Create new travel journal
exports.createJournal = async (req, res) => {
    try {
        const {
            name,
            cover,
            travelImage,
            description,
            location,
            date,
            category,
            tags,
            isActive,
            featured,
            author = 'TRAVELLO Team' // Default author
        } = req.body;
        
        // Validate required fields
        if (!name || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, and location are required'
            });
        }
        
        const id = generateId();
        const coverUrl = await storeImageIfDataUrl(cover || '/images/default-cover.jpg', `travel_cover_${id}`);
        const travelImageUrl = await storeImageIfDataUrl(travelImage || '/images/default-travel.jpg', `travel_image_${id}`);

        await pool.execute(
            `INSERT INTO travel_journals
                (id, name, coverUrl, travelImageUrl, description, location, date, category, tags, isActive, featured, author)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                coverUrl,
                travelImageUrl,
                description,
                location,
                date || new Date().toISOString().split('T')[0],
                category || 'adventure',
                JSON.stringify(tags || []),
                isActive !== undefined ? Boolean(isActive) : true,
                Boolean(featured),
                author
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM travel_journals WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        const payload = {
            ...row,
            _id: row.id,
            cover: row.coverUrl,
            travelImage: row.travelImageUrl,
            tags: row.tags ? JSON.parse(row.tags) : []
        };

        return res.status(201).json({
            success: true,
            message: 'Travel journal created successfully',
            data: payload
        });
    } catch (error) {
        console.error('Error creating journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create travel journal',
            error: error.message
        });
    }
};

// Update travel journal
exports.updateJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingRows] = await pool.execute('SELECT * FROM travel_journals WHERE id = ? LIMIT 1', [id]);
        if (!existingRows || existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }

        const allowed = [
            'name',
            'cover',
            'travelImage',
            'description',
            'location',
            'date',
            'category',
            'tags',
            'isActive',
            'featured',
            'author'
        ];

        const setParts = [];
        const params = [];

        for (const key of allowed) {
            if (!updateData || !Object.prototype.hasOwnProperty.call(updateData, key)) continue;
            if (key === 'cover') {
                const stored = await storeImageIfDataUrl(updateData.cover, `travel_cover_${id}`);
                setParts.push('coverUrl = ?');
                params.push(stored);
                continue;
            }
            if (key === 'travelImage') {
                const stored = await storeImageIfDataUrl(updateData.travelImage, `travel_image_${id}`);
                setParts.push('travelImageUrl = ?');
                params.push(stored);
                continue;
            }
            if (key === 'tags') {
                setParts.push('tags = ?');
                params.push(JSON.stringify(updateData.tags || []));
                continue;
            }
            if (['isActive', 'featured'].includes(key)) {
                setParts.push(`${key} = ?`);
                params.push(Boolean(updateData[key]));
                continue;
            }
            setParts.push(`${key} = ?`);
            params.push(updateData[key]);
        }

        if (setParts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(id);
        await pool.execute(`UPDATE travel_journals SET ${setParts.join(', ')} WHERE id = ?`, params);

        const [rows] = await pool.execute('SELECT * FROM travel_journals WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        const payload = {
            ...row,
            _id: row.id,
            cover: row.coverUrl,
            travelImage: row.travelImageUrl,
            tags: row.tags ? JSON.parse(row.tags) : []
        };

        return res.json({
            success: true,
            message: 'Travel journal updated successfully',
            data: payload
        });
    } catch (error) {
        console.error('Error updating journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update travel journal',
            error: error.message
        });
    }
};

// Delete travel journal
exports.deleteJournal = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM travel_journals WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }

        return res.json({
            success: true,
            message: 'Travel journal deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete travel journal',
            error: error.message
        });
    }
};

// Toggle journal status (active/inactive)
exports.toggleJournalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        journal.isActive = !journal.isActive;
        journal.updatedAt = new Date();
        
        res.json({
            success: true,
            message: `Travel journal ${journal.isActive ? 'activated' : 'deactivated'} successfully`,
            data: journal
        });
    } catch (error) {
        console.error('Error toggling journal status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle journal status',
            error: error.message
        });
    }
};

// Toggle featured status
exports.toggleFeaturedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        journal.featured = !journal.featured;
        journal.updatedAt = new Date();
        
        res.json({
            success: true,
            message: `Travel journal ${journal.featured ? 'featured' : 'unfeatured'} successfully`,
            data: journal
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle featured status',
            error: error.message
        });
    }
};

// Get journal statistics
exports.getJournalStats = async (req, res) => {
    try {
        const total = travelJournalsData.length;
        const active = travelJournalsData.filter(j => j.isActive).length;
        const featured = travelJournalsData.filter(j => j.featured).length;
        const totalViews = travelJournalsData.reduce((sum, j) => sum + j.views, 0);
        const totalLikes = travelJournalsData.reduce((sum, j) => sum + j.likes, 0);
        
        const categoryStats = {};
        travelJournalsData.filter(j => j.isActive).forEach(journal => {
            categoryStats[journal.category] = (categoryStats[journal.category] || 0) + 1;
        });
        
        const categoryStatsArray = Object.entries(categoryStats).map(([category, count]) => ({
            _id: category,
            count
        })).sort((a, b) => b.count - a.count);
        
        res.json({
            success: true,
            data: {
                total,
                active,
                featured,
                inactive: total - active,
                totalViews,
                totalLikes,
                categoryStats: categoryStatsArray
            }
        });
    } catch (error) {
        console.error('Error getting journal stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get journal statistics',
            error: error.message
        });
    }
};

// Like/unlike journal
exports.likeJournal = async (req, res) => {
    try {
        const { id } = req.params;
        
        const journal = travelJournalsData.find(j => j._id === id);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: 'Travel journal not found'
            });
        }
        
        journal.likes += 1;
        
        res.json({
            success: true,
            message: 'Journal liked successfully',
            data: { likes: journal.likes }
        });
    } catch (error) {
        console.error('Error liking journal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like journal',
            error: error.message
        });
    }
};
