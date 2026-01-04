import React, { useState, useEffect } from 'react';
import { AlertCircle, BookOpen, ShoppingCart, User, LogIn, LogOut, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://mns4dh07-3000.euw.devtunnels.ms/api/v1';

// Main App Component
export default function BookstoreApp() {
  const [currentView, setCurrentView] = useState('books');
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authToken) {
      fetchBooks();
    }
  }, [authToken]);

  // API Helper Function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Auth Functions
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      // Auto-login after registration
      await handleLogin(email, password);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    setCurrentView('books');
  };

  // Book Functions
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/books');
      setBooks(data.books || data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        formData.append(key, bookData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create book');
      
      await fetchBooks();
    } catch (err) {
      console.error('Failed to create book:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    setLoading(true);
    try {
      await apiCall(`/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(bookData),
      });
      await fetchBooks();
    } catch (err) {
      console.error('Failed to update book:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    setLoading(true);
    try {
      await apiCall(`/books/${id}`, { method: 'DELETE' });
      await fetchBooks();
    } catch (err) {
      console.error('Failed to delete book:', err);
    } finally {
      setLoading(false);
    }
  };

  // Order Functions
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/orders');
      setOrders(data.orders || data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      await fetchOrders();
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #FFF9F0;
          color: #2C1810;
        }

        .app {
          min-height: 100vh;
        }

        .header {
          background: linear-gradient(135deg, #2C1810 0%, #8B4513 100%);
          color: #FFF9F0;
          padding: 2rem 0;
          box-shadow: 0 4px 20px rgba(44, 24, 16, 0.15);
          position: sticky;
          top: 0;
          z-index: 100;
          animation: slideDown 0.6s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        h1 {
          font-family: 'Crimson Pro', serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }

        .auth-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 249, 240, 0.1);
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #D4A373;
          color: #2C1810;
        }

        .btn-primary:hover:not(:disabled) {
          background: #C59363;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 163, 115, 0.3);
        }

        .btn-secondary {
          background: rgba(255, 249, 240, 0.2);
          color: #FFF9F0;
          border: 1px solid rgba(255, 249, 240, 0.3);
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 249, 240, 0.3);
          transform: translateY(-2px);
        }

        .btn-danger {
          background: #B73E3E;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #A32E2E;
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: #8B4513;
          border: 1px solid #E8DCC8;
        }

        .btn-ghost:hover:not(:disabled) {
          background: #FFF9F0;
          border-color: #D4A373;
        }

        .nav {
          background: white;
          border-bottom: 2px solid #E8DCC8;
          padding: 0;
        }

        .nav-content {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .nav-item {
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 500;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-item:hover {
          background: #FFF9F0;
        }

        .nav-item.active {
          border-bottom-color: #8B4513;
          color: #8B4513;
        }

        .main {
          padding: 2rem 0;
          animation: fadeIn 0.6s ease-out;
        }

        .auth-container {
          max-width: 450px;
          margin: 4rem auto;
          animation: scaleIn 0.5s ease-out;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(44, 24, 16, 0.08);
        }

        .card-title {
          font-family: 'Crimson Pro', serif;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #2C1810;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #6B5B4F;
          font-size: 0.9rem;
        }

        input, textarea, select {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #E8DCC8;
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #D4A373;
          box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.1);
        }

        .form-footer {
          margin-top: 1.5rem;
          text-align: center;
          color: #6B5B4F;
          font-size: 0.9rem;
        }

        .form-footer button {
          background: none;
          border: none;
          color: #8B4513;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .book-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(44, 24, 16, 0.08);
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out backwards;
        }

        .book-card:nth-child(1) { animation-delay: 0.1s; }
        .book-card:nth-child(2) { animation-delay: 0.2s; }
        .book-card:nth-child(3) { animation-delay: 0.3s; }
        .book-card:nth-child(4) { animation-delay: 0.4s; }

        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(44, 24, 16, 0.15);
        }

        .book-image {
          width: 100%;
          height: 240px;
          background: linear-gradient(135deg, #E8DCC8 0%, #D4A373 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B4513;
          font-size: 3rem;
        }

        .book-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .book-content {
          padding: 1.5rem;
        }

        .book-title {
          font-family: 'Crimson Pro', serif;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2C1810;
        }

        .book-author {
          color: #6B5B4F;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .book-isbn {
          font-size: 0.85rem;
          color: #8B4513;
          font-family: monospace;
          margin-bottom: 0.75rem;
        }

        .book-description {
          color: #6B5B4F;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #E8DCC8;
        }

        .book-price {
          font-family: 'Crimson Pro', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #8B4513;
        }

        .book-stock {
          font-size: 0.85rem;
          color: #6B5B4F;
        }

        .book-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .icon-btn {
          padding: 0.5rem;
          border: none;
          background: #F5F5F0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: #E8DCC8;
          transform: scale(1.1);
        }

        .icon-btn.danger:hover {
          background: #B73E3E;
          color: white;
        }

        .orders-list {
          margin-top: 2rem;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(44, 24, 16, 0.08);
          animation: fadeIn 0.5s ease-out backwards;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #E8DCC8;
        }

        .order-id {
          font-family: 'Crimson Pro', serif;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .order-status {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #4A7C59;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6B5B4F;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .alert {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: fadeIn 0.4s ease-out;
        }

        .alert-error {
          background: #FEE;
          color: #B73E3E;
          border: 1px solid #FDD;
        }

        .alert-success {
          background: #EFE;
          color: #4A7C59;
          border: 1px solid #DFD;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(44, 24, 16, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: scaleIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-family: 'Crimson Pro', serif;
          font-size: 1.6rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6B5B4F;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #F5F5F0;
          color: #2C1810;
        }

        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 249, 240, 0.3);
          border-radius: 50%;
          border-top-color: #FFF9F0;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 1.8rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .books-grid {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 0 1rem;
          }
        }
      `}</style>

      <Header 
        authToken={authToken}
        user={user}
        onLogout={handleLogout}
      />

      {authToken && (
        <nav className="nav">
          <div className="container">
            <div className="nav-content">
              <div 
                className={`nav-item ${currentView === 'books' ? 'active' : ''}`}
                onClick={() => setCurrentView('books')}
              >
                <BookOpen size={18} />
                Books
              </div>
              <div 
                className={`nav-item ${currentView === 'orders' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('orders');
                  fetchOrders();
                }}
              >
                <ShoppingCart size={18} />
                My Orders
              </div>
              <div 
                className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                onClick={() => setCurrentView('users')}
              >
                <User size={18} />
                Users
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="main">
        <div className="container">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!authToken ? (
            <AuthView 
              onLogin={handleLogin}
              onRegister={handleRegister}
              loading={loading}
            />
          ) : currentView === 'books' ? (
            <BooksView 
              books={books}
              onCreateBook={createBook}
              onUpdateBook={updateBook}
              onDeleteBook={deleteBook}
              onCreateOrder={createOrder}
              loading={loading}
            />
          ) : currentView === 'orders' ? (
            <OrdersView 
              orders={orders}
              loading={loading}
            />
          ) : (
            <UsersView />
          )}
        </div>
      </main>
    </div>
  );
}

// Header Component
function Header({ authToken, user, onLogout }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <BookOpen size={36} />
            <div>
              <h1>Literary Haven</h1>
              <div className="subtitle">Your Digital Bookstore</div>
            </div>
          </div>
          <div className="auth-section">
            {authToken ? (
              <>
                {user && (
                  <div className="user-info">
                    <User size={18} />
                    <span>{user.name || user.email}</span>
                  </div>
                )}
                <button className="btn btn-secondary" onClick={onLogout}>
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="user-info">
                <LogIn size={18} />
                <span>Please login to continue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Auth View Component
function AuthView({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="card-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="loading"></span> : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="form-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Books View Component
function BooksView({ books, onCreateBook, onUpdateBook, onDeleteBook, onCreateOrder, loading }) {
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingBook(null);
    setShowModal(true);
  };

  return (
    <>
      <div className="search-bar">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      {loading && books.length === 0 ? (
        <div className="empty-state">
          <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          <p>Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No books found</h3>
          <p>Start by adding your first book to the collection</p>
        </div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                {book.image ? (
                  <img src={book.image} alt={book.title} />
                ) : (
                  <BookOpen />
                )}
              </div>
              <div className="book-content">
                <h3 className="book-title">{book.title}</h3>
                <div className="book-author">by {book.author}</div>
                <div className="book-isbn">ISBN: {book.isbn}</div>
                <p className="book-description">{book.description}</p>
                <div className="book-footer">
                  <div>
                    <div className="book-price">${book.price}</div>
                    <div className="book-stock">Stock: {book.stock}</div>
                  </div>
                </div>
                <div className="book-actions">
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onCreateOrder({ book_id: book.id, quantity: 1 })}>
                    <ShoppingCart size={16} />
                    Order
                  </button>
                  <button className="icon-btn" onClick={() => handleEdit(book)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDeleteBook(book.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BookModal
          book={editingBook}
          onClose={() => setShowModal(false)}
          onSave={(bookData) => {
            if (editingBook) {
              onUpdateBook(editingBook.id, bookData);
            } else {
              onCreateBook(bookData);
            }
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

// Book Modal Component
function BookModal({ book, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    description: book?.description || '',
    price: book?.price || '',
    stock: book?.stock || '',
    type_id: book?.type_id || '',
    seller_id: book?.seller_id || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>ISBN</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {book ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Orders View Component
function OrdersView({ orders, loading }) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>No orders yet</h3>
        <p>Your orders will appear here once you make a purchase</p>
      </div>
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order, index) => (
        <div key={order.id || index} className="order-card">
          <div className="order-header">
            <div className="order-id">Order #{order.id}</div>
            <div className="order-status">{order.status || 'Completed'}</div>
          </div>
          <div>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${order.total || '0.00'}</p>
            {order.items && (
              <p><strong>Items:</strong> {order.items.length}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Users View Component
function UsersView() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">👥</div>
      <h3>User Management</h3>
      <p>User management features coming soon</p>
    </div>
  );
}
