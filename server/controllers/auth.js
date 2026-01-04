import db from '../DB/dbcon.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomAPIError from '../errors/custom-api-error.js';

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new CustomAPIError('Please provide name, email, and password', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, password_hash, 'CUSTOMER']
    );

    res.status(201).json({ msg: 'User registered successfully', userId: result.insertId });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomAPIError('Please provide email and password', 400);
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
        throw new CustomAPIError('Invalid Credentials', 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
        throw new CustomAPIError('Invalid Credentials', 401);
    }

    const token = jwt.sign(
        { userId: user.user_id, name: user.name, role: user.role },
        'jwtSecret', // In production, use process.env.JWT_SECRET
        { expiresIn: '30d' }
    );

    res.status(200).json({ user: { name: user.name }, token });
};

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User registered
 *
 * /auth/login:
 *   post:
 *     description: Authenticate user and return token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Auth response with JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */

export { register, login };