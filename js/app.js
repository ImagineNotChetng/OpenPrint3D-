// OpenPrint3D Profile Manager - Application Logic

// State
const state = {
    profiles: {
        printer: [],
        filament: [],
        process: []
    },
    favorites: JSON.parse(localStorage.getItem('op3d-favorites') || '[]'),
    selectedForExport: [],
    currentTab: 'browse',
    filters: {
        type: 'all',
        material: 'all',
        brand: 'all',
        color: 'all',
        search: ''
    }
};

// DOM Elements
const elements = {
    searchInput: document.getElementById('search-input'),
    clearSearch: document.getElementById('clear-search'),
    filterType: document.getElementById('filter-type'),
    filterMaterial: document.getElementById('filter-material'),
    filterBrand: document.getElementById('filter-brand'),
    filterColor: document.getElementById('filter-color'),
    applyFilters: document.getElementById('apply-filters'),
    resetFilters: document.getElementById('reset-filters'),
    resultsGrid: document.getElementById('results-grid'),
    resultsCount: document.getElementById('results-count'),
    sortBy: document.getElementById('sort-by'),
    exportCount: document.getElementById('export-count'),
    exportList: document.getElementById('export-list'),
    exportFormat: document.getElementById('export-format'),
    exportBtn: document.getElementById('export-btn'),
    favoritesGrid: document.getElementById('favorites-grid'),
    clearFavorites: document.getElementById('clear-favorites'),
    detailModal: document.getElementById('detail-modal'),
    modalBody: document.getElementById('modal-body'),
    toastContainer: document.getElementById('toast-container'),
    refreshBtn: document.getElementById('refresh-btn')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupEventListeners();
    await loadProfiles();
    renderProfiles();
    updateFavorites();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Search
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    elements.clearSearch.addEventListener('click', clearSearch);

    // Filters
    elements.applyFilters.addEventListener('click', applyFilters);
    elements.resetFilters.addEventListener('click', resetFilters);

    // Sort
    elements.sortBy.addEventListener('change', renderProfiles);

    // Export
    elements.exportBtn.addEventListener('click', exportProfiles);

    // Favorites
    elements.clearFavorites.addEventListener('click', clearAllFavorites);

    // Refresh
    elements.refreshBtn.addEventListener('click', async () => {
        await loadProfiles();
        showToast('Data refreshed', 'success');
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) closeModal();
    });
}

// Data Loading
async function loadProfiles() {
    try {
        // Load printers
        await loadProfileType('printer', 'printer');
        // Load filaments
        await loadProfileType('filament', 'filament');
        // Load processes
        await loadProfileType('process', 'process');
        
        updateFilterOptions();
    } catch (error) {
        console.error('Error loading profiles:', error);
        showToast('Error loading profiles', 'error');
    }
}

async function loadProfileType(type, folder) {
    const basePath = '';
    
    // Try to fetch from local files
    try {
        const response = await fetch(`${basePath}${folder}/`, { method: 'GET' });
        if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a[href$=".json"]');
            
            for (const link of links) {
                const filename = link.getAttribute('href').split('/').pop();
                try {
                    const profileRes = await fetch(`${basePath}${folder}/${filename}`);
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        state.profiles[type].push(profile);
                    }
                } catch (e) {
                    console.warn(`Could not load ${filename}`);
                }
            }
        }
    } catch (e) {
        console.warn(`Could not fetch ${folder} directory, using mock data`);
    }

    // If no profiles loaded, use mock data
    if (state.profiles[type].length === 0) {
        state.profiles[type] = getMockData(type);
    }
}

function getMockData(type) {
    if (type === 'printer') {
        return [
            {
                id: 'Elegoo/Centauri-Carbon',
                op3d_schema: 'printer',
                manufacturer: 'Elegoo',
                model: 'Centauri Carbon',
                build_volume: { x: 280, y: 280, z: 270 },
                kinematics: 'corexy',
                firmware: { flavor: 'proprietary' },
                tags: ['enclosed', 'corexy', 'high_speed']
            },
            {
                id: 'Creality/Ender-3-V2',
                op3d_schema: 'printer',
                manufacturer: 'Creality',
                model: 'Ender-3 V2',
                build_volume: { x: 220, y: 220, z: 250 },
                kinematics: 'cartesian',
                firmware: { flavor: 'marlin' },
                tags: ['cartesian', 'budget', 'beginner-friendly']
            }
        ];
    } else if (type === 'filament') {
        return [
            {
                id: 'Generic/PLA',
                op3d_schema: 'filament',
                brand: 'Generic',
                name: 'Generic PLA 1.75mm',
                material: 'PLA',
                color: 'white',
                nozzle: { recommended: 210 },
                bed: { recommended: 50 }
            },
            {
                id: 'Generic/PETG',
                op3d_schema: 'filament',
                brand: 'Generic',
                name: 'Generic PETG 1.75mm',
                material: 'PETG',
                color: 'black',
                nozzle: { recommended: 240 },
                bed: { recommended: 70 }
            },
            {
                id: 'Generic/TPU',
                op3d_schema: 'filament',
                brand: 'Generic',
                name: 'Generic TPU 1.75mm',
                material: 'TPU',
                color: 'black',
                nozzle: { recommended: 220 },
                bed: { recommended: 40 }
            },
            {
                id: 'Generic/ASA',
                op3d_schema: 'filament',
                brand: 'Generic',
                name: 'Generic ASA 1.75mm',
                material: 'ASA',
                color: 'white',
                nozzle: { recommended: 260 },
                bed: { recommended: 95 }
            },
            {
                id: 'Generic/ABS',
                op3d_schema: 'filament',
                brand: 'Generic',
                name: 'Generic ABS 1.75mm',
                material: 'ABS',
                color: 'natural',
                nozzle: { recommended: 250 },
                bed: { recommended: 100 }
            }
        ];
    } else if (type === 'process') {
        return [
            {
                id: 'Standard/0.20mm-quality',
                op3d_schema: 'process',
                name: '0.20mm Quality',
                intent: 'standard',
                layer_height: { default: 0.2 }
            }
        ];
    }
    return [];
}

// Filter Options
function updateFilterOptions() {
    const brands = new Set();
    const colors = new Set();
    
    state.profiles.filament.forEach(f => {
        if (f.brand) brands.add(f.brand);
        if (f.color) colors.add(f.color);
    });
    
    // Update brand dropdown
    const brandSelect = elements.filterBrand;
    brandSelect.innerHTML = '<option value="all">All Brands</option>';
    brands.forEach(brand => {
        brandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
    });
    
    // Update color dropdown
    const colorSelect = elements.filterColor;
    colorSelect.innerHTML = '<option value="all">All Colors</option>';
    colors.forEach(color => {
        colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
    });
}

// Rendering
function renderProfiles() {
    let profiles = [];
    
    // Collect profiles based on filter
    if (state.filters.type === 'all') {
        profiles = [
            ...state.profiles.printer.map(p => ({...p, _type: 'printer'})),
            ...state.profiles.filament.map(p => ({...p, _type: 'filament'})),
            ...state.profiles.process.map(p => ({...p, _type: 'process'}))
        ];
    } else {
        profiles = state.profiles[state.filters.type].map(p => ({...p, _type: state.filters.type}));
    }
    
    // Apply search filter
    if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        profiles = profiles.filter(p => {
            return (p.name || p.model || '').toLowerCase().includes(search) ||
                   (p.brand || p.manufacturer || '').toLowerCase().includes(search) ||
                   (p.material || '').toLowerCase().includes(search);
        });
    }
    
    // Apply material filter
    if (state.filters.material !== 'all') {
        profiles = profiles.filter(p => p.material === state.filters.material);
    }
    
    // Apply brand filter
    if (state.filters.brand !== 'all') {
        profiles = profiles.filter(p => p.brand === state.filters.brand || p.manufacturer === state.filters.brand);
    }
    
    // Apply color filter
    if (state.filters.color !== 'all') {
        profiles = profiles.filter(p => p.color === state.filters.color);
    }
    
    // Sort
    const sortBy = elements.sortBy.value;
    profiles.sort((a, b) => {
        if (sortBy === 'name') {
            return (a.name || a.model || '').localeCompare(b.name || b.model || '');
        } else if (sortBy === 'brand') {
            return (a.brand || a.manufacturer || '').localeCompare(b.brand || b.manufacturer || '');
        } else if (sortBy === 'material') {
            return (a.material || '').localeCompare(b.material || '');
        }
        return 0;
    });
    
    // Update count
    elements.resultsCount.textContent = `${profiles.length} items found`;
    
    // Render cards
    if (profiles.length === 0) {
        elements.resultsGrid.innerHTML = '<div class="empty-state">No profiles found</div>';
        return;
    }
    
    elements.resultsGrid.innerHTML = profiles.map(profile => renderProfileCard(profile)).join('');
    
    // Add event listeners to cards
    elements.resultsGrid.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => openDetailModal(card.dataset.id, card.dataset.type));
    });
    
    elements.resultsGrid.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id, btn.dataset.type);
        });
    });
}

function renderProfileCard(profile) {
    const isFavorite = state.favorites.some(f => f.id === profile.id && f.type === profile._type);
    const name = profile.name || profile.model || profile.id;
    const brand = profile.brand || profile.manufacturer || 'Unknown';
    const material = profile.material || '';
    
    return `
        <div class="profile-card ${profile._type}" data-id="${profile.id}" data-type="${profile._type}">
            <div class="profile-type">${profile._type}</div>
            <div class="profile-brand">${brand}</div>
            <div class="profile-name">${name}</div>
            ${material ? `<div class="profile-material">${material}</div>` : ''}
            <div class="profile-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-id="${profile.id}" 
                        data-type="${profile._type}">
                    ${isFavorite ? '♥' : '♡'}
                </button>
            </div>
        </div>
    `;
}

function updateFavorites() {
    const favProfiles = [];
    
    state.favorites.forEach(fav => {
        const profiles = state.profiles[fav.type];
        const profile = profiles.find(p => p.id === fav.id);
        if (profile) {
            favProfiles.push({...profile, _type: fav.type});
        }
    });
    
    if (favProfiles.length === 0) {
        elements.favoritesGrid.innerHTML = '<div class="empty-state">No favorites yet</div>';
        return;
    }
    
    elements.favoritesGrid.innerHTML = favProfiles.map(profile => renderProfileCard(profile)).join('');
    
    // Add event listeners
    elements.favoritesGrid.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => openDetailModal(card.dataset.id, card.dataset.type));
    });
    
    elements.favoritesGrid.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id, btn.dataset.type);
        });
    });
}

// Actions
function toggleFavorite(id, type) {
    const index = state.favorites.findIndex(f => f.id === id && f.type === type);
    
    if (index > -1) {
        state.favorites.splice(index, 1);
        showToast('Removed from favorites', 'warning');
    } else {
        state.favorites.push({ id, type });
        showToast('Added to favorites', 'success');
    }
    
    localStorage.setItem('op3d-favorites', JSON.stringify(state.favorites));
    renderProfiles();
    updateFavorites();
}

function clearAllFavorites() {
    state.favorites = [];
    localStorage.setItem('op3d-favorites', JSON.stringify(state.favorites));
    renderProfiles();
    updateFavorites();
    showToast('All favorites cleared', 'success');
}

function handleSearch(e) {
    state.filters.search = e.target.value;
    renderProfiles();
}

function clearSearch() {
    elements.searchInput.value = '';
    state.filters.search = '';
    renderProfiles();
}

function applyFilters() {
    state.filters.type = elements.filterType.value;
    state.filters.material = elements.filterMaterial.value;
    state.filters.brand = elements.filterBrand.value;
    state.filters.color = elements.filterColor.value;
    renderProfiles();
    showToast('Filters applied', 'success');
}

function resetFilters() {
    elements.filterType.value = 'all';
    elements.filterMaterial.value = 'all';
    elements.filterBrand.value = 'all';
    elements.filterColor.value = 'all';
    elements.searchInput.value = '';
    
    state.filters = {
        type: 'all',
        material: 'all',
        brand: 'all',
        color: 'all',
        search: ''
    };
    
    renderProfiles();
    showToast('Filters reset', 'success');
}

function exportProfiles() {
    const selected = state.selectedForExport;
    if (selected.length === 0) {
        showToast('No profiles selected for export', 'warning');
        return;
    }
    
    const format = elements.exportFormat.value;
    const data = selected.map(s => state.profiles[s.type].find(p => p.id === s.id)).filter(Boolean);
    
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = 'openprint3d-profiles.json';
        mimeType = 'application/json';
    } else {
        content = data.map(d => JSON.stringify(d, null, 2)).join('\n\n---\n\n');
        filename = 'openprint3d-profiles.yaml';
        mimeType = 'text/yaml';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${data.length} profiles`, 'success');
}

// Tab Navigation
function switchTab(tabName) {
    state.currentTab = tabName;
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabName}-tab`);
    });
    
    if (tabName === 'favorites') {
        updateFavorites();
    }
}

// Modal
function openDetailModal(id, type) {
    const profile = state.profiles[type].find(p => p.id === id);
    if (!profile) return;
    
    const name = profile.name || profile.model || id;
    const brand = profile.brand || profile.manufacturer || 'Unknown';
    
    let detailsHtml = `
        <h2>${name}</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Brand:</strong> ${brand}</p>
    `;
    
    if (profile.material) {
        detailsHtml += `<p><strong>Material:</strong> ${profile.material}</p>`;
    }
    
    if (profile.build_volume) {
        const v = profile.build_volume;
        detailsHtml += `<p><strong>Build Volume:</strong> ${v.x} x ${v.y} x ${v.z} mm</p>`;
    }
    
    if (profile.kinematics) {
        detailsHtml += `<p><strong>Kinematics:</strong> ${profile.kinematics}</p>`;
    }
    
    if (profile.nozzle) {
        detailsHtml += `<p><strong>Nozzle Temp:</strong> ${profile.nozzle.recommended || profile.nozzle.min + '-' + profile.nozzle.max}°C</p>`;
    }
    
    if (profile.bed) {
        detailsHtml += `<p><strong>Bed Temp:</strong> ${profile.bed.recommended || profile.bed.min + '-' + profile.bed.max}°C</p>`;
    }
    
    if (profile.tags && profile.tags.length) {
        detailsHtml += `<p><strong>Tags:</strong> ${profile.tags.join(', ')}</p>`;
    }
    
    if (profile.notes) {
        detailsHtml += `<p><strong>Notes:</strong> ${profile.notes}</p>`;
    }
    
    detailsHtml += `<pre style="background:#f1f5f9;padding:1rem;overflow:auto;margin-top:1rem;border-radius:8px;">${JSON.stringify(profile, null, 2)}</pre>`;
    
    elements.modalBody.innerHTML = detailsHtml;
    elements.detailModal.classList.add('active');
}

function closeModal() {
    elements.detailModal.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
