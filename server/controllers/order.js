import db from '../DB/dbcon.js';
import CustomAPIError from '../errors/custom-api-error.js';

/**
 * @openapi
 * /orders:
 *   get:
 *     description: Get current user's orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderSummary'
 *   post:
 *     description: Place a new order
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *
 * /orders/{order_id}:
 *   get:
 *     description: Get order details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetails'
 */

async function getMyOrders(req, res) {
    const customer_id = req.user.userId; // Extracted from JWT token

    // We query the view and filter by the logged-in user
    // Note: Since 'vw_order_summary' joins 'orders' and 'users', 
    // we use a subquery or join to ensure we only get the current user's data.
    const [orders] = await db.query(
        `SELECT * FROM vw_order_summary 
         WHERE order_id IN (SELECT order_id FROM orders WHERE customer_id = ?)
         ORDER BY order_date DESC`, 
        [customer_id]
    );

    if (orders.length === 0) {
        return res.status(200).json({ msg: "You haven't placed any orders yet.", orders: [] });
    }

    res.status(200).json({ count: orders.length, orders });
}


async function placeOrder(req, res) {
    const { items } = req.body; 
    const customer_id = req.user.userId;

    if (!items || items.length === 0) {
        return res.status(400).json({ msg: 'No items in order' });
    }

    // 1. Get a connection from the pool
    const connection = await db.getConnection(); 

    try {
        // 2. Start Transaction
        await connection.beginTransaction();

        let total_amount = 0;

        // 3. Loop through items to validate stock and calculate total
        for (const item of items) {
            const [books] = await connection.query(
                'SELECT stock, price FROM books WHERE book_id = ? FOR UPDATE', 
                [item.book_id]
            );

            if (books.length === 0 || books[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for book ID: ${item.book_id}`);
            }

            total_amount += books[0].price * item.quantity;
        }

        // 4. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)',
            [customer_id, total_amount, 'PENDING']
        );
        const orderId = orderResult.insertId;

        // 5. Insert Items and Update Stock
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES (?, ?, ?, (SELECT price FROM books WHERE book_id = ?))',
                [orderId, item.book_id, item.quantity, item.book_id]
            );

            await connection.query(
                'UPDATE books SET stock = stock - ? WHERE book_id = ?',
                [item.quantity, item.book_id]
            );
        }

        // 6. Commit the changes
        await connection.commit();
        res.status(201).json({ msg: 'Order placed successfully', orderId });

    } catch (error) {
        // 7. If anything goes wrong, undo everything
        await connection.rollback();
        console.error("Order Error:", error.message);
        res.status(400).json({ msg: error.message });
    } finally {
        // 8. IMPORTANT: Always release the connection
        connection.release();
    }
}

async function getOrderDetails(req, res) {
    try {
        const { order_id } = req.params;
        const customer_id = req.user.userId;

        // Log the received order_id for debugging
        console.log("Received order_id:", order_id);

        // Validate order_id
        if (!order_id || isNaN(order_id)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid order ID: order_id must be a number"
            });
        }

        // Check if the order exists and belongs to the customer
        const [orderCheck] = await db.query(
            `SELECT order_id FROM orders WHERE order_id = ? AND customer_id = ?`,
            [parseInt(order_id), customer_id]
        );

        if (orderCheck.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Order not found or access denied"
            });
        }

        // Fetch order summary
        const [orderSummary] = await db.query(
            `SELECT
                o.*,
                p.method as payment_method,
                p.status as payment_status
             FROM orders o
             LEFT JOIN payments p ON o.order_id = p.order_id
             WHERE o.order_id = ?`,
            [order_id]
        );

        // Fetch order items
        const [details] = await db.query(
            `SELECT
                oi.order_item_id,
                oi.quantity,
                oi.unit_price,
                oi.line_total,
                b.title,
                b.author,
                b.book_id,
                b.isbn
             FROM order_items oi
             JOIN books b ON oi.book_id = b.book_id
             WHERE oi.order_id = ?
             ORDER BY oi.order_item_id`,
            [order_id]
        );

        // Send the response
        res.status(200).json({
            success: true,
            order: orderSummary[0],
            items: details
        });

    } catch (error) {
        console.error("Error in getOrderDetails:", error);
        res.status(500).json({
            success: false,
            msg: "Server error retrieving order details"
        });
    }
}




export { placeOrder , getMyOrders , getOrderDetails };