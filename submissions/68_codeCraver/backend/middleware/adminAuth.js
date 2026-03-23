import User from '../models/User.js';

export const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Authorization check failed.' });
    }
};

export default requireAdmin;
