import db from '../DB/dbcon.js';

/**
 * @openapi
 * /books:
 *   get:
 *     description: Retrieve a list of books
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookList'
 *   post:
 *     description: Create a new book
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *
 * /books/{id}:
 *   get:
 *     description: Retrieve a single book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function getAllBooks(req, res) {
    const [books] = await db.query('SELECT * FROM books;');
    res.json(books);
}

async function getBook(req, res) {
    const { id } = req.params;
    const [books] = await db.query('SELECT * FROM books WHERE book_id = ?;', [id]);
    if (books.length === 0) {
        return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(books[0]);
}

async function createBook(req, res) {
    const { title, author, isbn, description, price, stock, type_id, seller_id } = req.body;

    // Coerce and validate inputs - handle form-data which sends strings
    const typeIdRaw = String(type_id || '').trim();
    const typeId = typeIdRaw && typeIdRaw !== '' && typeIdRaw !== 'null' ? Number(typeIdRaw) : null;
    
    const priceRaw = String(price || '').trim();
    const priceNum = priceRaw && priceRaw !== '' && priceRaw !== 'null' ? Number(priceRaw) : 0;
    
    const stockRaw = String(stock || '').trim();
    const stockNum = stockRaw && stockRaw !== '' && stockRaw !== 'null' ? Number(stockRaw) : 0;

    // Use authenticated user as seller if not provided
    const sellerIdRaw = String(seller_id || '').trim();
    const sellerId = sellerIdRaw && sellerIdRaw !== '' && sellerIdRaw !== 'null' ? Number(sellerIdRaw) : (req.user && req.user.userId) ?? null;

    // Validate required fields
    if (!typeId || isNaN(typeId)) {
        return res.status(400).json({ msg: 'type_id is required and must be a valid number' });
    }

    if (!sellerId || isNaN(sellerId)) {
        return res.status(400).json({ msg: 'seller_id is required and must be a valid number' });
    }

    if (!title || !title.trim()) {
        return res.status(400).json({ msg: 'title is required' });
    }

    const result = await db.query(
        'INSERT INTO .books (title, author , isbn , description , price, stock, type_id, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [title, author, isbn, description, priceNum, stockNum, typeId, sellerId]
    );

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg';

    res.status(201).json({
        id: result[0].insertId,
        title,
        isbn,
        imageUrl
    });
}

async function updateBook(req, res) {
    const { id } = req.params;
    const updates = req.body; // This will contain only the fields to update

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ msg: 'No fields provided for update' });
    }

    // Dynamically build the SET clause for the SQL query
    const fields = [];
    const values = [];

    // Add each field to update if it exists in the request body
    if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
    }
    if (updates.author !== undefined) {
        fields.push('author = ?');
        values.push(updates.author);
    }
    if (updates.isbn !== undefined) {
        fields.push('isbn = ?');
        values.push(updates.isbn);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.price !== undefined) {
        fields.push('price = ?');
        values.push(updates.price);
    }
    if (updates.stock !== undefined) {
        fields.push('stock = ?');
        values.push(updates.stock);
    }
    if (updates.type_id !== undefined) {
        fields.push('type_id = ?');
        values.push(updates.type_id);
    }
    if (updates.seller_id !== undefined) {
        fields.push('seller_id = ?');
        values.push(updates.seller_id);
    }
    if (updates.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updates.is_active);
    }

    // If no valid fields are provided, return an error
    if (fields.length === 0) {
        return res.status(400).json({ msg: 'No valid fields provided for update' });
    }

    // Add the book ID to the values array for the WHERE clause
    values.push(id);

    // Build the SQL query
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE book_id = ?;`;

    // Execute the query
    const result = await db.query(sql, values);

    // Check if the book was found and updated
    if (result[0].affectedRows === 0) {
        return res.status(404).json({ msg: 'Book not found' });
    }

    // Fetch the updated book to return in the response
    const updatedBook = await db.query('SELECT * FROM books WHERE book_id = ?;', [id]);

    // Return the updated book
    res.json(updatedBook[0][0]);
}

async function deleteBook(req, res) {
    const { id } = req.params;
    const result = await db.query('DELETE FROM books WHERE book_id = ?;', [id]);
    if (result[0].affectedRows === 0) {
        return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(204).send();
}

export { getAllBooks, getBook, createBook, updateBook, deleteBook };