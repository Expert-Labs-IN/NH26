import User from '../models/User.js';
import Product from '../models/Product.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProducts, categoryAgg, tagAgg] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Product.distinct('specs.category'),
            Product.aggregate([
                { $unwind: '$tags' },
                { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
            ]),
        ]);

        const totalCategories = categoryAgg.filter(Boolean).length;
        const totalTags = tagAgg[0]?.uniqueTags?.length || 0;

        // Growth: compare last 7 days vs previous 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

        const [usersThisWeek, usersLastWeek, productsThisWeek, productsLastWeek] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            User.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
            Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Product.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
        ]);

        const userGrowth = usersLastWeek ? Math.round(((usersThisWeek - usersLastWeek) / usersLastWeek) * 100) : usersThisWeek > 0 ? 100 : 0;
        const productGrowth = productsLastWeek ? Math.round(((productsThisWeek - productsLastWeek) / productsLastWeek) * 100) : productsThisWeek > 0 ? 100 : 0;

        res.json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalTags,
            userGrowth,
            productGrowth,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
};

export const getUserGrowth = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user growth' });
    }
};

export const getProductTrends = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const data = await Product.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product trends' });
    }
};

export const getCategoryDistribution = async (req, res) => {
    try {
        const data = await Product.aggregate([
            { $match: { 'specs.category': { $exists: true, $ne: '' } } },
            { $group: { _id: '$specs.category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', value: '$count', _id: 0 } },
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const getTopTags = async (req, res) => {
    try {
        const data = await Product.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 },
            { $project: { tag: '$_id', count: 1, _id: 0 } },
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

export const getRecentProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name specs.category tags createdAt');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recent products' });
    }
};

export const getRecentUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recent users' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 })
            .select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin users' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
