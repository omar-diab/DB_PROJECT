# React Frontend for Book Store

A modern React-based frontend for the Literary Haven bookstore application.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

- **Authentication**: User login and registration with JWT tokens
- **Book Management**: Browse, create, update, and delete books
- **Search & Filter**: Search books by title, author, or ISBN
- **Order Management**: Place and view orders
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with React and Lucide icons

## API Configuration

The app connects to the backend at:
```
https://mns4dh07-3000.euw.devtunnels.ms/api/v1
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icon library

## Authentication

Auth tokens are stored in localStorage. Authenticated requests include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Project Structure

```
src/
  App.jsx       - Main app component with routing and state management
  main.jsx      - React entry point
index.html      - HTML template
```

## Development

The frontend includes development proxy configuration to easily test against local backend APIs.
