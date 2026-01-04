import db from '../DB/dbcon.js';
import bcrypt from 'bcryptjs';

/**
 * @openapi
 * /user:
 *   get:
 *     description: Retrieve all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 * /user/{user_id}:
 *   get:
 *     description: Get a user by id
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Not found
 */

async function getAllUsers(req, res) {
    const [users] = await db.query('SELECT * FROM users;');
    res.json(users);
}

// Example using MySQL2/promise
async function createUser(req, res) {
    const { name, email, password, role = 'CUSTOMER', status = 'ACTIVE' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }
    try {
        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW());',
            [name, email, password_hash, role, status]
        );

        // Return the created user (excluding the password hash)
        const newUser = {
            user_id: result.insertId,
            name,
            email,
            role,
            status,
            created_at: new Date().toISOString()
        };

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


async function getUser(req, res) {
    const { user_id } = req.params;
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?;', [user_id]);
    if (users.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.json(users[0]);

}


async function updateUser(req, res) {
    const { user_id } = req.params;
    const { name, email, password, role, status } = req.body;

    // Validate user_id parameter
    if (!user_id || isNaN(parseInt(user_id))) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate that at least one field is provided for update
    if (!name && !email && !password && !role && !status) {
        return res.status(400).json({ error: "No fields provided for update" });
    }

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE user_id = ?;', [user_id]);
        if (user.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== user[0].email) {
            const [existingUser] = await db.query(
                'SELECT user_id FROM users WHERE email = ? AND user_id != ?;',
                [email, user_id]
            );
            if (existingUser.length > 0) {
                return res.status(409).json({ error: "Email already in use by another user" });
            }
        }

        // Prepare data for update
        const updateFields = [];
        const values = [];

        // Dynamically build the query and values array
        if (name) {
            updateFields.push('name = ?');
            values.push(name);
        }
        if (email) {
            updateFields.push('email = ?');
            values.push(email);
        }
        if (role) {
            // Validate role if provided
            const validRoles = ['ADMIN', 'SELLER', 'CUSTOMER'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: "Invalid role value" });
            }
            updateFields.push('role = ?');
            values.push(role);
        }
        if (status) {
            // Validate status if provided
            const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status value" });
            }
            updateFields.push('status = ?');
            values.push(status);
        }
        if (password) {
            // Validate password strength if provided
            if (password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters long" });
            }
            const password_hash = await bcrypt.hash(password, 10);
            updateFields.push('password_hash = ?');
            values.push(password_hash);
        }

        // If no fields to update (edge case after validation)
        if (updateFields.length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        // Build query
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?;`;
        values.push(user_id);

        // Execute the update within a transaction (if your DB supports it)
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'User not found or no changes made' });
        }

        // Fetch the updated user (excluding password_hash)
        const [updatedUser] = await db.query(
            'SELECT user_id, name, email, role, status, created_at FROM users WHERE user_id = ?;',
            [user_id]
        );

        // Add audit logging for security
        console.log(`User ${user_id} updated by ${req.user?.userId || 'unknown'}`);

        res.json({
            message: "User updated successfully",
            user: updatedUser[0]
        });
    } catch (error) {
        console.error("Error updating user:", error);
        
        // Handle specific MySQL errors
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email already exists" });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ error: "Invalid reference" });
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
}


async function deleteUser(req, res) {
    const { user_id } = req.params;
    const result = await db.query('DELETE FROM users WHERE user_id = ?;', [user_id]);
    if (result[0].affectedRows === 0) {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.status(204).send();

}
export { getAllUsers, createUser, getUser, updateUser, deleteUser };