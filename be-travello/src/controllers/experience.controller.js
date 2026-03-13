const Experience = require('../models/Experience');
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
        console.warn('⚠️ Failed to store experience image in DB, keeping original value');
        return maybeDataUrl;
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ExperienceRequest:
 *       type: object
 *       required:
 *         - title
 *         - company
 *         - position
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Experience title
 *         company:
 *           type: string
 *           description: Company name
 *         position:
 *           type: string
 *           description: Job position
 *         description:
 *           type: string
 *           description: Job description
 *         image:
 *           type: string
 *           description: Experience image URL
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date
 *         currentJob:
 *           type: boolean
 *           description: Whether this is current job
 *         location:
 *           type: string
 *           description: Job location
 *         type:
 *           type: string
 *           enum: [full-time, part-time, freelance, internship, remote]
 *           description: Job type
 *         department:
 *           type: string
 *           description: Department
 *         achievements:
 *           type: array
 *           items:
 *             type: string
 *           description: List of achievements
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of technologies used
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of responsibilities
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *         featured:
 *           type: boolean
 *           description: Whether this experience is featured
 *         isActive:
 *           type: boolean
 *           description: Whether this experience is active
 *         order:
 *           type: number
 *           description: Display order
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorization
 */

// In-memory storage for demo (without database)
let experienceData = [
    {
        _id: '1',
        title: 'Senior Travel Consultant',
        company: 'TRAVELLO Indonesia',
        position: 'Senior Travel Consultant',
        description: 'Lead travel consultant specializing in international destinations and luxury travel packages',
        image: '/images/travel-consultant.jpg',
        startDate: new Date('2022-03-15'),
        endDate: null,
        currentJob: true,
        location: 'Jakarta, Indonesia',
        type: 'full-time',
        department: 'Consulting',
        achievements: [
            'Increased client satisfaction by 40%',
            'Managed 50+ international travel packages',
            'Led team of 5 junior consultants'
        ],
        technologies: ['CRM Systems', 'Booking Platforms', 'Travel APIs'],
        responsibilities: [
            'Consult with clients on travel preferences',
            'Design customized travel packages',
            'Manage travel logistics and bookings'
        ],
        skills: ['Customer Service', 'Travel Planning', 'Negotiation', 'Multilingual'],
        featured: true,
        isActive: true,
        order: 1,
        tags: ['consulting', 'travel', 'management'],
        createdAt: new Date('2022-03-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        _id: '2',
        title: 'Travel Content Writer',
        company: 'Wanderlust Media',
        position: 'Content Writer',
        description: 'Created engaging travel content for blogs, social media, and travel guides',
        image: '/images/content-writer.jpg',
        startDate: new Date('2020-06-01'),
        endDate: new Date('2022-02-28'),
        currentJob: false,
        location: 'Bali, Indonesia',
        type: 'freelance',
        department: 'Content',
        achievements: [
            'Published 100+ travel articles',
            'Grew social media following by 25k',
            'Collaborated with major travel brands'
        ],
        technologies: ['WordPress', 'SEO Tools', 'Social Media Platforms'],
        responsibilities: [
            'Write travel blog posts and guides',
            'Create social media content',
            'Research travel destinations'
        ],
        skills: ['Writing', 'SEO', 'Social Media', 'Photography'],
        featured: false,
        isActive: true,
        order: 2,
        tags: ['writing', 'content', 'social-media'],
        createdAt: new Date('2020-06-01'),
        updatedAt: new Date('2022-02-28')
    }
];

/**
 * @swagger
 * /api/experiences:
 *   get:
 *     summary: Get all experiences (for admin)
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by job type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: currentJob
 *         schema:
 *           type: boolean
 *         description: Filter by current job status
 *     responses:
 *       200:
 *         description: Experiences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     experiences:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Experience'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
exports.getAllExperiences = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const where = [];
        const params = [];

        if (search) {
            where.push('(title LIKE ? OR description LIKE ? OR company LIKE ? OR position LIKE ?)');
            const like = `%${search}%`;
            params.push(like, like, like, like);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM experiences ${whereClause}`,
            params
        );

        const total = countRows?.[0]?.total || 0;

        const [rows] = await pool.execute(
            `SELECT * FROM experiences ${whereClause} ORDER BY \`order\` ASC, createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        const mapped = (rows || []).map((r) => ({
            ...r,
            _id: r.id,
            image: r.imageUrl,
            achievements: r.achievements ? JSON.parse(r.achievements) : [],
            technologies: r.technologies ? JSON.parse(r.technologies) : [],
            responsibilities: r.responsibilities ? JSON.parse(r.responsibilities) : [],
            skills: r.skills ? JSON.parse(r.skills) : [],
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
        console.error('Error getting experiences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get experiences',
            error: error.message
        });
    }
};

// Get active experiences for users
exports.getActiveExperiences = async (req, res) => {
    try {
        const { page = 1, limit = 10, featured, type, search } = req.query;
        
        // Filter active experiences only
        let filteredData = experienceData.filter(exp => exp.isActive);
        
        if (featured === 'true') {
            filteredData = filteredData.filter(exp => exp.featured);
        }
        
        if (type) {
            filteredData = filteredData.filter(exp => exp.type === type);
        }
        
        if (search) {
            filteredData = filteredData.filter(exp => 
                exp.title.toLowerCase().includes(search.toLowerCase()) ||
                exp.description.toLowerCase().includes(search.toLowerCase()) ||
                exp.company.toLowerCase().includes(search.toLowerCase()) ||
                exp.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
            );
        }
        
        // Sort by order first, then by start date (newest first)
        filteredData.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return new Date(b.startDate) - new Date(a.startDate);
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
        console.error('Error getting active experiences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get experiences',
            error: error.message
        });
    }
};

// Get single experience by ID
exports.getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const experience = experienceData.find(e => e._id === id);
        
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }
        
        res.json({
            success: true,
            data: experience
        });
    } catch (error) {
        console.error('Error getting experience:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get experience',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/experiences:
 *   post:
 *     summary: Create new experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienceRequest'
 *     responses:
 *       201:
 *         description: Experience created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     experience:
 *                       $ref: '#/components/schemas/Experience'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.createExperience = async (req, res) => {
    try {
        const {
            title,
            company,
            position,
            description,
            image,
            startDate,
            endDate,
            currentJob,
            location,
            type,
            department,
            achievements,
            technologies,
            responsibilities,
            skills,
            featured,
            isActive,
            order,
            tags
        } = req.body;
        
        // Validate required fields
        if (!title || !company || !position || !description || !location || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, company, position, description, location, and start date are required'
            });
        }
        
        const id = generateId();
        const storedImageUrl = await storeImageIfDataUrl(image || '/images/default-experience.jpg', `experience_${id}`);

        await pool.execute(
            `INSERT INTO experiences
                (id, title, company, position, description, imageUrl, startDate, endDate, currentJob, location, type, department,
                 achievements, technologies, responsibilities, skills, featured, isActive, \`order\`, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                title,
                company,
                position,
                description,
                storedImageUrl,
                String(startDate),
                endDate ? String(endDate) : null,
                Boolean(currentJob),
                location,
                type || 'full-time',
                department || '',
                JSON.stringify(achievements || []),
                JSON.stringify(technologies || []),
                JSON.stringify(responsibilities || []),
                JSON.stringify(skills || []),
                Boolean(featured),
                isActive !== undefined ? Boolean(isActive) : true,
                Number(order) || 0,
                JSON.stringify(tags || [])
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM experiences WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        const payload = {
            ...row,
            _id: row.id,
            image: row.imageUrl,
            achievements: row.achievements ? JSON.parse(row.achievements) : [],
            technologies: row.technologies ? JSON.parse(row.technologies) : [],
            responsibilities: row.responsibilities ? JSON.parse(row.responsibilities) : [],
            skills: row.skills ? JSON.parse(row.skills) : [],
            tags: row.tags ? JSON.parse(row.tags) : []
        };

        return res.status(201).json({
            success: true,
            message: 'Experience created successfully',
            data: payload
        });
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create experience',
            error: error.message
        });
    }
};

// Update experience
exports.updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingRows] = await pool.execute('SELECT * FROM experiences WHERE id = ? LIMIT 1', [id]);
        if (!existingRows || existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        const allowed = [
            'title',
            'company',
            'position',
            'description',
            'image',
            'startDate',
            'endDate',
            'currentJob',
            'location',
            'type',
            'department',
            'achievements',
            'technologies',
            'responsibilities',
            'skills',
            'featured',
            'isActive',
            'order',
            'tags'
        ];

        const setParts = [];
        const params = [];

        for (const key of allowed) {
            if (!updateData || !Object.prototype.hasOwnProperty.call(updateData, key)) continue;
            if (key === 'image') {
                const stored = await storeImageIfDataUrl(updateData.image, `experience_${id}`);
                setParts.push('imageUrl = ?');
                params.push(stored);
                continue;
            }
            if (key === 'order') {
                setParts.push('`order` = ?');
                params.push(Number(updateData.order) || 0);
                continue;
            }
            if (['achievements', 'technologies', 'responsibilities', 'skills', 'tags'].includes(key)) {
                setParts.push(`${key} = ?`);
                params.push(JSON.stringify(updateData[key] || []));
                continue;
            }
            if (['featured', 'isActive', 'currentJob'].includes(key)) {
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
        await pool.execute(`UPDATE experiences SET ${setParts.join(', ')} WHERE id = ?`, params);

        const [rows] = await pool.execute('SELECT * FROM experiences WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        const payload = {
            ...row,
            _id: row.id,
            image: row.imageUrl,
            achievements: row.achievements ? JSON.parse(row.achievements) : [],
            technologies: row.technologies ? JSON.parse(row.technologies) : [],
            responsibilities: row.responsibilities ? JSON.parse(row.responsibilities) : [],
            skills: row.skills ? JSON.parse(row.skills) : [],
            tags: row.tags ? JSON.parse(row.tags) : []
        };

        return res.json({
            success: true,
            message: 'Experience updated successfully',
            data: payload
        });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update experience',
            error: error.message
        });
    }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM experiences WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        return res.json({
            success: true,
            message: 'Experience deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete experience',
            error: error.message
        });
    }
};

// Toggle experience status (active/inactive)
exports.toggleExperienceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const experience = experienceData.find(e => e._id === id);
        
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }
        
        experience.isActive = !experience.isActive;
        experience.updatedAt = new Date();
        
        res.json({
            success: true,
            message: `Experience ${experience.isActive ? 'activated' : 'deactivated'} successfully`,
            data: experience
        });
    } catch (error) {
        console.error('Error toggling experience status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle experience status',
            error: error.message
        });
    }
};

// Toggle featured status
exports.toggleExperienceFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        
        const experience = experienceData.find(e => e._id === id);
        
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }
        
        experience.featured = !experience.featured;
        experience.updatedAt = new Date();
        
        res.json({
            success: true,
            message: `Experience ${experience.featured ? 'featured' : 'unfeatured'} successfully`,
            data: experience
        });
    } catch (error) {
        console.error('Error toggling experience featured status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle experience featured status',
            error: error.message
        });
    }
};

// Reorder experiences
exports.reorderExperiences = async (req, res) => {
    try {
        const { orders } = req.body; // Array of { id, order }
        
        if (!Array.isArray(orders)) {
            return res.status(400).json({
                success: false,
                message: 'Orders must be an array'
            });
        }
        
        orders.forEach(({ id, order }) => {
            const experience = experienceData.find(e => e._id === id);
            if (experience) {
                experience.order = order;
                experience.updatedAt = new Date();
            }
        });
        
        res.json({
            success: true,
            message: 'Experiences reordered successfully'
        });
    } catch (error) {
        console.error('Error reordering experiences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder experiences',
            error: error.message
        });
    }
};

// Get experience statistics
exports.getExperienceStats = async (req, res) => {
    try {
        const total = experienceData.length;
        const active = experienceData.filter(e => e.isActive).length;
        const featured = experienceData.filter(e => e.featured).length;
        const currentJobs = experienceData.filter(e => e.currentJob).length;
        
        const typeStats = {};
        experienceData.filter(e => e.isActive).forEach(exp => {
            typeStats[exp.type] = (typeStats[exp.type] || 0) + 1;
        });
        
        const typeStatsArray = Object.entries(typeStats).map(([type, count]) => ({
            _id: type,
            count
        })).sort((a, b) => b.count - a.count);
        
        res.json({
            success: true,
            data: {
                total,
                active,
                featured,
                inactive: total - active,
                currentJobs,
                typeStats: typeStatsArray
            }
        });
    } catch (error) {
        console.error('Error getting experience stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get experience statistics',
            error: error.message
        });
    }
};

// Get experience types
exports.getExperienceOptions = async (req, res) => {
    try {
        const types = ['full-time', 'part-time', 'freelance', 'internship', 'remote'];
        
        res.json({
            success: true,
            data: { types }
        });
    } catch (error) {
        console.error('Error getting experience options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get experience options',
            error: error.message
        });
    }
};
