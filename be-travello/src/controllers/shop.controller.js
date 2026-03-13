const mongoose = require('mongoose');
const ShopItem = require('../models/ShopItem');
const ShopItemMySQL = require('../models/ShopItemMySQL');

// Get the appropriate ShopItem model
const getShopItemModel = () => {
    // Try to use MongoDB first, fallback to MySQL
    if (mongoose.connection.readyState === 1) { // 1 = connected
        console.log('Using MongoDB ShopItem model');
        return ShopItem;
    } else {
        console.log('Using MySQL ShopItem model (fallback)');
        return ShopItemMySQL;
    }
};

// Get all shop items with filtering and pagination
const getAllShopItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            status = 'active'
        } = req.query;

        const ShopItemModel = getShopItemModel();
        const query = {};

        // Filter by status (default to active for public view)
        if (status) {
            query.status = status;
        }

        // Filter by category
        if (category) {
            query.serviceCategory = new RegExp(category, 'i');
        }

        // Search by title and serviceCategory
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { serviceCategory: new RegExp(search, 'i') }
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let shopItems;
        let total;

        if (ShopItemModel === ShopItem) {
            // MongoDB operations
            shopItems = await ShopItemModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);

            total = await ShopItemModel.countDocuments(query);
        } else {
            // MySQL operations
            shopItems = await ShopItemModel.find({
                ...query,
                limit: limitNum,
                skip: skip
            });

            total = await ShopItemModel.countDocuments(query);
        }

        res.status(200).json({
            success: true,
            data: shopItems,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching shop items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shop items',
            error: error.message
        });
    }
};

// Get single shop item by ID
const getShopItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop item ID'
            });
        }

        const shopItem = await ShopItem.findById(id);

        if (!shopItem) {
            return res.status(404).json({
                success: false,
                message: 'Shop item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shopItem
        });
    } catch (error) {
        console.error('Error fetching shop item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shop item',
            error: error.message
        });
    }
};

// Create new shop item
const createShopItem = async (req, res) => {
    try {
        const shopItemData = req.body;
        console.log('📝 Received shop item data:', shopItemData);
        console.log('📋 Request headers:', req.headers);
        console.log('🔍 Request method:', req.method);
        console.log('📡 Request URL:', req.url);

        // Validate required fields
        const requiredFields = ['title', 'imageSrc', 'price', 'serviceCategory'];
        const missingFields = requiredFields.filter(field => !shopItemData[field]);
        
        console.log('🔍 Required fields check:', requiredFields);
        console.log('❌ Missing fields:', missingFields);
        
        if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        console.log('🔧 Creating new shop item with data:', shopItemData);
        
        const ShopItemModel = getShopItemModel();
        console.log('📊 ShopItemModel type:', ShopItemModel === ShopItem ? 'MongoDB' : 'MySQL');
        
        let newShopItem;

        if (ShopItemModel === ShopItem) {
            // MongoDB operations
            console.log('🗄️ Using MongoDB for creation');
            newShopItem = new ShopItemModel(shopItemData);
            await newShopItem.save();
            console.log('✅ MongoDB item saved:', newShopItem._id);
        } else {
            // MySQL operations
            console.log('🗄️ Using MySQL for creation');
            newShopItem = await ShopItemModel.create(shopItemData);
            console.log('✅ MySQL item created:', newShopItem);
        }

        console.log('🎉 Shop item created successfully:', newShopItem);
        res.status(201).json({
            success: true,
            data: newShopItem
        });
    } catch (error) {
        console.error('❌ Error creating shop item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create shop item',
            error: error.message
        });
    }
};

// Update shop item
const updateShopItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating shop item:', id);
        console.log('Update data received:', updateData);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid shop item ID:', id);
            return res.status(400).json({
                success: false,
                message: 'Invalid shop item ID'
            });
        }

        console.log('Finding shop item to update...');
        const shopItem = await ShopItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!shopItem) {
            console.log('Shop item not found:', id);
            return res.status(404).json({
                success: false,
                message: 'Shop item not found'
            });
        }

        console.log('Shop item updated successfully:', shopItem);
        res.status(200).json({
            success: true,
            message: 'Shop item updated successfully',
            data: shopItem
        });
    } catch (error) {
        console.error('Error updating shop item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shop item',
            error: error.message
        });
    }
};

// Delete shop item
const deleteShopItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop item ID'
            });
        }

        const shopItem = await ShopItem.findByIdAndDelete(id);

        if (!shopItem) {
            return res.status(404).json({
                success: false,
                message: 'Shop item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop item deleted successfully',
            data: shopItem
        });
    } catch (error) {
        console.error('Error deleting shop item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete shop item',
            error: error.message
        });
    }
};

// Get shop categories
const getShopCategories = async (req, res) => {
    try {
        const categories = await ShopItem.distinct('serviceCategory');
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

module.exports = {
    getAllShopItems,
    getShopItemById,
    createShopItem,
    updateShopItem,
    deleteShopItem,
    getShopCategories
};
