import express from "express"
import asyncWrapper from "../middlewares/async_wrapper.js"
import authMiddleware from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { getAllBooks, createBook, getBook, updateBook, deleteBook } from "../controllers/book.js"

const router = express.Router()

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Retrieve a list of books
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *   post:
 *     summary: Create a new book
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               seller_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created
 */
router.route('/')
.get(asyncWrapper(getAllBooks))
.post(upload.single('image'),authMiddleware, asyncWrapper(createBook))

/**
 * @openapi
 * /books/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *   get:
 *     summary: Get a single book by id
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Book object
 *   patch:
 *     summary: Update a book (partial)
 *     tags:
 *       - Books
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated book
 *   delete:
 *     summary: Delete a book by id
 *     tags:
 *       - Books
 *     responses:
 *       204:
 *         description: No content (deleted)
 */
router.route('/:id')
.get(asyncWrapper(getBook))
.patch(asyncWrapper(updateBook))
.delete(asyncWrapper(deleteBook))
export default router