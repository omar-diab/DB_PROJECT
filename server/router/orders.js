import express from 'express';
const router = express.Router();
import { placeOrder , getMyOrders, getOrderDetails} from '../controllers/order.js';
import authMiddleware from '../middlewares/auth.js';
import asyncWrapper from '../middlewares/async_wrapper.js';

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get current user's orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Place a new order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order placed
 */
// All order routes should be protected
router.get('/', authMiddleware, asyncWrapper(getMyOrders))
router.post('/', authMiddleware, asyncWrapper(placeOrder));

/**
 * @openapi
 * /orders/{order_id}:
 *   parameters:
 *     - in: path
 *       name: order_id
 *       required: true
 *       schema:
 *         type: integer
 *   get:
 *     summary: Get order details
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:order_id', authMiddleware, asyncWrapper(getOrderDetails));

export default router;