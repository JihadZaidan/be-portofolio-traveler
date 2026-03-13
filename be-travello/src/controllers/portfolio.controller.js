const pool = require('../config/mysql.pool');
const { parseDataUrl } = require('./media.controller');
const MediaMySQL = require('../models/MediaMySQL');

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
        console.warn('⚠️ Failed to store portfolio image in DB, keeping original value');
        return maybeDataUrl;
    }
};

const ensurePortfoliosIsActiveColumn = async () => {
    try {
        const [cols] = await pool.execute(`SHOW COLUMNS FROM portfolios LIKE 'isActive'`);
        if (Array.isArray(cols) && cols.length > 0) return;
        await pool.execute(`ALTER TABLE portfolios ADD COLUMN isActive BOOLEAN DEFAULT TRUE`);
        try {
            await pool.execute(`CREATE INDEX idx_isActive ON portfolios (isActive)`);
        } catch {
            // ignore
        }
        console.log('✅ Added missing portfolios.isActive column');
    } catch (e) {
        // If this fails (permissions / index exists / table missing), don't block reads.
        console.warn('⚠️ Could not ensure portfolios.isActive column:', e?.message || e);
    }
};

const isMissingColumnError = (e, columnName) => {
    if (!e) return false;
    if (e.code !== 'ER_BAD_FIELD_ERROR') return false;
    const msg = String(e.sqlMessage || e.message || '');
    return msg.toLowerCase().includes(`unknown column '${columnName.toLowerCase()}'`);
};

const executeWithIsActiveFallback = async (sqlWithIsActive, sqlFallback, params) => {
    try {
        const [rows] = await pool.execute(sqlWithIsActive, params);
        return rows || [];
    } catch (e) {
        if (isMissingColumnError(e, 'isActive')) {
            const [rows] = await pool.execute(sqlFallback, params.filter((_, i) => i !== 0));
            return rows || [];
        }
        throw e;
    }
};

const mapPortfolioRow = (r) => ({
    _id: String(r.id),
    title: r.title,
    description: r.description,
    category: r.category,
    image: r.imageUrl,
    projectUrl: r.projectUrl,
    technologies: r.technologies ? JSON.parse(r.technologies) : [],
    tags: r.tags ? JSON.parse(r.tags) : [],
    featured: Boolean(r.featured),
    isActive: Boolean(r.isActive ?? r.is_active ?? r.active ?? true),
    client: r.client,
    projectDate: r.projectDate,
    author: r.author,
    views: r.views,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
});

// Get all portfolios for admin
exports.getAllPortfolios = async (req, res) => {
    try {
        await ensurePortfoliosIsActiveColumn();
        const { page = 1, limit = 10, search, category, isActive, featured } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const where = [];
        const params = [];

        if (search) {
            where.push('(title LIKE ? OR description LIKE ? OR client LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            where.push('category = ?');
            params.push(category);
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

        let rows;
        let countRows;
        try {
            try {
                [rows] = await pool.execute(
                    `SELECT * FROM portfolios ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
                    [...params, limitNum, offset]
                );
            } catch (eCreatedAt) {
                if (isMissingColumnError(eCreatedAt, 'createdAt')) {
                    [rows] = await pool.execute(
                        `SELECT * FROM portfolios ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
                        [...params, limitNum, offset]
                    );
                } else {
                    throw eCreatedAt;
                }
            }
            [countRows] = await pool.execute(
                `SELECT COUNT(*) as total FROM portfolios ${whereSql}`,
                params
            );
        } catch (e) {
            if (isMissingColumnError(e, 'isActive')) {
                const where2 = where.filter((x) => !x.includes('isActive'));
                const params2 = params.filter((_, idx) => {
                    // isActive is pushed before featured/category/search based on code above; easiest is to rebuild.
                    return true;
                });
                // rebuild params in same order without isActive
                const rebuiltWhere = [];
                const rebuiltParams = [];
                if (search) {
                    rebuiltWhere.push('(title LIKE ? OR description LIKE ? OR client LIKE ?)');
                    rebuiltParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
                }
                if (category) {
                    rebuiltWhere.push('category = ?');
                    rebuiltParams.push(category);
                }
                if (featured !== undefined) {
                    rebuiltWhere.push('featured = ?');
                    rebuiltParams.push(featured === 'true');
                }

                const whereSql2 = rebuiltWhere.length ? `WHERE ${rebuiltWhere.join(' AND ')}` : '';
                try {
                    [rows] = await pool.execute(
                        `SELECT * FROM portfolios ${whereSql2} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
                        [...rebuiltParams, limitNum, offset]
                    );
                } catch (eCreatedAt) {
                    if (isMissingColumnError(eCreatedAt, 'createdAt')) {
                        [rows] = await pool.execute(
                            `SELECT * FROM portfolios ${whereSql2} ORDER BY id DESC LIMIT ? OFFSET ?`,
                            [...rebuiltParams, limitNum, offset]
                        );
                    } else {
                        throw eCreatedAt;
                    }
                }
                [countRows] = await pool.execute(
                    `SELECT COUNT(*) as total FROM portfolios ${whereSql2}`,
                    rebuiltParams
                );
            } else {
                throw e;
            }
        }

        const total = Number(countRows?.[0]?.total || 0);
        return res.json({
            success: true,
            data: (rows || []).map(mapPortfolioRow),
            pagination: {
                current: pageNum,
                pageSize: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting portfolios:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolios',
            error: error.message
        });
    }
};

// Get active portfolios for users
exports.getActivePortfolios = async (req, res) => {
    try {
        await ensurePortfoliosIsActiveColumn();
        const { page = 1, limit = 10, featured, category, search } = req.query;
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
        if (search) {
            where.push('(title LIKE ? OR description LIKE ? OR client LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        let rows;
        let countRows;
        try {
            try {
                [rows] = await pool.execute(
                    `SELECT * FROM portfolios ${whereSql} ORDER BY featured DESC, createdAt DESC LIMIT ? OFFSET ?`,
                    [...params, limitNum, offset]
                );
            } catch (eCreatedAt) {
                if (isMissingColumnError(eCreatedAt, 'createdAt')) {
                    [rows] = await pool.execute(
                        `SELECT * FROM portfolios ${whereSql} ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?`,
                        [...params, limitNum, offset]
                    );
                } else {
                    throw eCreatedAt;
                }
            }
            [countRows] = await pool.execute(
                `SELECT COUNT(*) as total FROM portfolios ${whereSql}`,
                params
            );
        } catch (e) {
            if (isMissingColumnError(e, 'isActive')) {
                // remove active filter
                const where2 = where.filter((x) => !x.includes('isActive'));
                const params2 = params.slice(1);
                const whereSql2 = where2.length ? `WHERE ${where2.join(' AND ')}` : '';

                try {
                    [rows] = await pool.execute(
                        `SELECT * FROM portfolios ${whereSql2} ORDER BY featured DESC, createdAt DESC LIMIT ? OFFSET ?`,
                        [...params2, limitNum, offset]
                    );
                } catch (eCreatedAt) {
                    if (isMissingColumnError(eCreatedAt, 'createdAt')) {
                        [rows] = await pool.execute(
                            `SELECT * FROM portfolios ${whereSql2} ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?`,
                            [...params2, limitNum, offset]
                        );
                    } else {
                        throw eCreatedAt;
                    }
                }
                [countRows] = await pool.execute(
                    `SELECT COUNT(*) as total FROM portfolios ${whereSql2}`,
                    params2
                );
            } else {
                throw e;
            }
        }

        const total = Number(countRows?.[0]?.total || 0);
        return res.json({
            success: true,
            data: (rows || []).map(mapPortfolioRow),
            pagination: {
                current: pageNum,
                pageSize: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting active portfolios:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolios',
            error: error.message
        });
    }
};

// Get single portfolio by ID
exports.getPortfolioById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT * FROM portfolios WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }

        await pool.execute('UPDATE portfolios SET views = views + 1 WHERE id = ?', [id]);
        const mapped = mapPortfolioRow({ ...row, views: (row.views || 0) + 1 });
        return res.json({ success: true, data: mapped });
    } catch (error) {
        console.error('Error getting portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolio',
            error: error.message
        });
    }
};

// Create new portfolio
exports.createPortfolio = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            image,
            client,
            projectDate,
            technologies,
            projectUrl,
            featured,
            isActive,
            tags,
            author
        } = req.body;
        
        // Validate required fields
        if (!title || !category || !description || !client) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, description, and client are required'
            });
        }
        
        const storedImageUrl = await storeImageIfDataUrl(image || '/images/default-portfolio.jpg', 'portfolio');
        const techJson = JSON.stringify(technologies || []);
        const tagsJson = JSON.stringify(tags || []);

        await pool.execute(
            'INSERT INTO portfolios (title, description, category, imageUrl, projectUrl, technologies, tags, featured, isActive, client, projectDate, author, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                title,
                description,
                category,
                storedImageUrl,
                projectUrl || '',
                techJson,
                tagsJson,
                Boolean(featured),
                isActive !== undefined ? Boolean(isActive) : true,
                client,
                projectDate ? new Date(projectDate) : null,
                author || 'TRAVELLO Team',
                0
            ]
        );

        const [rows] = await pool.execute('SELECT * FROM portfolios ORDER BY id DESC LIMIT 1');
        return res.status(201).json({
            success: true,
            message: 'Portfolio created successfully',
            data: mapPortfolioRow(rows[0])
        });
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create portfolio',
            error: error.message
        });
    }
};

// Update portfolio
exports.updatePortfolio = async (req, res) => {
    try {
        const { id } = req.params;

        const allowed = ['title', 'category', 'description', 'image', 'client', 'projectDate', 'technologies', 'projectUrl', 'featured', 'isActive', 'tags', 'author'];
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
                values.push(await storeImageIfDataUrl(updates.image, `portfolio_${id}`));
                continue;
            }
            if (k === 'technologies') {
                setParts.push('technologies = ?');
                values.push(JSON.stringify(updates.technologies || []));
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
            if (k === 'projectDate') {
                setParts.push('projectDate = ?');
                values.push(updates.projectDate ? new Date(updates.projectDate) : null);
                continue;
            }
            if (k === 'projectUrl') {
                setParts.push('projectUrl = ?');
                values.push(updates.projectUrl);
                continue;
            }
            if (k === 'title') {
                setParts.push('title = ?');
                values.push(updates.title);
                continue;
            }
            if (k === 'category') {
                setParts.push('category = ?');
                values.push(updates.category);
                continue;
            }
            if (k === 'description') {
                setParts.push('description = ?');
                values.push(updates.description);
                continue;
            }
            if (k === 'client') {
                setParts.push('client = ?');
                values.push(updates.client);
                continue;
            }
            if (k === 'author') {
                setParts.push('author = ?');
                values.push(updates.author);
                continue;
            }
        }

        values.push(id);
        const [result] = await pool.execute(`UPDATE portfolios SET ${setParts.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }

        const [rows] = await pool.execute('SELECT * FROM portfolios WHERE id = ? LIMIT 1', [id]);
        return res.json({
            success: true,
            message: 'Portfolio updated successfully',
            data: mapPortfolioRow(rows[0])
        });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update portfolio',
            error: error.message
        });
    }
};

// Delete portfolio
exports.deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM portfolios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }
        return res.json({ success: true, message: 'Portfolio deleted successfully' });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete portfolio',
            error: error.message
        });
    }
};

// Toggle portfolio status (active/inactive)
exports.togglePortfolioStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT isActive FROM portfolios WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) return res.status(404).json({ success: false, message: 'Portfolio not found' });

        const next = !Boolean(row.isActive);
        await pool.execute('UPDATE portfolios SET isActive = ? WHERE id = ?', [next, id]);
        const [updatedRows] = await pool.execute('SELECT * FROM portfolios WHERE id = ? LIMIT 1', [id]);
        return res.json({
            success: true,
            message: `Portfolio ${next ? 'activated' : 'deactivated'} successfully`,
            data: mapPortfolioRow(updatedRows[0])
        });
    } catch (error) {
        console.error('Error toggling portfolio status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle portfolio status',
            error: error.message
        });
    }
};

// Toggle featured status
exports.toggleFeaturedStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT featured FROM portfolios WHERE id = ? LIMIT 1', [id]);
        const row = rows?.[0];
        if (!row) return res.status(404).json({ success: false, message: 'Portfolio not found' });

        const next = !Boolean(row.featured);
        await pool.execute('UPDATE portfolios SET featured = ? WHERE id = ?', [next, id]);
        const [updatedRows] = await pool.execute('SELECT * FROM portfolios WHERE id = ? LIMIT 1', [id]);
        return res.json({
            success: true,
            message: `Portfolio ${next ? 'featured' : 'unfeatured'} successfully`,
            data: mapPortfolioRow(updatedRows[0])
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

// Get portfolio statistics
exports.getPortfolioStats = async (req, res) => {
    try {
        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM portfolios');
        const [[{ active }]] = await pool.execute('SELECT COUNT(*) as active FROM portfolios WHERE isActive = TRUE');
        const [[{ featured }]] = await pool.execute('SELECT COUNT(*) as featured FROM portfolios WHERE featured = TRUE');
        const [[{ totalViews }]] = await pool.execute('SELECT COALESCE(SUM(views), 0) as totalViews FROM portfolios');

        const [categoryStats] = await pool.execute(
            'SELECT category as _id, COUNT(*) as count FROM portfolios WHERE isActive = TRUE GROUP BY category ORDER BY count DESC'
        );

        return res.json({
            success: true,
            data: {
                total,
                active,
                featured,
                inactive: total - active,
                totalViews,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error getting portfolio stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolio statistics',
            error: error.message
        });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = ['website', 'mobile', 'design', 'marketing', 'content', 'other'];
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get categories',
            error: error.message
        });
    }
};
