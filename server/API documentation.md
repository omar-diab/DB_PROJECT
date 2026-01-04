# API Documentation

## Base URL

All endpoints are prefixed with `/api/v1/` unless otherwise noted.

---

## Auth Endpoints

### POST `/api/v1/auth/register`
- Register a new user
- Body: `{ name, email, password }`
- Response: 201 Created

### POST `/api/v1/auth/login`
- Authenticate user and return token
- Body: `{ email, password }`
- Response: 200 OK

---

## User Endpoints

### GET `/api/v1/user`
- Retrieve all users
- Response: 200 OK

### POST `/api/v1/user`
- Create a new user
- Body: `{ name, email, password }`
- Response: 201 Created

### GET `/api/v1/user/{user_id}`
- Get a user by id
- Response: 200 OK

### PATCH `/api/v1/user/{user_id}`
- Update a user
- Body: Partial user object
- Response: 200 OK

### DELETE `/api/v1/user/{user_id}`
- Delete a user
- Response: 204 No Content

---

## Book Endpoints

### GET `/api/v1/books`
- Retrieve a list of books
- Response: 200 OK

### POST `/api/v1/books`
- Create a new book
- Body: Multipart form data (title, author, isbn, description, price, stock, type_id, seller_id, image)
- Response: 201 Created

### GET `/api/v1/books/{id}`
- Get a single book by id
- Response: 200 OK

### PATCH `/api/v1/books/{id}`
- Update a book (partial)
- Body: Partial book object
- Response: 200 OK

### DELETE `/api/v1/books/{id}`
- Delete a book by id
- Response: 204 No Content

---

## Order Endpoints

### GET `/api/v1/orders`
- Get current user's orders (requires authentication)
- Response: 200 OK

### POST `/api/v1/orders`
- Place a new order (requires authentication)
- Body: Order object
- Response: 201 Created

### GET `/api/v1/orders/{order_id}`
- Get order details (requires authentication)
- Response: 200 OK

---

## Root Endpoint

### GET `/`
- Serves the main HTML page

---

## Static Files

- `/uploads` serves static files from the uploads directory.
