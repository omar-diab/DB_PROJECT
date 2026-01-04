const root = document.getElementById('bookList');
const reloadBtn = document.getElementById('reloadBtn');
const form = document.getElementById('addForm');
const formMsg = document.getElementById('formMsg');
const loginForm = document.getElementById('loginForm');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userInitials = document.getElementById('userInitials');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let allBooks = [];
let currentPage = 1;
const pageSize = 8;
let searchQuery = '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(t) {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function updateAuthUI() {
  const token = getToken();
  if (token) {
    const name = localStorage.getItem('userName') || 'User';
    loginForm.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = name;
    userInitials.textContent = getInitials(name);
  } else {
    loginForm.style.display = 'flex';
    userInfo.style.display = 'none';
  }
}

async function fetchBooks() {
  root.innerHTML = '<div class="book-grid-loading">Loading your collection...</div>';
  try {
    const res = await fetch('/api/v1/books');
    if (!res.ok) throw new Error('Failed to load');
    allBooks = await res.json();
    currentPage = 1;
    renderPage();
  } catch (err) {
    root.innerHTML = `<div class="book-grid-loading muted">Could not fetch books: ${err.message}</div>`;
  }
}

function imageFor(book) {
  if (book.imageUrl) return book.imageUrl;
  if (book.image) return `/uploads/${book.image}`;
  if (book.image_url) return book.image_url;
  return '/uploads/placeholder.png';
}

function renderPage() {
  const filtered = allBooks.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (b.title || '').toLowerCase().includes(q) || 
           (b.author || '').toLowerCase().includes(q);
  });
  
  const total = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (currentPage > total) currentPage = total;
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  pageInfo.textContent = `Page ${currentPage} of ${total}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= total;

  if (pageItems.length === 0) {
    root.innerHTML = '<div class="book-grid-loading muted">No books found. Try a different search or add some books!</div>';
    return;
  }
  
  root.innerHTML = '';
  root.className = 'book-grid';
  
  pageItems.forEach((b, index) => {
    const el = document.createElement('div');
    el.className = 'book-card';
    el.style.animationDelay = `${index * 0.05}s`;
    
    const price = b.price ? `<div class="book-price">$${parseFloat(b.price).toFixed(2)}</div>` : '';
    
    el.innerHTML = `
      <div class="book-image-wrapper">
        <img src="${imageFor(b)}" alt="${escapeHtml(b.title || 'Book cover')}" loading="lazy">
      </div>
      <div class="book-info">
        <div class="book-title">${escapeHtml(b.title || 'Untitled')}</div>
        <div class="book-author">${escapeHtml(b.author || 'Unknown Author')}</div>
        ${price}
      </div>
    `;
    
    root.appendChild(el);
  });
  
  // Smooth scroll to top of books section
  if (window.scrollY > 300) {
    document.querySelector('.books-section').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&"'<>]/g, c => ({
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '<': '&lt;',
    '>': '&gt;'
  })[c]);
}

// Reload button with loading animation
reloadBtn.addEventListener('click', () => {
  reloadBtn.disabled = true;
  reloadBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
    Loading...
  `;
  
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
  
  fetchBooks().finally(() => {
    reloadBtn.disabled = false;
    reloadBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
      </svg>
      Refresh
    `;
    document.head.removeChild(style);
  });
});

// Pagination handlers
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  renderPage();
});

// Search with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    renderPage();
  }, 300);
});

// Form submission with enhanced feedback
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
    Adding...
  `;
  
  const data = new FormData(form);
  
  try {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const res = await fetch('/api/v1/books', {
      method: 'POST',
      body: data,
      headers
    });
    
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    
    formMsg.textContent = '✓ Book added successfully!';
    formMsg.style.background = '#d4edda';
    formMsg.style.color = '#155724';
    formMsg.style.borderColor = '#c3e6cb';
    
    form.reset();
    
    // Update file label text
    const fileLabel = form.querySelector('.file-label-text');
    if (fileLabel) fileLabel.textContent = 'Upload Book Cover';
    
    await fetchBooks();
    
    // Scroll to top to see the new book
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      formMsg.textContent = '';
      formMsg.style.background = '';
      formMsg.style.color = '';
      formMsg.style.borderColor = '';
    }, 3000);
    
  } catch (err) {
    formMsg.textContent = '✗ Error: ' + err.message;
    formMsg.style.background = '#f8d7da';
    formMsg.style.color = '#721c24';
    formMsg.style.borderColor = '#f5c6cb';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  }
});

// File input label update
const fileInput = document.getElementById('bookImage');
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const fileLabel = document.querySelector('.file-label-text');
    if (e.target.files.length > 0) {
      fileLabel.textContent = e.target.files[0].name;
    } else {
      fileLabel.textContent = 'Upload Book Cover';
    }
  });
}

// Login handling with enhanced feedback
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';
  
  const data = Object.fromEntries(new FormData(loginForm).entries());
  
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Invalid credentials');
    
    const body = await res.json();
    setToken(body.token);
    localStorage.setItem('userName', (body.user && body.user.name) || 'User');
    updateAuthUI();
    loginForm.reset();
    
  } catch (err) {
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.style.borderColor = '#e94560';
    });
    
    setTimeout(() => {
      inputs.forEach(input => {
        input.style.borderColor = '';
      });
    }, 2000);
    
    alert('Login failed: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

logoutBtn.addEventListener('click', () => {
  setToken(null);
  localStorage.removeItem('userName');
  updateAuthUI();
});

// Initialize
updateAuthUI();
fetchBooks();

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
