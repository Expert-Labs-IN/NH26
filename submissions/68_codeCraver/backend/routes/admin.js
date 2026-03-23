import express from 'express';
import {
    getDashboardStats,
    getUserGrowth,
    getProductTrends,
    getCategoryDistribution,
    getTopTags,
    getRecentProducts,
    getRecentUsers,
    getAllUsers,
    deleteUser,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/users/growth', getUserGrowth);
router.get('/products/trends', getProductTrends);
router.get('/categories', getCategoryDistribution);
router.get('/tags', getTopTags);
router.get('/products/recent', getRecentProducts);
router.get('/users/recent', getRecentUsers);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
