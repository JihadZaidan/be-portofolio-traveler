const LandingPage = require('../models/LandingPage');
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
        console.warn('⚠️ Failed to store landing image in DB, keeping original value');
        return maybeDataUrl;
    }
};

const ensureHeroImagesTable = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS hero_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                imageUrl TEXT NOT NULL,
                orderIndex INT DEFAULT 0,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_orderIndex (orderIndex),
                INDEX idx_isActive (isActive)
            )
        `);

        const [cols] = await pool.execute("SHOW COLUMNS FROM hero_images");
        const colNames = new Set((cols || []).map((c) => String(c.Field)));
        if (!colNames.has('orderIndex')) {
            await pool.execute('ALTER TABLE hero_images ADD COLUMN orderIndex INT DEFAULT 0');
        }
        if (!colNames.has('isActive')) {
            await pool.execute('ALTER TABLE hero_images ADD COLUMN isActive BOOLEAN DEFAULT TRUE');
        }
        if (!colNames.has('createdAt')) {
            await pool.execute('ALTER TABLE hero_images ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }
    } catch (e) {
        console.warn('⚠️ Could not ensure hero_images table:', e?.message || e);
    }
};

const ensureHomePagesTable = async () => {
    try {
        try {
            const [homeTable] = await pool.execute("SHOW TABLES LIKE 'home_pages'");
            const homeExists = Array.isArray(homeTable) && homeTable.length > 0;
            if (!homeExists) {
                const [heroTable] = await pool.execute("SHOW TABLES LIKE 'hero_content'");
                const heroExists = Array.isArray(heroTable) && heroTable.length > 0;
                if (heroExists) {
                    await pool.execute('RENAME TABLE hero_content TO home_pages');
                }
            }
        } catch {
            // ignore
        }

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS home_pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                heroBadge VARCHAR(255),
                heroDescription TEXT,
                heroBrands JSON,
                storiesDescription TEXT,
                aboutDescription TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_isActive (isActive),
                INDEX idx_createdAt (createdAt)
            )
        `);

        try {
            const [cols] = await pool.execute("SHOW COLUMNS FROM home_pages");
            const colNames = new Set((cols || []).map((c) => String(c.Field)));
            if (!colNames.has('storiesDescription')) {
                await pool.execute('ALTER TABLE home_pages ADD COLUMN storiesDescription TEXT');
            }
            if (!colNames.has('aboutDescription')) {
                await pool.execute('ALTER TABLE home_pages ADD COLUMN aboutDescription TEXT');
            }
            if (!colNames.has('heroBrands')) {
                await pool.execute('ALTER TABLE home_pages ADD COLUMN heroBrands JSON');
            }
            if (!colNames.has('heroBadge')) {
                await pool.execute('ALTER TABLE home_pages ADD COLUMN heroBadge VARCHAR(255)');
            }
            if (!colNames.has('heroDescription')) {
                await pool.execute('ALTER TABLE home_pages ADD COLUMN heroDescription TEXT');
            }

            // Migrate data from older canonical columns (badge/description/brands) if present
            // into the preferred hero* columns.
            const hasBadge = colNames.has('badge');
            const hasDescription = colNames.has('description');
            const hasBrands = colNames.has('brands');
            if (hasBadge) {
                await pool.execute('UPDATE home_pages SET heroBadge = COALESCE(heroBadge, badge)');
            }
            if (hasDescription) {
                await pool.execute('UPDATE home_pages SET heroDescription = COALESCE(heroDescription, description)');
            }
            if (hasBrands) {
                await pool.execute('UPDATE home_pages SET heroBrands = COALESCE(heroBrands, brands)');
            }

            // Also keep legacy columns in sync (if they still exist) so the table doesn't look "double".
            // This is safe to run even when the legacy columns are already dropped.
            if (hasBadge) {
                await pool.execute('UPDATE home_pages SET badge = COALESCE(badge, heroBadge)');
                await pool.execute('UPDATE home_pages SET badge = heroBadge');
            }
            if (hasDescription) {
                await pool.execute('UPDATE home_pages SET description = COALESCE(description, heroDescription)');
                await pool.execute('UPDATE home_pages SET description = heroDescription');
            }
            if (hasBrands) {
                await pool.execute('UPDATE home_pages SET brands = COALESCE(brands, heroBrands)');
                await pool.execute('UPDATE home_pages SET brands = heroBrands');
            }
        } catch {
            // ignore
        }

        const [existingRows] = await pool.execute('SELECT id FROM home_pages ORDER BY id DESC LIMIT 1');
        const hasRow = Array.isArray(existingRows) && existingRows.length > 0;
        if (hasRow) return;

        let heroBadge = null;
        let heroDescription = null;
        let heroBrands = [];
        let aboutDescription = null;
        try {
            const [heroRows] = await pool.execute('SELECT * FROM home_pages ORDER BY createdAt DESC LIMIT 1');
            const heroRow = heroRows && heroRows[0] ? heroRows[0] : null;
            if (heroRow) {
                heroBadge = heroRow.heroBadge ?? heroRow.badge ?? null;
                heroDescription = heroRow.heroDescription ?? heroRow.description ?? null;
                try {
                    heroBrands = (heroRow.heroBrands ?? heroRow.brands) ? JSON.parse(heroRow.heroBrands ?? heroRow.brands) : [];
                } catch {
                    heroBrands = [];
                }
            }
        } catch {
            // ignore
        }

        try {
            const [aboutRows] = await pool.execute('SELECT * FROM landing_about ORDER BY createdAt DESC LIMIT 1');
            const aboutRow = aboutRows && aboutRows[0] ? aboutRows[0] : null;
            if (aboutRow) {
                aboutDescription = aboutRow.description ?? null;
            }
        } catch {
            // ignore
        }

        await pool.execute(
            'INSERT INTO home_pages (heroBadge, heroDescription, heroBrands, storiesDescription, aboutDescription, isActive) VALUES (?, ?, ?, ?, ?, 1)',
            [
                heroBadge,
                heroDescription,
                JSON.stringify(heroBrands || []),
                'Snippets from our global adventures.',
                aboutDescription
            ]
        );
    } catch (e) {
        console.warn('⚠️ Could not ensure home_pages table:', e?.message || e);
    }
};

// HOME PAGES (MySQL)
exports.getHomePages = async (_req, res) => {
    try {
        await ensureHomePagesTable();
        const [rows] = await pool.execute('SELECT * FROM home_pages ORDER BY createdAt DESC');
        const data = (rows || []).map((r) => ({
            ...r,
            heroBrands: r.heroBrands ? JSON.parse(r.heroBrands) : [],
            // compatibility fields
            badge: r.heroBadge ?? '',
            description: r.heroDescription ?? '',
            brands: r.heroBrands ? JSON.parse(r.heroBrands) : []
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getting home pages:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch home pages' });
    }
};

exports.upsertHomePages = async (req, res) => {
    try {
        await ensureHomePagesTable();
        const {
            badge = null,
            description = null,
            brands = null,
            heroBadge = null,
            heroDescription = null,
            heroBrands = null,
            storiesDescription = null,
            aboutDescription = null,
            isActive = true
        } = req.body || {};

        const finalHeroBadge = heroBadge != null ? heroBadge : badge;
        const finalHeroDescription = heroDescription != null ? heroDescription : description;
        const finalHeroBrands = heroBrands != null ? heroBrands : brands;

        const [existingRows] = await pool.execute('SELECT * FROM home_pages ORDER BY id DESC LIMIT 1');
        const existing = existingRows && existingRows[0] ? existingRows[0] : null;

        if (!existing) {
            await pool.execute(
                'INSERT INTO home_pages (heroBadge, heroDescription, heroBrands, storiesDescription, aboutDescription, isActive) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    finalHeroBadge,
                    finalHeroDescription,
                    JSON.stringify(finalHeroBrands || []),
                    storiesDescription,
                    aboutDescription,
                    Boolean(isActive)
                ]
            );
        } else {
            const updates = {};
            if (Object.prototype.hasOwnProperty.call(req.body || {}, 'badge') || Object.prototype.hasOwnProperty.call(req.body || {}, 'heroBadge')) {
                updates.heroBadge = finalHeroBadge;
            }
            if (
                Object.prototype.hasOwnProperty.call(req.body || {}, 'description') ||
                Object.prototype.hasOwnProperty.call(req.body || {}, 'heroDescription')
            ) {
                updates.heroDescription = finalHeroDescription;
            }
            if (Object.prototype.hasOwnProperty.call(req.body || {}, 'brands') || Object.prototype.hasOwnProperty.call(req.body || {}, 'heroBrands')) {
                updates.heroBrands = JSON.stringify(finalHeroBrands || []);
            }
            if (Object.prototype.hasOwnProperty.call(req.body || {}, 'storiesDescription')) updates.storiesDescription = storiesDescription;
            if (Object.prototype.hasOwnProperty.call(req.body || {}, 'aboutDescription')) updates.aboutDescription = aboutDescription;
            if (Object.prototype.hasOwnProperty.call(req.body || {}, 'isActive')) updates.isActive = Boolean(isActive);

            const keys = Object.keys(updates);
            if (keys.length) {
                const setClause = keys.map((k) => `${k} = ?`).join(', ');
                const values = keys.map((k) => updates[k]);
                values.push(existing.id);
                await pool.execute(`UPDATE home_pages SET ${setClause} WHERE id = ?`, values);
            }
        }

        const [rows] = await pool.execute('SELECT * FROM home_pages ORDER BY id DESC LIMIT 1');
        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                ...row,
                heroBrands: row?.heroBrands ? JSON.parse(row.heroBrands) : [],
                badge: row?.heroBadge ?? '',
                description: row?.heroDescription ?? '',
                brands: row?.heroBrands ? JSON.parse(row.heroBrands) : []
            }
        });
    } catch (error) {
        console.error('Error upserting home pages:', error);
        return res.status(500).json({ success: false, message: 'Failed to update home pages' });
    }
};

// In-memory storage for demo (without database)
let landingPageData = {
    hero: {
        title: 'TRAVELLO - Your Travel Partner',
        subtitle: 'Discover amazing places around the world',
        backgroundImage: '/images/hero-bg.jpg',
        ctaText: 'Explore Now',
        isActive: true
    },
    destinations: [
        {
            _id: '1',
            name: 'Bali Paradise',
            description: 'Beautiful beaches and temples',
            image: '/images/bali.jpg',
            price: 2500000,
            rating: 4.5,
            category: 'beach',
            isActive: true,
            createdAt: new Date()
        }
    ],
    services: [
        {
            _id: '1',
            title: 'Tour Packages',
            description: 'Complete travel packages',
            icon: 'fas fa-suitcase',
            isActive: true
        }
    ],
    testimonials: [
        {
            _id: '1',
            name: 'John Doe',
            location: 'Jakarta',
            message: 'Amazing experience!',
            rating: 5,
            avatar: '/images/avatar1.jpg',
            isActive: true,
            createdAt: new Date()
        }
    ],
    about: {
        title: 'About TRAVELLO',
        description: 'We are your trusted travel partner',
        image: '/images/about.jpg',
        features: [
            { title: 'Expert Guides', description: 'Professional tour guides' },
            { title: 'Best Price', description: 'Competitive pricing' }
        ],
        isActive: true
    },
    contact: {
        email: 'info@travello.com',
        phone: '+62 812-3456-7890',
        address: 'Jakarta, Indonesia',
        socialMedia: {
            facebook: 'travello',
            instagram: 'travello_id'
        },
        isActive: true
    },
    seo: {
        metaTitle: 'TRAVELLO - Your Travel Partner',
        metaDescription: 'Discover amazing places',
        keywords: ['travel', 'tourism', 'indonesia']
    }
};

// Get all landing page items (for admin frontend table)
exports.getAllLandingPages = async (req, res) => {
    try {
        const { includeUser } = req.query;

        const [rows] = await pool.execute(
            'SELECT * FROM landing_pages ORDER BY orderIndex ASC, createdAt DESC'
        );

        const pages = (rows || []).map((row) => ({
            ...row,
            // frontend expects createdBy string; includeUser is currently ignored (no join)
            createdBy: row.createdBy || (includeUser ? 'admin' : row.createdBy)
        }));

        return res.status(200).json({
            success: true,
            data: { pages }
        });
    } catch (error) {
        console.error('Error getting landing pages:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch landing pages'
        });
    }
};

exports.createLandingPageItem = async (req, res) => {
    try {
        const {
            section,
            title,
            subtitle = null,
            content = null,
            imageUrl = null,
            buttonText = null,
            buttonLink = null,
            orderIndex = 0,
            isActive = true,
            createdBy = 'admin'
        } = req.body || {};

        if (!section || !title) {
            return res.status(400).json({
                success: false,
                message: 'section and title are required'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO landing_pages
                (section, title, subtitle, content, imageUrl, buttonText, buttonLink, orderIndex, isActive, createdBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                section,
                title,
                subtitle,
                content,
                imageUrl,
                buttonText,
                buttonLink,
                Number(orderIndex) || 0,
                Boolean(isActive),
                createdBy
            ]
        );

        const id = result.insertId;
        const [rows] = await pool.execute('SELECT * FROM landing_pages WHERE id = ? LIMIT 1', [id]);

        return res.status(201).json({
            success: true,
            data: { page: rows[0] }
        });
    } catch (error) {
        console.error('Error creating landing page item:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create landing page item'
        });
    }
};

exports.updateLandingPageItem = async (req, res) => {
    try {
        const { id } = req.params;

        const allowed = [
            'section',
            'title',
            'subtitle',
            'content',
            'imageUrl',
            'buttonText',
            'buttonLink',
            'orderIndex',
            'isActive',
            'createdBy'
        ];

        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates[key] = req.body[key];
            }
        }

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const setClause = keys.map((k) => `${k} = ?`).join(', ');
        const values = keys.map((k) => {
            if (k === 'orderIndex') return Number(updates[k]) || 0;
            if (k === 'isActive') return Boolean(updates[k]);
            return updates[k];
        });
        values.push(id);

        const [result] = await pool.execute(
            `UPDATE landing_pages SET ${setClause} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Landing page item not found'
            });
        }

        const [rows] = await pool.execute('SELECT * FROM landing_pages WHERE id = ? LIMIT 1', [id]);

        return res.status(200).json({
            success: true,
            data: { page: rows[0] }
        });
    } catch (error) {
        console.error('Error updating landing page item:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update landing page item'
        });
    }
};

exports.deleteLandingPageItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM landing_pages WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Landing page item not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Landing page item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting landing page item:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete landing page item'
        });
    }
};

// HERO CONTENT (MySQL)
exports.getHeroContents = async (_req, res) => {
    try {
        await ensureHomePagesTable();
        const [rows] = await pool.execute('SELECT * FROM home_pages ORDER BY createdAt DESC');
        const data = (rows || []).map((r) => ({
            ...r,
            badge: r.heroBadge ?? '',
            description: r.heroDescription ?? '',
            brands: r.heroBrands ? JSON.parse(r.heroBrands) : []
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getting hero content:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch hero content' });
    }
};

exports.createHeroContent = async (req, res) => {
    try {
        const { description = '', badge = '', brands = [], isActive = true } = req.body || {};
        await ensureHomePagesTable();
        await pool.execute(
            'INSERT INTO home_pages (heroDescription, heroBadge, heroBrands, isActive) VALUES (?, ?, ?, ?)',
            [description, badge, JSON.stringify(brands || []), Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM home_pages ORDER BY id DESC LIMIT 1');
        const row = rows[0];
        return res.status(201).json({
            success: true,
            data: {
                ...row,
                badge: row?.heroBadge ?? '',
                description: row?.heroDescription ?? '',
                brands: row?.heroBrands ? JSON.parse(row.heroBrands) : []
            }
        });
    } catch (error) {
        console.error('Error creating hero content:', error);
        return res.status(500).json({ success: false, message: 'Failed to create hero content' });
    }
};

exports.updateHeroContent = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['description', 'badge', 'brands', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates[key] = req.body[key];
            }
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });

        await ensureHomePagesTable();

        const setClause = keys
            .map((k) => {
                if (k === 'badge') return 'heroBadge = ?';
                if (k === 'description') return 'heroDescription = ?';
                if (k === 'brands') return 'heroBrands = ?';
                return `${k} = ?`;
            })
            .join(', ');
        const values = keys.map((k) => {
            if (k === 'brands') return JSON.stringify(updates[k] || []);
            if (k === 'isActive') return Boolean(updates[k]);
            return updates[k];
        });
        values.push(id);

        const [result] = await pool.execute(`UPDATE home_pages SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hero content not found' });

        const [rows] = await pool.execute('SELECT * FROM home_pages WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                ...row,
                badge: row?.heroBadge ?? '',
                description: row?.heroDescription ?? '',
                brands: row?.heroBrands ? JSON.parse(row.heroBrands) : []
            }
        });
    } catch (error) {
        console.error('Error updating hero content:', error);
        return res.status(500).json({ success: false, message: 'Failed to update hero content' });
    }
};

exports.deleteHeroContent = async (req, res) => {
    try {
        const { id } = req.params;
        await ensureHomePagesTable();
        const [result] = await pool.execute('DELETE FROM home_pages WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hero content not found' });
        return res.status(200).json({ success: true, message: 'Hero content deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero content:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete hero content' });
    }
};

// HERO IMAGES (MySQL)
exports.getHeroImages = async (_req, res) => {
    try {
        await ensureHeroImagesTable();
        let rows = [];
        try {
            const [r1] = await pool.execute('SELECT * FROM hero_images ORDER BY orderIndex ASC, createdAt DESC');
            rows = r1 || [];
        } catch (e) {
            if (e && e.code === 'ER_BAD_FIELD_ERROR') {
                const [r2] = await pool.execute('SELECT * FROM hero_images ORDER BY orderIndex ASC, id DESC');
                rows = r2 || [];
            } else {
                throw e;
            }
        }
        return res.status(200).json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Error getting hero images:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch hero images' });
    }
};

exports.createHeroImage = async (req, res) => {
    try {
        await ensureHeroImagesTable();
        const { imageUrl, orderIndex = 0, isActive = true } = req.body || {};
        if (!imageUrl) return res.status(400).json({ success: false, message: 'imageUrl is required' });

        const storedUrl = await storeImageIfDataUrl(imageUrl, 'hero_image');
        await pool.execute(
            'INSERT INTO hero_images (imageUrl, orderIndex, isActive) VALUES (?, ?, ?)',
            [storedUrl, Number(orderIndex) || 0, Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM hero_images ORDER BY id DESC LIMIT 1');
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating hero image:', error);
        return res.status(500).json({ success: false, message: 'Failed to create hero image' });
    }
};

exports.updateHeroImage = async (req, res) => {
    try {
        await ensureHeroImagesTable();
        const { id } = req.params;
        const allowed = ['imageUrl', 'orderIndex', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates[key] = req.body[key];
            }
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });

        const setParts = [];
        const values = [];
        for (const k of keys) {
            if (k === 'imageUrl') {
                setParts.push('imageUrl = ?');
                values.push(await storeImageIfDataUrl(updates.imageUrl, `hero_image_${id}`));
                continue;
            }
            if (k === 'orderIndex') {
                setParts.push('orderIndex = ?');
                values.push(Number(updates.orderIndex) || 0);
                continue;
            }
            if (k === 'isActive') {
                setParts.push('isActive = ?');
                values.push(Boolean(updates.isActive));
                continue;
            }
        }
        values.push(id);
        const [result] = await pool.execute(`UPDATE hero_images SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hero image not found' });

        const [rows] = await pool.execute('SELECT * FROM hero_images WHERE id = ? LIMIT 1', [id]);
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating hero image:', error);
        return res.status(500).json({ success: false, message: 'Failed to update hero image' });
    }
};

exports.deleteHeroImage = async (req, res) => {
    try {
        await ensureHeroImagesTable();
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM hero_images WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hero image not found' });
        return res.status(200).json({ success: true, message: 'Hero image deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero image:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete hero image' });
    }
};

// ABOUT (MySQL)
exports.getAboutItems = async (_req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM landing_about ORDER BY createdAt DESC');
        const data = (rows || []).map((r) => ({
            ...r,
            image: r.imageUrl,
            experience: r.experience ? JSON.parse(r.experience) : []
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getting about items:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch about items' });
    }
};

exports.createAboutItem = async (req, res) => {
    try {
        const { image, imageUrl, description = '', experience = [], isActive = true } = req.body || {};
        const inputImage = imageUrl || image || null;
        const storedUrl = inputImage ? await storeImageIfDataUrl(inputImage, 'about') : null;

        await pool.execute(
            'INSERT INTO landing_about (imageUrl, description, experience, isActive) VALUES (?, ?, ?, ?)',
            [storedUrl, description, JSON.stringify(experience || []), Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM landing_about ORDER BY id DESC LIMIT 1');
        const row = rows[0];
        return res.status(201).json({
            success: true,
            data: { ...row, image: row.imageUrl, experience: row.experience ? JSON.parse(row.experience) : [] }
        });
    } catch (error) {
        console.error('Error creating about item:', error);
        return res.status(500).json({ success: false, message: 'Failed to create about item' });
    }
};

exports.updateAboutItem = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['image', 'imageUrl', 'description', 'experience', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates[key] = req.body[key];
            }
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });

        const setParts = [];
        const values = [];
        if (Object.prototype.hasOwnProperty.call(updates, 'image') || Object.prototype.hasOwnProperty.call(updates, 'imageUrl')) {
            const inputImage = updates.imageUrl || updates.image;
            const storedUrl = inputImage ? await storeImageIfDataUrl(inputImage, `about_${id}`) : null;
            setParts.push('imageUrl = ?');
            values.push(storedUrl);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'description')) {
            setParts.push('description = ?');
            values.push(updates.description);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'experience')) {
            setParts.push('experience = ?');
            values.push(JSON.stringify(updates.experience || []));
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'isActive')) {
            setParts.push('isActive = ?');
            values.push(Boolean(updates.isActive));
        }

        values.push(id);
        const [result] = await pool.execute(`UPDATE landing_about SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'About item not found' });

        const [rows] = await pool.execute('SELECT * FROM landing_about WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: { ...row, image: row.imageUrl, experience: row.experience ? JSON.parse(row.experience) : [] }
        });
    } catch (error) {
        console.error('Error updating about item:', error);
        return res.status(500).json({ success: false, message: 'Failed to update about item' });
    }
};

exports.deleteAboutItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM landing_about WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'About item not found' });
        return res.status(200).json({ success: true, message: 'About item deleted successfully' });
    } catch (error) {
        console.error('Error deleting about item:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete about item' });
    }
};

// FAQS (MySQL)
exports.getFaqs = async (_req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY orderIndex ASC, createdAt DESC');
        return res.status(200).json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Error getting faqs:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch faqs' });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const { question, answer, orderIndex = 0, isActive = true } = req.body || {};
        if (!question || !answer) return res.status(400).json({ success: false, message: 'question and answer are required' });
        await pool.execute(
            'INSERT INTO faqs (question, answer, orderIndex, isActive) VALUES (?, ?, ?, ?)',
            [question, answer, Number(orderIndex) || 0, Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY id DESC LIMIT 1');
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating faq:', error);
        return res.status(500).json({ success: false, message: 'Failed to create faq' });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['question', 'answer', 'orderIndex', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });
        const setClause = keys.map((k) => `${k} = ?`).join(', ');
        const values = keys.map((k) => {
            if (k === 'orderIndex') return Number(updates[k]) || 0;
            if (k === 'isActive') return Boolean(updates[k]);
            return updates[k];
        });
        values.push(id);
        const [result] = await pool.execute(`UPDATE faqs SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'FAQ not found' });
        const [rows] = await pool.execute('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating faq:', error);
        return res.status(500).json({ success: false, message: 'Failed to update faq' });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'FAQ not found' });
        return res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting faq:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete faq' });
    }
};

// CERTIFICATIONS (MySQL)
exports.getCertifications = async (_req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM certifications ORDER BY orderIndex ASC, createdAt DESC');
        const data = (rows || []).map((r) => ({
            ...r,
            logo: r.logoUrl
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getting certifications:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch certifications' });
    }
};

exports.createCertification = async (req, res) => {
    try {
        const { logo, logoUrl, title, subtitle = null, organization, orderIndex = 0, isActive = true } = req.body || {};
        if (!title || !organization) return res.status(400).json({ success: false, message: 'title and organization are required' });
        const inputLogo = logoUrl || logo || null;
        const storedLogoUrl = inputLogo ? await storeImageIfDataUrl(inputLogo, 'cert_logo') : null;
        await pool.execute(
            'INSERT INTO certifications (logoUrl, title, subtitle, organization, orderIndex, isActive) VALUES (?, ?, ?, ?, ?, ?)',
            [storedLogoUrl, title, subtitle, organization, Number(orderIndex) || 0, Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM certifications ORDER BY id DESC LIMIT 1');
        const row = rows[0];
        return res.status(201).json({ success: true, data: { ...row, logo: row.logoUrl } });
    } catch (error) {
        console.error('Error creating certification:', error);
        return res.status(500).json({ success: false, message: 'Failed to create certification' });
    }
};

exports.updateCertification = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['logo', 'logoUrl', 'title', 'subtitle', 'organization', 'orderIndex', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });

        const setParts = [];
        const values = [];
        if (Object.prototype.hasOwnProperty.call(updates, 'logo') || Object.prototype.hasOwnProperty.call(updates, 'logoUrl')) {
            const inputLogo = updates.logoUrl || updates.logo;
            const stored = inputLogo ? await storeImageIfDataUrl(inputLogo, `cert_logo_${id}`) : null;
            setParts.push('logoUrl = ?');
            values.push(stored);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'title')) {
            setParts.push('title = ?');
            values.push(updates.title);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'subtitle')) {
            setParts.push('subtitle = ?');
            values.push(updates.subtitle);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'organization')) {
            setParts.push('organization = ?');
            values.push(updates.organization);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'orderIndex')) {
            setParts.push('orderIndex = ?');
            values.push(Number(updates.orderIndex) || 0);
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'isActive')) {
            setParts.push('isActive = ?');
            values.push(Boolean(updates.isActive));
        }

        values.push(id);
        const [result] = await pool.execute(`UPDATE certifications SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Certification not found' });
        const [rows] = await pool.execute('SELECT * FROM certifications WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        return res.status(200).json({ success: true, data: { ...row, logo: row.logoUrl } });
    } catch (error) {
        console.error('Error updating certification:', error);
        return res.status(500).json({ success: false, message: 'Failed to update certification' });
    }
};

exports.deleteCertification = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM certifications WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Certification not found' });
        return res.status(200).json({ success: true, message: 'Certification deleted successfully' });
    } catch (error) {
        console.error('Error deleting certification:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete certification' });
    }
};

// SERVICES LIST (MySQL)
exports.getServicesList = async (_req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM services ORDER BY orderIndex ASC, createdAt DESC');
        return res.status(200).json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Error getting services list:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch services' });
    }
};

exports.createServiceItem = async (req, res) => {
    try {
        const { name, orderIndex = 0, isActive = true } = req.body || {};
        if (!name) return res.status(400).json({ success: false, message: 'name is required' });
        await pool.execute('INSERT INTO services (name, orderIndex, isActive) VALUES (?, ?, ?)', [name, Number(orderIndex) || 0, Boolean(isActive)]);
        const [rows] = await pool.execute('SELECT * FROM services ORDER BY id DESC LIMIT 1');
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating service item:', error);
        return res.status(500).json({ success: false, message: 'Failed to create service' });
    }
};

exports.updateServiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['name', 'orderIndex', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
        }
        const keys = Object.keys(updates);
        if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to update' });
        const setClause = keys.map((k) => `${k} = ?`).join(', ');
        const values = keys.map((k) => {
            if (k === 'orderIndex') return Number(updates[k]) || 0;
            if (k === 'isActive') return Boolean(updates[k]);
            return updates[k];
        });
        values.push(id);
        const [result] = await pool.execute(`UPDATE services SET ${setClause} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Service not found' });
        const [rows] = await pool.execute('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating service item:', error);
        return res.status(500).json({ success: false, message: 'Failed to update service' });
    }
};

exports.deleteServiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM services WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Service not found' });
        return res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service item:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
};

// PORTFOLIO ITEMS (MySQL)
exports.getPortfolioItems = async (_req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM portfolio_items ORDER BY createdAt DESC');
        const data = (rows || []).map((r) => ({
            ...r,
            images: r.images ? JSON.parse(r.images) : [],
            tags: r.tags ? JSON.parse(r.tags) : []
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getting portfolio items:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch portfolio items' });
    }
};

exports.createPortfolioItem = async (req, res) => {
    try {
        const { images = [], tags = [], description = '', isActive = true } = req.body || {};
        const mappedImages = [];
        for (const img of images || []) {
            mappedImages.push(await storeImageIfDataUrl(img, 'portfolio_image'));
        }
        await pool.execute(
            'INSERT INTO portfolio_items (images, tags, description, isActive) VALUES (?, ?, ?, ?)',
            [JSON.stringify(mappedImages), JSON.stringify(tags || []), description, Boolean(isActive)]
        );
        const [rows] = await pool.execute('SELECT * FROM portfolio_items ORDER BY id DESC LIMIT 1');
        const row = rows[0];
        return res.status(201).json({
            success: true,
            data: {
                ...row,
                images: row.images ? JSON.parse(row.images) : [],
                tags: row.tags ? JSON.parse(row.tags) : []
            }
        });
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        return res.status(500).json({ success: false, message: 'Failed to create portfolio item' });
    }
};

exports.updatePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { images, tags, description, isActive } = req.body || {};

        const setParts = [];
        const values = [];
        if (images !== undefined) {
            const mappedImages = [];
            for (const img of images || []) {
                mappedImages.push(await storeImageIfDataUrl(img, `portfolio_image_${id}`));
            }
            setParts.push('images = ?');
            values.push(JSON.stringify(mappedImages));
        }
        if (tags !== undefined) {
            setParts.push('tags = ?');
            values.push(JSON.stringify(tags || []));
        }
        if (description !== undefined) {
            setParts.push('description = ?');
            values.push(description);
        }
        if (isActive !== undefined) {
            setParts.push('isActive = ?');
            values.push(Boolean(isActive));
        }

        if (!setParts.length) return res.status(400).json({ success: false, message: 'No fields to update' });
        values.push(id);
        const [result] = await pool.execute(`UPDATE portfolio_items SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Portfolio item not found' });

        const [rows] = await pool.execute('SELECT * FROM portfolio_items WHERE id = ? LIMIT 1', [id]);
        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                ...row,
                images: row.images ? JSON.parse(row.images) : [],
                tags: row.tags ? JSON.parse(row.tags) : []
            }
        });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        return res.status(500).json({ success: false, message: 'Failed to update portfolio item' });
    }
};

exports.deletePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM portfolio_items WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Portfolio item not found' });
        return res.status(200).json({ success: true, message: 'Portfolio item deleted successfully' });
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete portfolio item' });
    }
};

// Get active landing page content for users
exports.getLandingPage = async (req, res) => {
    try {
        const safeJsonParse = (value, fallback) => {
            if (value == null) return fallback;
            try {
                return JSON.parse(value);
            } catch {
                return fallback;
            }
        };

        const selectWithFallbacks = async (sqls, params = []) => {
            let lastErr;
            for (const sql of sqls) {
                try {
                    const [rows] = await pool.execute(sql, params);
                    return rows || [];
                } catch (e) {
                    lastErr = e;
                    if (e && (e.code === 'ER_BAD_FIELD_ERROR' || e.code === 'ER_NO_SUCH_TABLE')) {
                        continue;
                    }
                    throw e;
                }
            }
            return [];
        };

        await ensureHomePagesTable();

        const homeRows = await selectWithFallbacks([
            'SELECT * FROM home_pages WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1',
            'SELECT * FROM home_pages ORDER BY createdAt DESC LIMIT 1',
            'SELECT * FROM home_pages ORDER BY id DESC LIMIT 1'
        ]);
        const homeRow = homeRows && homeRows[0] ? homeRows[0] : null;

        const heroImageRows = await selectWithFallbacks([
            'SELECT * FROM hero_images WHERE isActive = 1 ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM hero_images ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM hero_images ORDER BY orderIndex ASC, id DESC'
        ]);

        const aboutRows = await selectWithFallbacks([
            'SELECT * FROM landing_about WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1',
            'SELECT * FROM landing_about ORDER BY createdAt DESC LIMIT 1',
            'SELECT * FROM landing_about ORDER BY id DESC LIMIT 1'
        ]);
        const aboutRow = aboutRows && aboutRows[0] ? aboutRows[0] : null;

        const servicesRows = await selectWithFallbacks([
            'SELECT * FROM services WHERE isActive = 1 ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM services ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM services ORDER BY orderIndex ASC, id DESC'
        ]);

        const certRows = await selectWithFallbacks([
            'SELECT * FROM certifications WHERE isActive = 1 ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM certifications ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM certifications ORDER BY orderIndex ASC, id DESC'
        ]);

        const faqRows = await selectWithFallbacks([
            'SELECT * FROM faqs WHERE isActive = 1 ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM faqs ORDER BY orderIndex ASC, createdAt DESC',
            'SELECT * FROM faqs ORDER BY orderIndex ASC, id DESC'
        ]);

        const expRows = await selectWithFallbacks([
            'SELECT * FROM experiences WHERE isActive = 1 ORDER BY `order` ASC, createdAt DESC LIMIT 20',
            'SELECT * FROM experiences ORDER BY `order` ASC, createdAt DESC LIMIT 20',
            'SELECT * FROM experiences ORDER BY `order` ASC, id DESC LIMIT 20'
        ]);

        const travelRows = await selectWithFallbacks([
            'SELECT * FROM travel_journals WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 20',
            'SELECT * FROM travel_journals ORDER BY createdAt DESC LIMIT 20',
            'SELECT * FROM travel_journals ORDER BY id DESC LIMIT 20'
        ]);

        const portfolioRows = await selectWithFallbacks([
            'SELECT * FROM portfolios WHERE isActive = 1 ORDER BY featured DESC, createdAt DESC LIMIT 50',
            'SELECT * FROM portfolios ORDER BY featured DESC, createdAt DESC LIMIT 50',
            'SELECT * FROM portfolios ORDER BY featured DESC, id DESC LIMIT 50'
        ]);

        const hero = homeRow
            ? {
                id: homeRow.id,
                description: homeRow.description || '',
                badge: homeRow.badge || '',
                brands: safeJsonParse(homeRow.brands, []),
                isActive: Boolean(homeRow.isActive)
            }
            : (landingPageData.hero && landingPageData.hero.isActive ? landingPageData.hero : null);

        const heroImages = (heroImageRows || []).map((row) => ({
            id: row.id,
            imageUrl: row.imageUrl || '',
            orderIndex: row.orderIndex,
            isActive: Boolean(row.isActive ?? row.is_active ?? row.active ?? true)
        }));

        const about = aboutRow
            ? {
                id: aboutRow.id,
                image: aboutRow.image || '',
                description: (homeRow && homeRow.aboutDescription != null ? homeRow.aboutDescription : aboutRow.description) || '',
                experience: safeJsonParse(aboutRow.experience, []),
                isActive: Boolean(aboutRow.isActive)
            }
            : (landingPageData.about && landingPageData.about.isActive ? landingPageData.about : null);

        const services = (servicesRows || []).map((row) => ({
            id: row.id,
            name: row.name || '',
            orderIndex: row.orderIndex,
            isActive: Boolean(row.isActive ?? row.is_active ?? row.active ?? true)
        }));

        const certifications = (certRows || []).map((row) => ({
            id: row.id,
            logo: row.logo || '',
            title: row.title || '',
            subtitle: row.subtitle || '',
            organization: row.organization || '',
            orderIndex: row.orderIndex,
            isActive: Boolean(row.isActive ?? row.is_active ?? row.active ?? true)
        }));

        const faqs = (faqRows || []).map((row) => ({
            id: row.id,
            question: row.question || '',
            answer: row.answer || '',
            orderIndex: row.orderIndex,
            isActive: Boolean(row.isActive ?? row.is_active ?? row.active ?? true)
        }));

        const experiences = (expRows || []).map((row) => ({
            _id: String(row.id),
            ...row,
            tags: safeJsonParse(row.tags, []),
            achievements: safeJsonParse(row.achievements, []),
            technologies: safeJsonParse(row.technologies, []),
            responsibilities: safeJsonParse(row.responsibilities, []),
            skills: safeJsonParse(row.skills, [])
        }));

        const travelJournals = (travelRows || []).map((row) => ({
            _id: String(row.id),
            ...row,
            tags: safeJsonParse(row.tags, [])
        }));

        const portfolios = (portfolioRows || []).map((row) => ({
            _id: String(row.id),
            ...row,
            tags: safeJsonParse(row.tags, []),
            technologies: safeJsonParse(row.technologies, [])
        }));

        const activeContent = {
            hero,
            heroImages,
            about,
            services,
            certifications,
            faqs,
            experiences,
            travelJournals,
            portfolios,
            homePage: homeRow
                ? {
                    badge: homeRow.badge || '',
                    description: homeRow.description || '',
                    brands: safeJsonParse(homeRow.brands, []),
                    storiesDescription: homeRow.storiesDescription || '',
                    aboutDescription: homeRow.aboutDescription || ''
                }
                : null,
            seo: landingPageData.seo
        };

        return res.json({
            success: true,
            data: activeContent
        });
    } catch (error) {
        console.error('Error getting landing page:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get landing page content',
            error: error.message
        });
    }
};

// Get full landing page content for admin
exports.getLandingPageAdmin = async (req, res) => {
    try {
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                lastUpdatedBy: 'system'
            });
        }
        
        res.json({
            success: true,
            data: landingPage
        });
    } catch (error) {
        console.error('Error getting admin landing page:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get landing page content',
            error: error.message
        });
    }
};

// Update hero section
exports.updateHero = async (req, res) => {
    try {
        const { title, subtitle, backgroundImage, ctaText, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                hero: { title, subtitle, backgroundImage, ctaText, isActive },
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.hero = { title, subtitle, backgroundImage, ctaText, isActive };
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        res.json({
            success: true,
            message: 'Hero section updated successfully',
            data: landingPage.hero
        });
    } catch (error) {
        console.error('Error updating hero:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update hero section',
            error: error.message
        });
    }
};

// Add destination
exports.addDestination = async (req, res) => {
    try {
        const { name, description, image, price, rating, category, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                destinations: [{ name, description, image, price, rating, category, isActive }],
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.destinations.push({ name, description, image, price, rating, category, isActive });
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        const newDestination = landingPage.destinations[landingPage.destinations.length - 1];
        
        res.json({
            success: true,
            message: 'Destination added successfully',
            data: newDestination
        });
    } catch (error) {
        console.error('Error adding destination:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add destination',
            error: error.message
        });
    }
};

// Update destination
exports.updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        const destination = landingPage.destinations.id(id);
        if (!destination) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }
        
        Object.assign(destination, updateData);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Destination updated successfully',
            data: destination
        });
    } catch (error) {
        console.error('Error updating destination:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update destination',
            error: error.message
        });
    }
};

// Delete destination
exports.deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        landingPage.destinations.pull(id);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Destination deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting destination:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete destination',
            error: error.message
        });
    }
};

// Add service
exports.addService = async (req, res) => {
    try {
        const { title, description, icon, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                services: [{ title, description, icon, isActive }],
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.services.push({ title, description, icon, isActive });
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        const newService = landingPage.services[landingPage.services.length - 1];
        
        res.json({
            success: true,
            message: 'Service added successfully',
            data: newService
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add service',
            error: error.message
        });
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        const service = landingPage.services.id(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        Object.assign(service, updateData);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service',
            error: error.message
        });
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        landingPage.services.pull(id);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service',
            error: error.message
        });
    }
};

// Add testimonial
exports.addTestimonial = async (req, res) => {
    try {
        const { name, location, message, rating, avatar, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                testimonials: [{ name, location, message, rating, avatar, isActive }],
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.testimonials.push({ name, location, message, rating, avatar, isActive });
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        const newTestimonial = landingPage.testimonials[landingPage.testimonials.length - 1];
        
        res.json({
            success: true,
            message: 'Testimonial added successfully',
            data: newTestimonial
        });
    } catch (error) {
        console.error('Error adding testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add testimonial',
            error: error.message
        });
    }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        const testimonial = landingPage.testimonials.id(id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        Object.assign(testimonial, updateData);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Testimonial updated successfully',
            data: testimonial
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update testimonial',
            error: error.message
        });
    }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        landingPage.testimonials.pull(id);
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete testimonial',
            error: error.message
        });
    }
};

// Update about section
exports.updateAbout = async (req, res) => {
    try {
        const { title, description, image, features, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                about: { title, description, image, features, isActive },
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.about = { title, description, image, features, isActive };
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        res.json({
            success: true,
            message: 'About section updated successfully',
            data: landingPage.about
        });
    } catch (error) {
        console.error('Error updating about:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update about section',
            error: error.message
        });
    }
};

// Update contact section
exports.updateContact = async (req, res) => {
    try {
        const { email, phone, address, socialMedia, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                contact: { email, phone, address, socialMedia, isActive },
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.contact = { email, phone, address, socialMedia, isActive };
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        res.json({
            success: true,
            message: 'Contact section updated successfully',
            data: landingPage.contact
        });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact section',
            error: error.message
        });
    }
};

// Update SEO
exports.updateSeo = async (req, res) => {
    try {
        const { metaTitle, metaDescription, keywords } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                seo: { metaTitle, metaDescription, keywords },
                lastUpdatedBy: req.user?.name || 'admin'
            });
        } else {
            landingPage.seo = { metaTitle, metaDescription, keywords };
            landingPage.lastUpdatedBy = req.user?.name || 'admin';
            landingPage.lastUpdatedAt = new Date();
            await landingPage.save();
        }
        
        res.json({
            success: true,
            message: 'SEO updated successfully',
            data: landingPage.seo
        });
    } catch (error) {
        console.error('Error updating SEO:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update SEO',
            error: error.message
        });
    }
};

// New endpoints for frontend compatibility

// Get all landing pages (for frontend table)
exports.getAllLandingPages = async (req, res) => {
    try {
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                lastUpdatedBy: 'system'
            });
        }
        
        // Transform data to match frontend interface
        const pages = [];
        
        // Add hero section
        if (landingPage.hero) {
            pages.push({
                id: 'hero_' + landingPage._id,
                section: 'Hero',
                title: landingPage.hero.title,
                subtitle: landingPage.hero.subtitle,
                buttonText: landingPage.hero.ctaText,
                imageUrl: landingPage.hero.backgroundImage,
                orderIndex: 1,
                isActive: landingPage.hero.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: landingPage.createdAt,
                updatedAt: landingPage.updatedAt
            });
        }
        
        // Add destinations
        landingPage.destinations.forEach((dest, index) => {
            pages.push({
                id: dest._id || 'dest_' + index,
                section: 'Destination',
                title: dest.name,
                subtitle: dest.description,
                imageUrl: dest.image,
                orderIndex: 2 + index,
                isActive: dest.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: dest.createdAt,
                updatedAt: landingPage.updatedAt
            });
        });
        
        // Add services
        landingPage.services.forEach((service, index) => {
            pages.push({
                id: service._id || 'service_' + index,
                section: 'Service',
                title: service.title,
                subtitle: service.description,
                orderIndex: 10 + index,
                isActive: service.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: landingPage.createdAt,
                updatedAt: landingPage.updatedAt
            });
        });
        
        // Add testimonials
        landingPage.testimonials.forEach((testimonial, index) => {
            pages.push({
                id: testimonial._id || 'testimonial_' + index,
                section: 'Testimonial',
                title: testimonial.name,
                subtitle: testimonial.location,
                content: testimonial.message,
                imageUrl: testimonial.avatar,
                orderIndex: 20 + index,
                isActive: testimonial.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: testimonial.createdAt,
                updatedAt: landingPage.updatedAt
            });
        });
        
        // Add about section
        if (landingPage.about) {
            pages.push({
                id: 'about_' + landingPage._id,
                section: 'About',
                title: landingPage.about.title,
                subtitle: landingPage.about.description,
                imageUrl: landingPage.about.image,
                orderIndex: 30,
                isActive: landingPage.about.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: landingPage.createdAt,
                updatedAt: landingPage.updatedAt
            });
        }
        
        // Add contact section
        if (landingPage.contact) {
            pages.push({
                id: 'contact_' + landingPage._id,
                section: 'Contact',
                title: landingPage.contact.email,
                subtitle: landingPage.contact.phone,
                content: landingPage.contact.address,
                orderIndex: 31,
                isActive: landingPage.contact.isActive,
                createdBy: landingPage.lastUpdatedBy,
                createdAt: landingPage.createdAt,
                updatedAt: landingPage.updatedAt
            });
        }
        
        res.json({
            success: true,
            message: 'Landing pages retrieved successfully',
            data: {
                pages: pages.sort((a, b) => a.orderIndex - b.orderIndex)
            }
        });
    } catch (error) {
        console.error('Error getting all landing pages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get landing pages',
            error: error.message
        });
    }
};

// Create new landing page item
exports.createLandingPageItem = async (req, res) => {
    try {
        const { section, title, subtitle, content, imageUrl, buttonText, buttonLink, orderIndex, isActive } = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            landingPage = await LandingPage.create({
                lastUpdatedBy: req.user?.name || 'admin'
            });
        }
        
        let newItem = null;
        
        switch(section) {
            case 'Hero':
                landingPage.hero = { title, subtitle, backgroundImage: imageUrl, ctaText: buttonText, isActive };
                newItem = landingPage.hero;
                break;
                
            case 'Destination':
                landingPage.destinations.push({
                    name: title,
                    description: subtitle,
                    image: imageUrl,
                    price: 0,
                    rating: 4.5,
                    category: 'beach',
                    isActive
                });
                newItem = landingPage.destinations[landingPage.destinations.length - 1];
                break;
                
            case 'Service':
                landingPage.services.push({
                    title,
                    description: subtitle,
                    icon: 'fas fa-star',
                    isActive
                });
                newItem = landingPage.services[landingPage.services.length - 1];
                break;
                
            case 'Testimonial':
                landingPage.testimonials.push({
                    name: title,
                    location: subtitle,
                    message: content,
                    rating: 5,
                    avatar: imageUrl,
                    isActive
                });
                newItem = landingPage.testimonials[landingPage.testimonials.length - 1];
                break;
                
            case 'About':
                landingPage.about = { title, description: subtitle, image: imageUrl, features: [], isActive };
                newItem = landingPage.about;
                break;
                
            case 'Contact':
                landingPage.contact = { email: title, phone: subtitle, address: content, socialMedia: {}, isActive };
                newItem = landingPage.contact;
                break;
        }
        
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Landing page item created successfully',
            data: newItem
        });
    } catch (error) {
        console.error('Error creating landing page item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create landing page item',
            error: error.message
        });
    }
};

// Update landing page item
exports.updateLandingPageItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        let updatedItem = null;
        
        // Handle different ID patterns
        if (id.startsWith('hero_')) {
            if (updateData.section === 'Hero') {
                landingPage.hero = {
                    title: updateData.title,
                    subtitle: updateData.subtitle,
                    backgroundImage: updateData.imageUrl,
                    ctaText: updateData.buttonText,
                    isActive: updateData.isActive
                };
                updatedItem = landingPage.hero;
            }
        } else if (id.startsWith('dest_') || id.match(/^[0-9a-fA-F]{24}$/)) {
            const destination = landingPage.destinations.id(id);
            if (destination) {
                Object.assign(destination, {
                    name: updateData.title,
                    description: updateData.subtitle,
                    image: updateData.imageUrl,
                    isActive: updateData.isActive
                });
                updatedItem = destination;
            }
        } else if (id.startsWith('service_')) {
            const serviceIndex = parseInt(id.replace('service_', ''));
            if (landingPage.services[serviceIndex]) {
                Object.assign(landingPage.services[serviceIndex], {
                    title: updateData.title,
                    description: updateData.subtitle,
                    isActive: updateData.isActive
                });
                updatedItem = landingPage.services[serviceIndex];
            }
        } else if (id.startsWith('testimonial_')) {
            const testimonialIndex = parseInt(id.replace('testimonial_', ''));
            if (landingPage.testimonials[testimonialIndex]) {
                Object.assign(landingPage.testimonials[testimonialIndex], {
                    name: updateData.title,
                    location: updateData.subtitle,
                    message: updateData.content,
                    avatar: updateData.imageUrl,
                    isActive: updateData.isActive
                });
                updatedItem = landingPage.testimonials[testimonialIndex];
            }
        }
        
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Landing page item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating landing page item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update landing page item',
            error: error.message
        });
    }
};

// Delete landing page item
exports.deleteLandingPageItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        let landingPage = await LandingPage.findOne({});
        
        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }
        
        // Handle different ID patterns
        if (id.startsWith('dest_') || id.match(/^[0-9a-fA-F]{24}$/)) {
            landingPage.destinations.pull(id);
        } else if (id.startsWith('service_')) {
            const serviceIndex = parseInt(id.replace('service_', ''));
            if (landingPage.services[serviceIndex]) {
                landingPage.services.splice(serviceIndex, 1);
            }
        } else if (id.startsWith('testimonial_')) {
            const testimonialIndex = parseInt(id.replace('testimonial_', ''));
            if (landingPage.testimonials[testimonialIndex]) {
                landingPage.testimonials.splice(testimonialIndex, 1);
            }
        }
        
        landingPage.lastUpdatedBy = req.user?.name || 'admin';
        landingPage.lastUpdatedAt = new Date();
        await landingPage.save();
        
        res.json({
            success: true,
            message: 'Landing page item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting landing page item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete landing page item',
            error: error.message
        });
    }
};
