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
        console.warn('⚠️ Failed to store cert-service image in DB, keeping original value');
        return maybeDataUrl;
    }
};

const mapRow = (r) => ({
    _id: String(r.id),
    title: r.title,
    description: r.description,
    image: r.imageUrl,
    category: r.category,
    provider: r.provider,
    duration: r.duration,
    price: r.price,
    currency: r.currency,
    level: r.level,
    certificateProvided: Boolean(r.certificateProvided),
    onlineAvailable: Boolean(r.onlineAvailable),
    location: r.location,
    schedule: r.schedule,
    requirements: r.requirements ? JSON.parse(r.requirements) : [],
    outcomes: r.outcomes ? JSON.parse(r.outcomes) : [],
    featured: Boolean(r.featured),
    isActive: Boolean(r.isActive),
    views: r.views,
    enrollments: r.enrollments,
    rating: r.rating,
    tags: r.tags ? JSON.parse(r.tags) : [],
    instructor: r.instructor,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
});

// In-memory storage for demo (without database)
let certServiceData = [
    {
        _id: '1',
        title: 'Digital Marketing Certification',
        description: 'Complete digital marketing course with certification covering SEO, social media, and content marketing',
        image: '/images/digital-marketing.jpg',
        category: 'certification',
        provider: 'TRAVELLO Academy',
        duration: '3 months',
        price: 2500000,
        currency: 'IDR',
        level: 'intermediate',
        certificateProvided: true,
        onlineAvailable: true,
        location: 'Online',
        schedule: 'Flexible',
        requirements: ['Basic computer skills', 'Internet access'],
        outcomes: ['Digital marketing expertise', 'Certificate of completion', 'Portfolio projects'],
        featured: true,
        isActive: true,
        views: 1850,
        enrollments: 145,
        rating: 4.8,
        tags: ['marketing', 'digital', 'seo', 'social-media'],
        instructor: 'TRAVELLO Team',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
    },
    {
        _id: '2',
        title: 'Travel Photography Workshop',
        description: 'Intensive workshop on travel photography techniques and post-processing',
        image: '/images/photography-workshop.jpg',
        category: 'workshop',
        provider: 'TRAVELLO Academy',
        duration: '2 days',
        price: 1500000,
        currency: 'IDR',
        level: 'beginner',
        certificateProvided: true,
        onlineAvailable: false,
        location: 'Jakarta, Indonesia',
        schedule: 'Weekend',
        requirements: ['DSLR camera', 'Basic photography knowledge'],
        outcomes: ['Travel photography skills', 'Portfolio development', 'Networking opportunities'],
        featured: false,
        isActive: true,
        views: 920,
        enrollments: 38,
        rating: 4.6,
        tags: ['photography', 'travel', 'workshop'],
        instructor: 'TRAVELLO Team',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05')
    }
];

// Get all cert services for admin
exports.getAllCertServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, isActive, featured, level } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const where = [];
        const params = [];

        if (search) {
            where.push('(title LIKE ? OR description LIKE ? OR provider LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            where.push('category = ?');
            params.push(category);
        }
        if (level) {
            where.push('level = ?');
            params.push(level);
        }
        if (isActive !== undefined) {
            where.push('isActive = ?');
            params.push(isActive === 'true');
        }
        if (featured !== undefined) {
            where.push('featured = ?');
            params.push(featured === 'true');
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.execute(
            `SELECT * FROM cert_services ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM cert_services ${whereSql}`,
            params
        );

        const total = Number(countRows?.[0]?.total || 0);
        return res.json({
            success: true,
            data: (rows || []).map(mapRow),
            pagination: {
                current: pageNum,
                pageSize: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting cert services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certification services',
            error: error.message
        });
    }
};

// Get active cert services for users
exports.getActiveCertServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, featured, category, search, level, maxPrice } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const where = ['isActive = ?'];
        const params = [true];

        if (featured === 'true') {
            where.push('featured = ?');
            params.push(true);
        }
        if (category) {
            where.push('category = ?');
            params.push(category);
        }
        if (level) {
            where.push('(level = ? OR level = ?)');
            params.push(level, 'all');
        }
        if (maxPrice) {
            where.push('price <= ?');
            params.push(Number(maxPrice) || 0);
        }
        if (search) {
            where.push('(title LIKE ? OR description LIKE ? OR provider LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        const [rows] = await pool.execute(
            `SELECT * FROM cert_services ${whereSql} ORDER BY featured DESC, rating DESC, createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM cert_services ${whereSql}`,
            params
        );

        const total = Number(countRows?.[0]?.total || 0);
        return res.json({
            success: true,
            data: (rows || []).map(mapRow),
            pagination: {
                current: pageNum,
                pageSize: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting active cert services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certification services',
            error: error.message
        });
    }
};

// Get single cert service by ID
exports.getCertServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT * FROM cert_services WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Certification service not found'
            });
        }

        await pool.execute('UPDATE cert_services SET views = views + 1 WHERE id = ?', [id]);

        return res.json({
            success: true,
            data: mapRow({ ...row, views: (row.views || 0) + 1 })
        });
    } catch (error) {
        console.error('Error getting cert service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certification service',
            error: error.message
        });
    }
};

// Create new cert service
exports.createCertService = async (req, res) => {
    try {
        const {
            title,
            description,
            image,
            category,
            provider,
            duration,
            price,
            currency,
            level,
            certificateProvided,
            onlineAvailable,
            location,
            schedule,
            requirements,
            outcomes,
            featured,
            isActive,
            tags,
            instructor
        } = req.body;
        
        // Validate required fields
        if (!title || !description || !category || !provider || !duration || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, category, provider, duration, and price are required'
            });
        }
        
        const id = generateId();
        const storedImageUrl = await storeImageIfDataUrl(image || '/images/default-cert.jpg', 'cert_service');

        await pool.execute(
            'INSERT INTO cert_services (id, title, description, imageUrl, category, provider, duration, price, currency, level, certificateProvided, onlineAvailable, location, schedule, requirements, outcomes, featured, isActive, views, enrollments, rating, tags, instructor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                title,
                description,
                storedImageUrl,
                category,
                provider,
                duration,
                price,
                currency || 'IDR',
                level || 'all',
                certificateProvided !== undefined ? Boolean(certificateProvided) : true,
                onlineAvailable !== undefined ? Boolean(onlineAvailable) : true,
                location || '',
                schedule || '',
                JSON.stringify(requirements || []),
                JSON.stringify(outcomes || []),
                Boolean(featured),
                isActive !== undefined ? Boolean(isActive) : true,
                0,
                0,
                0,
                JSON.stringify(tags || []),
                instructor || 'TRAVELLO Team'
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM cert_services WHERE id = ? LIMIT 1', [id]);
        return res.status(201).json({
            success: true,
            message: 'Certification service created successfully',
            data: mapRow(rows[0])
        });
    } catch (error) {
        console.error('Error creating cert service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create certification service',
            error: error.message
        });
    }
};

// Update cert service
exports.updateCertService = async (req, res) => {
    try {
        const { id } = req.params;

        const allowed = [
            'title',
            'description',
            'image',
            'category',
            'provider',
            'duration',
            'price',
            'currency',
            'level',
            'certificateProvided',
            'onlineAvailable',
            'location',
            'schedule',
            'requirements',
            'outcomes',
            'featured',
            'isActive',
            'tags',
            'instructor'
        ];
        const updates = {};
        for (const k of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
        }

        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });

        const setParts = [];
        const values = [];
        for (const k of keys) {
            if (k === 'image') {
                setParts.push('imageUrl = ?');
                values.push(await storeImageIfDataUrl(updates.image, `cert_service_${id}`));
                continue;
            }
            if (k === 'requirements') {
                setParts.push('requirements = ?');
                values.push(JSON.stringify(updates.requirements || []));
                continue;
            }
            if (k === 'outcomes') {
                setParts.push('outcomes = ?');
                values.push(JSON.stringify(updates.outcomes || []));
                continue;
            }
            if (k === 'tags') {
                setParts.push('tags = ?');
                values.push(JSON.stringify(updates.tags || []));
                continue;
            }
            if (k === 'featured') {
                setParts.push('featured = ?');
                values.push(Boolean(updates.featured));
                continue;
            }
            if (k === 'isActive') {
                setParts.push('isActive = ?');
                values.push(Boolean(updates.isActive));
                continue;
            }
            if (k === 'certificateProvided') {
                setParts.push('certificateProvided = ?');
                values.push(Boolean(updates.certificateProvided));
                continue;
            }
            if (k === 'onlineAvailable') {
                setParts.push('onlineAvailable = ?');
                values.push(Boolean(updates.onlineAvailable));
                continue;
            }
            setParts.push(`${k} = ?`);
            values.push(updates[k]);
        }

        values.push(id);
        const [result] = await pool.execute(`UPDATE cert_services SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Certification service not found' });
        }

        const [rows] = await pool.execute('SELECT * FROM cert_services WHERE id = ? LIMIT 1', [id]);
        return res.json({
            success: true,
            message: 'Certification service updated successfully',
            data: mapRow(rows[0])
        });
    } catch (error) {
        console.error('Error updating cert service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update certification service',
            error: error.message
        });
    }
};

// Delete cert service
exports.deleteCertService = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM cert_services WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Certification service not found'
            });
        }

        return res.json({
            success: true,
            message: 'Certification service deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cert service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete certification service',
            error: error.message
        });
    }
};

// Toggle service status (active/inactive)
exports.toggleCertServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT isActive FROM cert_services WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Certification service not found'
            });
        }

        const next = !Boolean(row.isActive);
        await pool.execute('UPDATE cert_services SET isActive = ? WHERE id = ?', [next, id]);
        const [updatedRows] = await pool.execute('SELECT * FROM cert_services WHERE id = ? LIMIT 1', [id]);

        return res.json({
            success: true,
            message: `Certification service ${next ? 'activated' : 'deactivated'} successfully`,
            data: mapRow(updatedRows[0])
        });
    } catch (error) {
        console.error('Error toggling cert service status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle certification service status',
            error: error.message
        });
    }
};

// Toggle featured status
exports.toggleCertServiceFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT featured FROM cert_services WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Certification service not found'
            });
        }

        const next = !Boolean(row.featured);
        await pool.execute('UPDATE cert_services SET featured = ? WHERE id = ?', [next, id]);
        const [updatedRows] = await pool.execute('SELECT * FROM cert_services WHERE id = ? LIMIT 1', [id]);

        return res.json({
            success: true,
            message: `Certification service ${next ? 'featured' : 'unfeatured'} successfully`,
            data: mapRow(updatedRows[0])
        });
    } catch (error) {
        console.error('Error toggling cert service featured status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle certification service featured status',
            error: error.message
        });
    }
};

// Get cert service statistics
exports.getCertServiceStats = async (req, res) => {
    try {
        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM cert_services');
        const [[{ active }]] = await pool.execute('SELECT COUNT(*) as active FROM cert_services WHERE isActive = TRUE');
        const [[{ featured }]] = await pool.execute('SELECT COUNT(*) as featured FROM cert_services WHERE featured = TRUE');
        const [[{ totalViews }]] = await pool.execute('SELECT COALESCE(SUM(views), 0) as totalViews FROM cert_services');
        const [[{ totalEnrollments }]] = await pool.execute('SELECT COALESCE(SUM(enrollments), 0) as totalEnrollments FROM cert_services');
        const [[{ avgRating }]] = await pool.execute('SELECT COALESCE(AVG(rating), 0) as avgRating FROM cert_services');

        const [categoryStats] = await pool.execute(
            'SELECT category as _id, COUNT(*) as count FROM cert_services WHERE isActive = TRUE GROUP BY category ORDER BY count DESC'
        );

        return res.json({
            success: true,
            data: {
                total,
                active,
                featured,
                inactive: total - active,
                totalViews,
                totalEnrollments,
                avgRating: Number(avgRating || 0).toFixed(1),
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error getting cert service stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certification service statistics',
            error: error.message
        });
    }
};

// Get categories and levels
exports.getCertServiceOptions = async (req, res) => {
    try {
        const categories = ['training', 'certification', 'consulting', 'workshop', 'other'];
        const levels = ['beginner', 'intermediate', 'advanced', 'all'];
        
        res.json({
            success: true,
            data: {
                categories,
                levels
            }
        });
    } catch (error) {
        console.error('Error getting cert service options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certification service options',
            error: error.message
        });
    }
};
