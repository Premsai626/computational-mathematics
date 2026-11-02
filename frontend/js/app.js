/**
 * ChemicalMix — Shared Application JavaScript (SaaS Architecture)
 * ===============================================================
 * Handles sidebar navigation, mobile drawer toggle, real-time toasts,
 * formatters, calculation history storage, and Flask REST API client.
 */

// Base URL for backend API:
// When deployed on a unified Render Web Service or locally, defaults to '' (same origin).
// When deployed as a separate Render Static Site, uses window.CHEMICALMIX_CONFIG.API_BASE_URL.
const API_BASE = (window.CHEMICALMIX_CONFIG && window.CHEMICALMIX_CONFIG.API_BASE_URL)
    ? window.CHEMICALMIX_CONFIG.API_BASE_URL.replace(/\/+$/, '')
    : '';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initGlobalStatus();
});

// ─── Sidebar Navigation & Mobile Drawer ─────────────────────────────────────

function initSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Set active link in sidebar based on current pathname
    const currentPath = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const href = (item.getAttribute('href') || '').toLowerCase();
        if (
            (currentPath === '/' && (href === '/' || href.endsWith('index.html'))) ||
            (currentPath.endsWith('calculator.html') && href.includes('calculator.html')) ||
            (currentPath.endsWith('comparison.html') && href.includes('comparison.html')) ||
            (currentPath.endsWith('visualizations.html') && href.includes('visualizations.html')) ||
            (currentPath.endsWith('about.html') && href.includes('about.html'))
        ) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ─── Engine Live Health Status ──────────────────────────────────────────────

async function initGlobalStatus() {
    const statusDots = document.querySelectorAll('.engine-status-dot');
    const statusTexts = document.querySelectorAll('.engine-status-text');

    try {
        const data = await apiRequest('/api/health');
        if (data && data.status === 'healthy') {
            statusDots.forEach(dot => {
                dot.classList.add('online');
                dot.classList.remove('offline');
            });
            statusTexts.forEach(txt => {
                txt.textContent = 'Engine Active';
            });
        } else {
            throw new Error('Status not healthy');
        }
    } catch (e) {
        statusDots.forEach(dot => {
            dot.classList.add('offline');
            dot.classList.remove('online');
        });
        statusTexts.forEach(txt => {
            txt.textContent = 'Engine Offline';
        });
    }
}

// ─── API Client ─────────────────────────────────────────────────────────────

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        return { success: false, error: 'Network error: could not connect to Flask backend engine.' };
    }
}

// ─── UI Utilities ───────────────────────────────────────────────────────────

function showLoading(container) {
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Solving equations...</p>
        </div>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
}

function hideLoading(container) {
    if (!container) return;
    const overlay = container.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
}

function showToast(message, type = 'error') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">×</button>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 250);
    }, 4500);
}

function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return Number(num).toFixed(decimals);
}

function formatScientific(num) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    if (num === 0) return '0';
    if (Math.abs(num) < 1e-4 || Math.abs(num) > 1e4) {
        return Number(num).toExponential(4);
    }
    return Number(num).toFixed(6);
}

function formatTime(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '—';
    if (seconds < 0.001) {
        const ms = (seconds * 1000).toFixed(2);
        return `${ms} ms`;
    }
    return seconds.toFixed(4) + ' s';
}

// ─── Calculation History & Session Storage ───────────────────────────────────

function storeLastCalculation(inputs, results) {
    try {
        sessionStorage.setItem('chemicalmix_last_inputs', JSON.stringify(inputs));
        sessionStorage.setItem('chemicalmix_last_results', JSON.stringify(results));

        // Increment actual calculation counter
        const currentCount = parseInt(localStorage.getItem('chemicalmix_calc_count') || '0', 10);
        localStorage.setItem('chemicalmix_calc_count', (currentCount + 1).toString());

        // Update real calculation history log
        const history = JSON.parse(localStorage.getItem('chemicalmix_calc_history') || '[]');
        history.unshift({
            timestamp: new Date().toISOString(),
            concentrations: inputs.concentrations,
            totalVolume: inputs.total_volume,
            targetConcentration: inputs.target_concentration,
            volumes: results.exact_solution.volumes,
            jacobiIters: results.jacobi ? results.jacobi.iterations : null,
            gsIters: results.gauss_seidel ? results.gauss_seidel.iterations : null,
            converged: results.jacobi && results.gauss_seidel ? (results.jacobi.converged && results.gauss_seidel.converged) : false
        });

        // Store up to 10 actual records
        localStorage.setItem('chemicalmix_calc_history', JSON.stringify(history.slice(0, 10)));
    } catch (e) {
        console.warn('Storage error:', e);
    }
}

function getLastCalculation() {
    try {
        const inputs = JSON.parse(sessionStorage.getItem('chemicalmix_last_inputs'));
        const results = JSON.parse(sessionStorage.getItem('chemicalmix_last_results'));
        return { inputs, results };
    } catch (e) {
        return { inputs: null, results: null };
    }
}

function getCalculationHistory() {
    try {
        return JSON.parse(localStorage.getItem('chemicalmix_calc_history') || '[]');
    } catch (e) {
        return [];
    }
}

function getTotalCalculationCount() {
    try {
        return parseInt(localStorage.getItem('chemicalmix_calc_count') || '0', 10);
    } catch (e) {
        return 0;
    }
}
