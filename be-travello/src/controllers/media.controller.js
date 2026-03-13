const MediaMySQL = require('../models/MediaMySQL');

const parseDataUrl = (dataUrl) => {
    if (typeof dataUrl !== 'string') return null;
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;

    const mimeType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    return { mimeType, buffer };
};

const upload = async (req, res) => {
    try {
        const { dataUrl, mimeType, base64, fileName } = req.body || {};

        // Support two client formats:
        // 1) dataUrl: "data:image/png;base64,..."
        // 2) { mimeType, base64 }
        let payload = null;

        if (dataUrl) {
            payload = parseDataUrl(dataUrl);
        } else if (mimeType && base64) {
            payload = { mimeType, buffer: Buffer.from(base64, 'base64') };
        }

        if (!payload || !payload.mimeType || !payload.buffer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payload. Provide dataUrl or { mimeType, base64 }'
            });
        }

        const created = await MediaMySQL.create({
            fileName: fileName || null,
            mimeType: payload.mimeType,
            buffer: payload.buffer
        });

        return res.status(201).json({
            success: true,
            data: {
                media: created,
                url: `/api/media/${created.id}`
            }
        });
    } catch (error) {
        console.error('❌ Media upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload media'
        });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const row = await MediaMySQL.getDataById(id);

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }

        res.setHeader('Content-Type', row.mimeType);
        res.setHeader('Content-Length', row.sizeBytes);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(row.data);
    } catch (error) {
        console.error('❌ Media getById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve media'
        });
    }
};

module.exports = {
    upload,
    getById,
    parseDataUrl
};
