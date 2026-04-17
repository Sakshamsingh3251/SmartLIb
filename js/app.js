
const API_URL = (() => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const pathname = window.location.pathname;
  
  // If running on port 8000 (PHP server), use dynamic path
  if (host.includes(':8000')) {
    return `${protocol}//${host}/api`;
  }
  // If running on XAMPP (localhost without port), use xampp path
  return `${protocol}//${host}/smartlib/api`;
})();

console.log('API URL:', API_URL);

function saveSession(role, data) { 
  sessionStorage.setItem('role', role); 
  sessionStorage.setItem('user', JSON.stringify(data)); 
}

function getSession() { 
  return { 
    role: sessionStorage.getItem('role'), 
    user: JSON.parse(sessionStorage.getItem('user') || 'null') 
  }; 
}

function logout() { 
  fetch(`${API_URL}/auth.php?action=logout`, { method: 'POST' }).catch(e => console.log(e));
  sessionStorage.clear(); 
  window.location.href = '../index.html'; 
}

function requireAuth(role) {
  const s = getSession();
  if (!s.role || s.role !== role) { 
    window.location.href = '../index.html'; 
    return null; 
  }
  return s.user;
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) options.body = JSON.stringify(data);
  
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
}

/* Toast */
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  const colors = { success:'#10b981', error:'#ef4444', info:'var(--blue-300)', warning:'#f59e0b' };
  t.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]}"></i> ${msg}`;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 3200);
}

/* Format MM:SS */
function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

/* Generate QR visual */
function makeQR(gridId, label) {
  const g = document.getElementById(gridId);
  if (!g) return;
  g.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i/10), c = i%10;
    const isCorner = (r<3&&c<3)||(r<3&&c>6)||(r>6&&c<3);
    const d = document.createElement('div');
    d.className = 'qr-cell';
    const fill = isCorner ? '#1e4db7' : (((i*37 + (label.charCodeAt(i%label.length)||0)) % 100) > 45 ? '#1e4db7' : '#fff');
    d.style.background = fill;
    g.appendChild(d);
  }
  const l = document.getElementById(gridId.replace('Grid','Lbl'));
  if (l) l.textContent = `QR: ${label}`;
}

/* Close modal */
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* Section nav */
function showSection(id, el) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  const t = document.getElementById('section-'+id);
  if (t) t.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  if (window.innerWidth <= 768) closeSidebar();
}



/* Scroll reveal */
function initReveal() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
