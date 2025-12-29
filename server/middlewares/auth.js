import jwt from 'jsonwebtoken';
import CustomAPIError from '../errors/custom-api-error.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomAPIError('Authentication invalid', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, 'jwtSecret');
        // Attach the user to the request object
        req.user = { userId: payload.userId, name: payload.name, role: payload.role };
        next();
    } catch (error) {
        throw new CustomAPIError('Authentication invalid', 401);
    }
};

export default authMiddleware;