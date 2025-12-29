import express from 'express';
import books from './router/books.js';
import user from './router/users.js';
import authRouter from './router/auth.js'; 
import orders from './router/orders.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandlerMiddleware from './middlewares/error-handler.js';


const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use('/api/v1/auth', authRouter); 

// Serve frontend static files from the `public` folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/api/v1/user', user);
app.use('/api/v1/books', books);
app.use('/api/v1/orders', orders);

// Global error handler (must be after routes)
app.use(errorHandlerMiddleware);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book API',
      version: '1.0.0',
      description: 'API documentation for the Book server'
    },
    // use a relative server path so Swagger Try-it-out calls the same host
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            book_id: { type: 'integer' },
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            type_id: { type: 'integer' },
            seller_id: { type: 'integer' },
            imageUrl: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },
        BookList: {
          type: 'array',
          items: { $ref: '#/components/schemas/Book' }
        },
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { type: 'object', properties: { name: { type: 'string' } } },
            token: { type: 'string' }
          }
        },
        OrderSummary: {
          type: 'object',
          properties: {
            order_id: { type: 'integer' },
            total_amount: { type: 'number' },
            status: { type: 'string' },
            order_date: { type: 'string', format: 'date-time' }
          }
        },
        OrderDetails: {
          type: 'object',
          properties: {
            order: { type: 'object' },
            items: { type: 'array', items: { type: 'object' } }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: { msg: { type: 'string' } }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./router/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Allow Swagger UI static assets and inline scripts/styles to load
app.use('/api-docs', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  );
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec));


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;