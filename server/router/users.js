import express from "express"
import asyncWrapper from "../middlewares/async_wrapper.js"
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from "../controllers/user.js"

const router = express.Router()

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Retrieve all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.route('/')
.get(asyncWrapper(getAllUsers))
.post(asyncWrapper(createUser))

/**
 * @openapi
 * /user/{user_id}:
 *   parameters:
 *     - in: path
 *       name: user_id
 *       required: true
 *       schema:
 *         type: integer
 *   get:
 *     summary: Get a user by id
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User object
 *   patch:
 *     summary: Update a user
 *     tags:
 *       - Users
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated user
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Users
 *     responses:
 *       204:
 *         description: No content
 */
router.route('/:user_id')
.get(asyncWrapper(getUser))
.patch(asyncWrapper(updateUser))
.delete(asyncWrapper(deleteUser))
export default router