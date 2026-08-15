// API & Authentication Utility Layer for CampusHub
const API_BASE_URL = '/api/v1';

// Global state
let currentUser = null;

// Auth token functions
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function removeToken() {
  localStorage.removeItem('token');
  currentUser = null;
}

// Check role
function hasRole(role) {
  return currentUser && currentUser.role === role;
}

// Generic request wrapper
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Status 204 No Content
    if (response.status === 204) {
      return {
        status: 'success',
        data: null
      };
    }

    const result = await response.json();

    if (!response.ok) {
      // If unauthorized, remove token
      if (response.status === 401) {
        removeToken();

        // Redirect to login if protected page
        const protectedPaths = [
          '/bookings.html',
          '/profile.html',
          '/my-events.html',
          '/create-event.html',
          '/edit-event.html',
          '/admin.html'
        ];

        if (
          protectedPaths.some(path =>
            window.location.pathname.includes(path)
          )
        ) {
          window.location.href =
            'login.html?redirect=' +
            encodeURIComponent(
              window.location.pathname +
              window.location.search
            );
        }
      }

      throw new Error(
        result.message || 'Something went wrong'
      );
    }

    return result;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Load user session
async function loadUser() {
  if (!getToken()) return null;

  if (currentUser) return currentUser;

  try {
    const res = await request('/users/me');

    if (res.status === 'success') {
      currentUser = res.data.user;
      return currentUser;
    }
  } catch (error) {
    console.warn(
      'Failed to load user profile, token might be invalid.'
    );

    removeToken();
  }

  return null;
}

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.querySelector(
    '.toast-container'
  );

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  toast.innerHTML = `
    <span class="toast-icon">
      ${
        type === 'success'
          ? '✓'
          : type === 'error'
          ? '✗'
          : '⚠'
      }
    </span>

    <span class="toast-message">
      ${escapeHtml(message)}
    </span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);

  // Remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('active');

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Confirm dialog modal helper
function showConfirm(
  title,
  message,
  onConfirm,
  onCancel = null
) {
  let overlay = document.querySelector(
    '.modal-overlay'
  );

  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">

      <h3 class="modal-title">
        ${escapeHtml(title)}
      </h3>

      <p class="modal-message">
        ${escapeHtml(message)}
      </p>

      <div class="modal-actions">

        <button
          class="btn btn-outline btn-sm btn-cancel"
        >
          Cancel
        </button>

        <button
          class="btn btn-danger btn-sm btn-confirm"
        >
          Confirm
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Event handlers
  const cancelBtn =
    overlay.querySelector('.btn-cancel');

  const confirmBtn =
    overlay.querySelector('.btn-confirm');

  const close = () => {
    overlay.classList.remove('active');

    setTimeout(() => {
      overlay.remove();
    }, 250);
  };

  cancelBtn.onclick = () => {
    close();

    if (onCancel) {
      onCancel();
    }
  };

  confirmBtn.onclick = () => {
    close();
    onConfirm();
  };

  // Show modal
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);
}

// Helper to escape HTML characters for safety
function escapeHtml(str) {
  if (str === null || str === undefined) {
    return '';
  }

  return String(str).replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  );
}

// Helper to format date
function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Setup common UI parts (Navbar, Footer)
async function renderNavigation() {
  await loadUser();

  const navbarElement =
    document.getElementById('navbar-container');

  if (!navbarElement) return;

  let menuHtml = `
    <a href="index.html" class="logo">
      Campus<span>Hub</span>
    </a>

    <button
      class="mobile-nav-toggle"
      aria-label="Toggle menu"
    >
      ☰
    </button>

    <ul class="nav-menu">
  `;

  // Guest
  if (!currentUser) {
    menuHtml += `
      <li>
        <a
          href="index.html"
          class="nav-item home-link"
        >
          Home
        </a>
      </li>

      <li>
        <a
          href="events.html"
          class="nav-item events-link"
        >
          Events
        </a>
      </li>

      <div class="nav-auth">

        <li>
          <a
            href="login.html"
            class="btn btn-outline btn-sm"
          >
            Login
          </a>
        </li>

        <li>
          <a
            href="signup.html"
            class="btn btn-accent btn-sm"
          >
            Sign Up
          </a>
        </li>

      </div>
    `;
  } else {
    // Authenticated user
    menuHtml += `
      <li>
        <a
          href="index.html"
          class="nav-item home-link"
        >
          Home
        </a>
      </li>

      <li>
        <a
          href="events.html"
          class="nav-item events-link"
        >
          Events
        </a>
      </li>
    `;

    // STUDENT
    if (currentUser.role === 'student') {
      menuHtml += `
        <li>
          <a
            href="bookings.html"
            class="nav-item bookings-link"
          >
            My Bookings
          </a>
        </li>
      `;
    }

    // ORGANIZER
    else if (currentUser.role === 'organizer') {
      menuHtml += `
        <li>
          <a
            href="bookings.html"
            class="nav-item bookings-link"
          >
            My Bookings
          </a>
        </li>

        <li>
          <a
            href="my-events.html"
            class="nav-item my-events-link"
          >
            My Events
          </a>
        </li>

        <li>
          <a
            href="create-event.html"
            class="nav-item create-event-link"
          >
            Create Event
          </a>
        </li>
      `;
    }

    // ADMIN
    else if (currentUser.role === 'admin') {
      menuHtml += `
        <li>
          <a
            href="admin.html"
            class="nav-item admin-link"
          >
            Admin Dashboard
          </a>
        </li>
      `;
    }

    menuHtml += `
      <div class="nav-auth">

        <li>
          <a
            href="profile.html"
            class="nav-item profile-link"
          >
            Profile (${escapeHtml(currentUser.name)})
          </a>
        </li>

        <li>
          <button
            id="logout-btn"
            class="btn btn-outline btn-sm"
          >
            Logout
          </button>
        </li>

      </div>
    `;
  }

  menuHtml += '</ul>';

  navbarElement.innerHTML = menuHtml;

  // Hook active menu items based on page filename
  const path = window.location.pathname;

  if (
    path.includes('index.html') ||
    path === '/' ||
    path === ''
  ) {
    navbarElement
      .querySelector('.home-link')
      ?.classList.add('active');
  }

  else if (
    path.includes('events.html') ||
    path.includes('event-details.html')
  ) {
    navbarElement
      .querySelector('.events-link')
      ?.classList.add('active');
  }

  else if (path.includes('bookings.html')) {
    navbarElement
      .querySelector('.bookings-link')
      ?.classList.add('active');
  }

  else if (path.includes('my-events.html')) {
    navbarElement
      .querySelector('.my-events-link')
      ?.classList.add('active');
  }

  else if (
    path.includes('create-event.html') ||
    path.includes('edit-event.html')
  ) {
    navbarElement
      .querySelector('.create-event-link')
      ?.classList.add('active');
  }

  else if (path.includes('admin.html')) {
    navbarElement
      .querySelector('.admin-link')
      ?.classList.add('active');
  }

  else if (path.includes('profile.html')) {
    navbarElement
      .querySelector('.profile-link')
      ?.classList.add('active');
  }

  // Logout
  const logoutBtn =
    document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      removeToken();

      showToast(
        'Logged out successfully',
        'success'
      );

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    };
  }

  // Mobile responsive navigation toggle
  const toggleBtn =
    navbarElement.querySelector(
      '.mobile-nav-toggle'
    );

  const navMenu =
    navbarElement.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.onclick = () => {
      navMenu.classList.toggle('active');
    };
  }
}

// Global initialization
document.addEventListener(
  'DOMContentLoaded',
  () => {
    renderNavigation();

    // Render footer automatically
    const footerElement =
      document.getElementById(
        'footer-container'
      );

    if (footerElement) {
      footerElement.innerHTML = `
        <div class="container">

          <div class="footer-content">

            <div class="footer-brand">

              <h3>
                Campus<span>Hub</span>
              </h3>

              <p>
                Connect with peers, enhance your skills,
                and make the most out of your college life
                by discovering local university events.
              </p>

            </div>

            <div class="footer-links">

              <h4>Quick Links</h4>

              <ul>

                <li>
                  <a href="index.html">
                    Home
                  </a>
                </li>

                <li>
                  <a href="events.html">
                    Browse Events
                  </a>
                </li>

                <li>
                  <a href="profile.html">
                    My Profile
                  </a>
                </li>

              </ul>

            </div>

            <div class="footer-links">

              <h4>Connect</h4>

              <ul>

                <li>
                  <a href="#">
                    University Portal
                  </a>
                </li>

                <li>
                  <a href="#">
                    Support Center
                  </a>
                </li>

                <li>
                  <a href="#">
                    Platform Guidelines
                  </a>
                </li>

              </ul>

            </div>

          </div>

          <div class="footer-bottom">

            <p>
              &copy;
              ${new Date().getFullYear()}
              CampusHub.
              Designed for academic and peer interaction.
            </p>

          </div>

        </div>
      `;
    }
  }
);