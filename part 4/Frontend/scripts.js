/**
 * HBnB Frontend Application - Complete Full Stack Integration
 * 
 * UNIFIED ARCHITECTURE:
 * - Real Flask backend integration with intelligent fallback simulation
 * - JWT authentication with automatic token management
 * - Professional error handling with comprehensive logging
 * - Multi-environment support (development/production)
 * - Complete API integration with CORS handling
 * - Unified codebase with modular class architecture
 * 
 * FULL STACK FEATURES:
 * ✅ Real Flask API communication with automatic detection
 * ✅ JWT token management and session handling
 * ✅ Complete CRUD operations for places and reviews
 * ✅ Backend/frontend synchronization with real data
 * ✅ Intelligent fallback simulation when backend unavailable
 * ✅ Professional UI/UX with loading states and animations
 * ✅ Comprehensive validation and error recovery
 */

// ==================== UNIFIED CONFIGURATION & CONSTANTS ====================

/**
 * Complete application configuration for both backend and simulation modes
 * @constant {Object} API_CONFIG
 */
const API_CONFIG = {
    // Real Backend Configuration
    BACKEND_URL: 'http://localhost:5000',  // Flask backend default port
    API_BASE: '/api/v1',
    
    // Authentication Endpoints
    AUTH_ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register', 
        REFRESH: '/auth/refresh'
    },
    
    // Data Endpoints  
    ENDPOINTS: {
        PLACES: '/places',
        REVIEWS: '/reviews',
        USERS: '/users',
        AMENITIES: '/amenities'
    },
    
    // Request Configuration
    TIMEOUT: 8000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Environment Configuration
    USE_REAL_BACKEND: true,  // Set to false to use simulation only
    AUTO_DETECT: true,       // Automatically detect if backend is available
    DEBUG_MODE: true,        // Enable detailed logging
    FALLBACK_SUCCESS_RATE: 0.9 // For simulation fallback mode
};

/**
 * Application states for consistent state management
 * @constant {Object} APP_STATES
 */
const APP_STATES = {
    LOADING: 'loading',
    SUCCESS: 'success', 
    ERROR: 'error',
    IDLE: 'idle'
};

// ==================== BACKEND INTEGRATION CLASSES ====================

/**
 * Custom error classes for better error handling and user feedback
 */
class BackendError extends Error {
    constructor(message, status = 0, details = {}) {
        super(message);
        this.name = 'BackendError';
        this.status = status;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Gets user-friendly error message
     * @returns {string} User-friendly error message
     */
    getUserMessage() {
        switch (this.status) {
            case 400: return 'Données invalides. Vérifiez vos informations.';
            case 401: return 'Authentification requise. Connectez-vous.';
            case 403: return 'Accès refusé. Permissions insuffisantes.';
            case 404: return 'Ressource non trouvée.';
            case 409: return 'Conflit de données. Cette ressource existe déjà.';
            case 500: return 'Erreur serveur. Réessayez plus tard.';
            case 0: return 'Connexion au serveur impossible. Vérifiez votre connexion.';
            default: return 'Une erreur inattendue s\'est produite.';
        }
    }
}

/**
 * Professional Backend API Integration Manager
 * Handles communication with Flask backend and provides fallback mechanisms
 */
class BackendAPIManager {
    constructor() {
        this.baseURL = API_CONFIG.BACKEND_URL + API_CONFIG.API_BASE;
        this.backendAvailable = null;
        this.authToken = localStorage.getItem('authToken');
        this.requestCounter = 0;
    }

    /**
     * Detects if the real backend is available
     * Tests connectivity and sets up appropriate handling
     * @returns {Promise<boolean>} Backend availability status
     */
    async detectBackendAvailability() {
        if (!API_CONFIG.AUTO_DETECT) {
            this.backendAvailable = API_CONFIG.USE_REAL_BACKEND;
            return this.backendAvailable;
        }

        try {
            console.log('🔍 Testing backend connectivity...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            // Test basic connectivity to backend
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/places`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal,
                mode: 'cors' // Enable CORS
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok || response.status === 404) { // 404 is fine, means server is running
                this.backendAvailable = true;
                console.log('✅ Backend is available - Real API mode enabled');
                return true;
            } else {
                throw new Error(`Backend responded with status: ${response.status}`);
            }
            
        } catch (error) {
            this.backendAvailable = false;
            console.log('❌ Backend unavailable - Fallback to simulation mode');
            if (API_CONFIG.DEBUG_MODE) {
                console.log('Connection error:', error.message);
            }
            return false;
        }
    }

    /**
     * Makes authenticated API call to real backend
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request configuration options
     * @returns {Promise<Object>} API response data
     */
    async makeBackendCall(endpoint, options = {}) {
        const { method = 'GET', body = null, requiresAuth = false } = options;
        
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Add authentication if required
        if (requiresAuth && this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        // Prepare fetch options
        const fetchOptions = {
            method,
            headers,
            mode: 'cors',
            credentials: 'include'
        };

        // Add body for POST/PUT requests
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            fetchOptions.body = JSON.stringify(body);
        }

        try {
            this.requestCounter++;
            const requestId = `req_${this.requestCounter}_${Date.now()}`;
            
            if (API_CONFIG.DEBUG_MODE) {
                console.log(`🌐 [${requestId}] Backend API Call: ${method} ${this.baseURL}${endpoint}`);
            }
            
            // Make the actual request
            const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);
            
            // Handle response
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText || 'Unknown backend error' };
                }
                
                throw new BackendError(
                    `Backend API Error: ${response.status} ${response.statusText}`,
                    response.status,
                    errorData
                );
            }
            
            // Parse response data
            const data = await response.json();
            if (API_CONFIG.DEBUG_MODE) {
                console.log(`✅ [${requestId}] Backend API Success:`, data);
            }
            return data;
            
        } catch (error) {
            console.error(`❌ Backend API Error:`, error);
            
            if (error instanceof BackendError) {
                throw error;
            } else {
                throw new BackendError(
                    'Network error connecting to backend',
                    0,
                    { 
                        originalError: error.message,
                        endpoint: endpoint,
                        method: method 
                    }
                );
            }
        }
    }

    /**
     * Authenticates user with Flask backend
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication result with user data
     */
    async login(email, password) {
        try {
            console.log('🔐 Attempting backend authentication for:', email);
            
            const response = await this.makeBackendCall(API_CONFIG.AUTH_ENDPOINTS.LOGIN, {
                method: 'POST',
                body: { 
                    email: email, 
                    password: password 
                }
            });
            
            if (response.access_token) {
                // Store authentication token
                this.authToken = response.access_token;
                localStorage.setItem('authToken', this.authToken);
                
                // Prepare user data
                const userData = {
                    email: email,
                    name: response.user?.name || response.user?.first_name || email.split('@')[0],
                    role: response.user?.role || 'user',
                    id: response.user?.id,
                    token: this.authToken,
                    loginTime: new Date().toISOString()
                };
                
                console.log('✅ Backend authentication successful:', userData);
                return { success: true, user: userData };
            } else {
                throw new BackendError('Invalid authentication response', 401, response);
            }
            
        } catch (error) {
            console.error('❌ Backend authentication failed:', error);
            
            // Clear any stored tokens on auth failure
            this.authToken = null;
            localStorage.removeItem('authToken');
            
            throw error;
        }
    }

    /**
     * Fetches all places from backend
     * @returns {Promise<Array>} Array of place objects
     */
    async getPlaces() {
        try {
            console.log('🏠 Fetching places from backend...');
            const places = await this.makeBackendCall(API_CONFIG.ENDPOINTS.PLACES);
            console.log(`✅ Loaded ${places.length} places from backend`);
            return places;
        } catch (error) {
            console.error('❌ Failed to fetch places from backend:', error);
            throw error;
        }
    }

    /**
     * Creates a new review via backend API
     * @param {Object} reviewData - Review data object
     * @returns {Promise<Object>} Created review object
     */
    async createReview(reviewData) {
        try {
            console.log('📝 Creating review via backend:', reviewData);
            
            const backendReviewData = {
                text: reviewData.comment || reviewData.text,
                rating: parseInt(reviewData.rating),
                place_id: reviewData.placeId || reviewData.place_id
            };
            
            const review = await this.makeBackendCall(API_CONFIG.ENDPOINTS.REVIEWS, {
                method: 'POST',
                body: backendReviewData,
                requiresAuth: true
            });
            
            console.log('✅ Review created successfully:', review);
            return review;
            
        } catch (error) {
            console.error('❌ Failed to create review:', error);
            throw error;
        }
    }

    /**
     * Logs out user and cleans up authentication state
     */
    logout() {
        console.log('🔓 Logging out user...');
        this.authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        console.log('✅ Logout completed');
    }

    /**
     * Checks if user is currently authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.authToken;
    }
}

/**
 * Unified API Adapter that switches between backend and simulation
 * Provides seamless integration with intelligent fallback
 */
class UnifiedAPIAdapter {
    constructor() {
        this.backendManager = new BackendAPIManager();
        this.useBackend = API_CONFIG.USE_REAL_BACKEND;
        this.backendTested = false;
        this.initialized = false;
    }

    /**
     * Initializes the API adapter by testing backend connectivity
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 Initializing Unified API Adapter...');
            
            if (API_CONFIG.AUTO_DETECT) {
                this.useBackend = await this.backendManager.detectBackendAvailability();
                this.backendTested = true;
            } else {
                this.useBackend = API_CONFIG.USE_REAL_BACKEND;
            }
            
            const mode = this.useBackend ? 'Backend API' : 'Simulation';
            console.log(`✅ API Adapter initialized - Mode: ${mode}`);
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ API Adapter initialization failed:', error);
            this.useBackend = false; // Fallback to simulation
            this.initialized = true;
        }
    }

    /**
     * Unified login method
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result
     */
    async login(email, password) {
        await this.initialize();
        
        if (this.useBackend) {
            try {
                return await this.backendManager.login(email, password);
            } catch (error) {
                console.warn('Backend login failed, falling back to simulation');
                this.useBackend = false;
            }
        }
        
        // Fallback to simulation login
        return this.simulationLogin(email, password);
    }

    /**
     * Simulation login for fallback mode
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result
     */
    async simulationLogin(email, password) {
        const users = {
            'demo@hbnb.com': { name: 'Demo User', role: 'user', password: 'password' },
            'user@test.com': { name: 'John Doe', role: 'user', password: 'password' },
            'admin@test.com': { name: 'Admin Test', role: 'admin', password: 'admin' }
        };
        
        const user = users[email];
        if (!user || user.password !== password) {
            throw new ValidationError('Login Failed', 'Email ou mot de passe incorrect', 401);
        }
        
        const userData = {
            email: email,
            name: user.name,
            role: user.role,
            id: email.replace('@', '_').replace('.', '_'),
            loginTime: new Date().toISOString()
        };
        
        return { success: true, user: userData };
    }

    /**
     * Unified places fetching
     * @returns {Promise<Array>} Places array
     */
    async getPlaces() {
        await this.initialize();
        
        if (this.useBackend) {
            try {
                return await this.backendManager.getPlaces();
            } catch (error) {
                console.warn('Backend places fetch failed, falling back to simulation');
                this.useBackend = false;
            }
        }
        
        // Fallback to simulation data
        return Object.values(placesData);
    }

    /**
     * Gets connection status information
     * @returns {Object} Connection status details
     */
    getConnectionStatus() {
        return {
            initialized: this.initialized,
            usingBackend: this.useBackend,
            backendTested: this.backendTested,
            backendUrl: API_CONFIG.BACKEND_URL
        };
    }
}

// Global API adapter instance
const apiAdapter = new UnifiedAPIAdapter();

/**
 * Places database - Production-ready data structure
 * @constant {Object} placesData
 */
const placesData = {
    "logement-occasion": {
        id: "logement-occasion",
        name: "Logement d'Occasion",
        price: 50,
        location: "Centre-ville",
        country: "France",
        host: "Marie Dubois",
        description: "Logement confortable et abordable, parfait pour un séjour économique sans compromis sur le confort. Ce charmant appartement dispose de toutes les commodités nécessaires pour un séjour agréable.",
        image: "https://cdn.generationvoyage.fr/2022/02/logement-2-1.png",
        amenities: ["WiFi gratuit", "Cuisine équipée", "Parking", "TV"],
        reviews: [
            { user: "Jean Martin", rating: 4, comment: "Très bon rapport qualité-prix !", date: "2024-12-01" },
            { user: "Sophie Laurent", rating: 5, comment: "Logement parfait, très propre.", date: "2024-11-15" }
        ]
    },
    "appartement-ville": {
        id: "appartement-ville",
        name: "Appartement en Ville",
        price: 50,
        location: "Centre commercial",
        country: "France",
        host: "Pierre Moreau",
        description: "Logement moderne au cœur de la ville, proche de tous les commerces. Idéal pour découvrir la ville à pied et profiter de toutes les activités urbaines.",
        image: "https://cdn.generationvoyage.fr/2022/02/logement-7-1.png",
        amenities: ["WiFi gratuit", "Climatisation", "Balcon", "Proche transports"],
        reviews: [
            { user: "Claire Petit", rating: 5, comment: "Emplacement parfait !", date: "2024-12-05" }
        ]
    },
    "studio-building": {
        id: "studio-building",
        name: "Logement dans un Building",
        price: 100,
        location: "Quartier d'affaires",
        country: "Canada",
        host: "Antoine Bernard",
        description: "Studio élégant dans un immeuble moderne avec toutes les commodités. Design contemporain et équipements haut de gamme pour un séjour confortable.",
        image: "https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0",
        amenities: ["WiFi gratuit", "Salle de sport", "Conciergerie", "Parking sécurisé"],
        reviews: [
            { user: "Thomas Dubois", rating: 4, comment: "Moderne et fonctionnel.", date: "2024-11-28" }
        ]
    },
    "logement-naturel": {
        id: "logement-naturel",
        name: "Logement Naturel",
        price: 100,
        location: "En pleine nature",
        country: "Canada",
        host: "Emma Rousseau",
        description: "Échappez-vous dans ce logement en pleine nature, calme et ressourçant. Parfait pour se déconnecter et profiter du grand air dans un cadre exceptionnel.",
        image: "https://offloadmedia.feverup.com/lyonsecret.com/wp-content/uploads/2021/06/29070343/shutterstock_1531738394-1-1024x683.jpg",
        amenities: ["Vue sur nature", "Randonnée", "BBQ", "Calme absolu"],
        reviews: [
            { user: "Lucas Martin", rating: 5, comment: "Endroit magique pour se ressourcer !", date: "2024-12-02" },
            { user: "Camille Durand", rating: 5, comment: "Nature splendide, très relaxant.", date: "2024-11-20" }
        ]
    },
    "logement-luxe": {
        id: "logement-luxe",
        name: "Logement de Luxe",
        price: 200,
        location: "Quartier premium",
        country: "USA",
        host: "Alexandre Leroy",
        description: "Expérience haut de gamme dans ce logement luxueux avec services premium. Finitions exceptionnelles et prestations de standing pour un séjour inoubliable.",
        image: "https://th.bing.com/th/id/R.71168989b965ab7a44303873f6d662e1?rik=Qan76jaH30nDSw&pid=ImgRaw&r=0",
        amenities: ["Service de chambre", "Spa", "Piscine", "Terrasse privée"],
        reviews: [
            { user: "Isabelle Moreau", rating: 5, comment: "Luxe et raffinement au rendez-vous !", date: "2024-12-03" }
        ]
    },
    "logement-atypique": {
        id: "logement-atypique",
        name: "Logement Atypique",
        price: 200,
        location: "Lieu unique",
        country: "USA",
        host: "Julien Roux",
        description: "Logement unique et original pour une expérience inoubliable et authentique. Architecture remarquable et décoration soignée pour un séjour hors du commun.",
        image: "https://th.bing.com/th/id/R.a9f34fe1621bc5b434560f2108eea67c?rik=35e6%2fBt8noSMEA&pid=ImgRaw&r=0",
        amenities: ["Design unique", "Photogénique", "Expérience insolite", "Décoration originale"],
        reviews: [
            { user: "Marine Blanc", rating: 4, comment: "Vraiment original et mémorable !", date: "2024-11-30" }
        ]
    }
};

// ==================== GLOBAL STATE MANAGEMENT ====================

/**
 * Global application state
 */
let currentUser = null;
let currentState = APP_STATES.IDLE;
let apiCallsCount = 0; // For monitoring API performance

// ==================== UTILITY CLASSES ====================

/**
 * Validation utility class with comprehensive input validation
 * Implements security best practices and user-friendly error messages
 */
class ValidationUtils {
    /**
     * Validates email address with comprehensive regex
     * @param {string} email - Email to validate
     * @returns {Object} {isValid: boolean, message: string}
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, message: 'Email requis' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { isValid: false, message: 'Format d\'email invalide' };
        }
        
        if (email.length > 254) {
            return { isValid: false, message: 'Email trop long (max 254 caractères)' };
        }
        
        return { isValid: true, message: '' };
    }

    /**
     * Validates password with security requirements
     * @param {string} password - Password to validate  
     * @returns {Object} {isValid: boolean, message: string}
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { isValid: false, message: 'Mot de passe requis' };
        }
        
        if (password.length < 3) {
            return { isValid: false, message: 'Mot de passe trop court (min 3 caractères)' };
        }
        
        if (password.length > 128) {
            return { isValid: false, message: 'Mot de passe trop long (max 128 caractères)' };
        }
        
        return { isValid: true, message: '' };
    }

    /**
     * Validates review content and rating
     * @param {string} comment - Review comment
     * @param {number} rating - Rating value (1-5)
     * @returns {Object} {isValid: boolean, message: string}
     */
    static validateReview(comment, rating) {
        if (!comment || typeof comment !== 'string') {
            return { isValid: false, message: 'Commentaire requis' };
        }
        
        if (comment.trim().length < 10) {
            return { isValid: false, message: 'Commentaire trop court (min 10 caractères)' };
        }
        
        if (comment.length > 1000) {
            return { isValid: false, message: 'Commentaire trop long (max 1000 caractères)' };
        }
        
        const numRating = parseInt(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return { isValid: false, message: 'Note invalide (doit être entre 1 et 5)' };
        }
        
        return { isValid: true, message: '' };
    }

    /**
     * Sanitizes input to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeString(str) {
        if (!str || typeof str !== 'string') return '';
        return str.replace(/[<>\"'&]/g, function(match) {
            const replacements = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return replacements[match];
        });
    }
}

/**
 * Loading state manager for professional UI feedback
 * Handles all loading, success, and error states with animations
 */
class LoadingStateManager {
    /**
     * Shows loading indicator with spinner animation
     * @param {HTMLElement} element - Target element
     * @param {string} message - Loading message
     */
    static showLoading(element, message = 'Chargement...') {
        if (!element) return;
        
        const loadingHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <p class="loading-message">${ValidationUtils.sanitizeString(message)}</p>
            </div>
        `;
        
        element.innerHTML = loadingHTML;
        element.classList.add('loading-state');
        currentState = APP_STATES.LOADING;
    }

    /**
     * Shows success message with auto-removal
     * @param {HTMLElement} element - Target element
     * @param {string} message - Success message
     * @param {number} duration - Display duration in ms
     */
    static showSuccess(element, message = 'Opération réussie', duration = 3000) {
        if (!element) return;
        
        const successHTML = `
            <div class="success-indicator">
                <div class="success-icon">✅</div>
                <p class="success-message">${ValidationUtils.sanitizeString(message)}</p>
            </div>
        `;
        
        element.innerHTML = successHTML;
        element.classList.remove('loading-state');
        element.classList.add('success-state');
        currentState = APP_STATES.SUCCESS;
        
        if (duration > 0) {
            setTimeout(() => {
                element.classList.remove('success-state');
                currentState = APP_STATES.IDLE;
            }, duration);
        }
    }

    /**
     * Shows error message with detailed debugging info
     * @param {HTMLElement} element - Target element
     * @param {string} message - Error message
     * @param {Error} error - Error object for debugging
     */
    static showError(element, message = 'Une erreur est survenue', error = null) {
        if (!element) return;
        
        console.error('Application Error:', { message, error, timestamp: new Date().toISOString() });
        
        const errorHTML = `
            <div class="error-indicator">
                <div class="error-icon">❌</div>
                <p class="error-message">${ValidationUtils.sanitizeString(message)}</p>
                ${error && error.details ? `<p class="error-details">${ValidationUtils.sanitizeString(error.details)}</p>` : ''}
            </div>
        `;
        
        element.innerHTML = errorHTML;
        element.classList.remove('loading-state');
        element.classList.add('error-state');
        currentState = APP_STATES.ERROR;
    }

    /**
     * Clears all loading states
     * @param {HTMLElement} element - Target element
     */
    static clearStates(element) {
        if (!element) return;
        
        element.classList.remove('loading-state', 'success-state', 'error-state');
        currentState = APP_STATES.IDLE;
    }
}

/**
 * Professional API simulator with realistic network behaviors
 * Implements proper error handling, timeouts, and retry logic
 */
class APISimulator {
    /**
     * Simulates realistic network delay
     * @param {number} min - Minimum delay in ms
     * @param {number} max - Maximum delay in ms
     * @returns {Promise} Promise that resolves after delay
     */
    static async simulateNetworkDelay(min = 300, max = 1500) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Simulates potential network errors based on success rate
     * @returns {Promise} Promise that may reject with network error
     */
    static async simulateNetworkError() {
        if (Math.random() > API_CONFIG.SUCCESS_RATE) {
            const errors = [
                { code: 'NETWORK_ERROR', message: 'Erreur de connexion réseau' },
                { code: 'TIMEOUT', message: 'Délai d\'attente dépassé' },
                { code: 'SERVER_ERROR', message: 'Erreur serveur temporaire' },
                { code: 'RATE_LIMIT', message: 'Limite de requêtes dépassée' }
            ];
            const randomError = errors[Math.floor(Math.random() * errors.length)];
            throw new Error(randomError.message);
        }
    }

    /**
     * Makes simulated API call with comprehensive error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} API response promise
     */
    static async makeAPICall(endpoint, options = {}) {
        const { method = 'GET', body = null, timeout = API_CONFIG.TIMEOUT } = options;
        
        try {
            apiCallsCount++;
            console.log(`🌐 API Call #${apiCallsCount}: ${method} ${API_CONFIG.BASE_URL}${endpoint}`);
            
            // Simulate network delay
            await this.simulateNetworkDelay();
            
            // Simulate potential network errors
            await this.simulateNetworkError();
            
            // Create successful response
            const response = {
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => ({
                    success: true,
                    data: body || {},
                    timestamp: new Date().toISOString(),
                    callId: apiCallsCount
                })
            };
            
            console.log(`✅ API Call #${apiCallsCount} successful`);
            return response;
            
        } catch (error) {
            console.error(`❌ API Call #${apiCallsCount} failed:`, error.message);
            throw {
                name: 'APIError',
                message: error.message,
                details: `Failed ${method} request to ${endpoint}`,
                timestamp: new Date().toISOString(),
                callId: apiCallsCount
            };
        }
    }
}

// ==================== AUTHENTICATION SYSTEM ====================

/**
 * Checks authentication status on app load with error recovery
 * Validates localStorage data and handles corrupted sessions
 */
function checkAuth() {
    try {
        const user = localStorage.getItem('currentUser');
        if (user) {
            const parsedUser = JSON.parse(user);
            
            // Validate user data structure
            if (parsedUser && parsedUser.email && parsedUser.name) {
                currentUser = parsedUser;
                updateAuthUI();
                console.log('✅ User authenticated:', currentUser.email, '| Role:', currentUser.role);
            } else {
                console.warn('⚠️ Invalid user data in localStorage');
                localStorage.removeItem('currentUser');
            }
        }
    } catch (error) {
        console.error('❌ Auth check error:', error);
        localStorage.removeItem('currentUser'); // Clean corrupted data
    }
}

/**
 * Updates authentication UI with proper error handling
 * Supports different user roles with visual indicators
 * ✅ CRITICAL: Manages login link visibility based on authentication status
 */
function updateAuthUI() {
    try {
        const loginLink = document.getElementById('login-link') || document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');
        const username = document.getElementById('username');
        const addReviewSection = document.getElementById('add-review');

        if (currentUser && userInfo) {
            // User is authenticated - HIDE login link, SHOW user info
            if (loginLink) {
                loginLink.style.display = 'none';
                console.log('✅ Login link hidden (user authenticated)');
            }
            userInfo.style.display = 'inline-block';
            
            if (username) {
                if (currentUser.role === 'admin') {
                    username.textContent = `👑 ${currentUser.name} (Admin)`;
                    username.style.color = '#f39c12';
                    username.style.fontWeight = 'bold';
                    username.classList.add('admin');
                } else {
                    username.textContent = currentUser.name;
                    username.style.color = '#fff';
                    username.style.fontWeight = '600';
                    username.classList.remove('admin');
                }
            }
            
            if (addReviewSection) addReviewSection.style.display = 'block';
            
            console.log('👤 User UI updated:', currentUser.email, '| Role:', currentUser.role);
        } else {
            // User is NOT authenticated - SHOW login link, HIDE user info
            if (loginLink) {
                loginLink.style.display = 'inline-block';
                console.log('✅ Login link shown (user not authenticated)');
            }
            if (userInfo) userInfo.style.display = 'none';
            if (addReviewSection) addReviewSection.style.display = 'none';
            
            console.log('🔒 Anonymous user UI updated');
        }
    } catch (error) {
        console.error('❌ UI update error:', error);
    }
}

/**
 * Secure logout with complete session cleanup
 */
function logout() {
    try {
        localStorage.removeItem('currentUser');
        currentUser = null;
        currentState = APP_STATES.IDLE;
        updateAuthUI();
        
        console.log('✅ User logged out successfully');
        
        // Reload place page to hide review form
        if (window.location.pathname.includes('place.html')) {
            location.reload();
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
    }
}

/**
 * Professional login system with comprehensive validation and API integration
 * @param {string} email - User email
 * @param {string} password - User password  
 * @returns {Promise<boolean>} Login success status
 */
async function login(email, password) {
    try {
        // Input validation
        const emailValidation = ValidationUtils.validateEmail(email);
        if (!emailValidation.isValid) {
            throw new Error(emailValidation.message);
        }

        const passwordValidation = ValidationUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }

        // UI state management
        const loginButton = document.querySelector('.login-button-modern') || document.getElementById('login-submit');
        if (loginButton) {
            loginButton.textContent = 'Connexion...';
            loginButton.disabled = true;
            loginButton.style.opacity = '0.7';
        }

        // API authentication call using unified adapter
        console.log('🔑 Authentication attempt for:', email);
        
        const loginResult = await apiAdapter.login(email, password);

        if (loginResult.success && loginResult.user) {
            // Successful authentication
            currentUser = { ...loginResult.user };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();

            console.log('✅ Authentication successful:', currentUser.email, '| Role:', currentUser.role);

            // Success feedback
            if (loginButton) {
                loginButton.textContent = '✅ Connecté !';
                loginButton.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            }

            return true;
        } else {
            throw new Error('Échec de l\'authentification');
        }

    } catch (error) {
        console.error('❌ Authentication error:', error);

        // Error handling with user feedback
        const errorMessage = error.message || 'Erreur de connexion inconnue';
        showLoginError(errorMessage);

        // UI restoration
        const loginButton = document.querySelector('.login-button-modern') || document.getElementById('login-submit');
        if (loginButton) {
            loginButton.textContent = 'Se connecter';
            loginButton.disabled = false;
            loginButton.style.opacity = '1';
            loginButton.style.background = '';
        }

        return false;
    }
}

/**
 * Displays login error with user-friendly messaging
 * @param {string} message - Error message to display
 */
function showLoginError(message) {
    try {
        let errorDiv = document.getElementById('error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            
            const form = document.getElementById('login-form');
            if (form && form.parentNode) {
                form.parentNode.insertBefore(errorDiv, form);
            } else {
                document.body.appendChild(errorDiv);
            }
        }
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <strong>❌ Erreur de connexion</strong>
                <p>${ValidationUtils.sanitizeString(message)}</p>
                <small>Comptes de test disponibles:<br>
                👤 demo@hbnb.com / password<br>
                👤 user@test.com / password<br>
                👑 admin@test.com / admin</small>
            </div>
        `;
        
        // Auto-removal after 8 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 8000);
        
    } catch (error) {
        console.error('❌ Error display error:', error);
    }
}

// ==================== PLACES MANAGEMENT SYSTEM ====================

/**
 * Loads places from API and displays them with professional error handling
 * @returns {Promise<void>}
 */
async function loadPlacesFromAPI() {
    try {
        const placesContainer = document.getElementById('places-list');
        if (!placesContainer) return;

        // Show loading state
        LoadingStateManager.showLoading(placesContainer, 'Chargement des logements...');

        // Fetch places using unified adapter
        console.log('🏠 Fetching places using unified adapter...');
        
        const places = await apiAdapter.getPlaces();

        // Clear loading state
        LoadingStateManager.clearStates(placesContainer);

        // Display places from API or fallback data
        if (Array.isArray(places)) {
            displayPlacesArray(places);
        } else {
            displayPlacesFromData();
        }
        
        console.log('✅ Places loaded successfully');

    } catch (error) {
        console.error('❌ Error loading places:', error);
        const placesContainer = document.getElementById('places-list');
        if (placesContainer) {
            LoadingStateManager.showError(
                placesContainer, 
                'Erreur lors du chargement des logements', 
                error
            );
        }
    }
}

/**
 * Displays places from the placesData with efficient DOM manipulation
 * Uses price-based filtering for review compatibility
 */
function displayPlacesFromData() {
    try {
        const placesContainer = document.getElementById('places-list');
        if (!placesContainer) return;

        const placesHTML = Object.values(placesData).map(place => {
            return `
                <div class="place-card" data-id="${place.id}" data-price="${place.price}">
                    <img src="${place.image}" 
                         alt="${ValidationUtils.sanitizeString(place.name)}" 
                         class="place-image"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"200\"><rect width=\"100%\" height=\"100%\" fill=\"%23ddd\"/><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dy=\".3em\">Image non disponible</text></svg>'">
                    <h3>${ValidationUtils.sanitizeString(place.name)}</h3>
                    <p class="price">$${place.price} / nuit</p>
                    <p class="country">🌍 ${ValidationUtils.sanitizeString(place.country)}</p>
                    <p class="location">📍 ${ValidationUtils.sanitizeString(place.location)}</p>
                    <p>${ValidationUtils.sanitizeString(place.description)}</p>
                    <a href="place.html?id=${place.id}" class="details-button">Voir les détails</a>
                </div>
            `;
        }).join('');

        placesContainer.innerHTML = placesHTML;
        
        console.log('✅ Places displayed:', Object.keys(placesData).length, 'places');

    } catch (error) {
        console.error('❌ Error displaying places:', error);
    }
}

/**
 * Displays places from an array (backend API format)
 * Adapts backend data format to frontend display
 * @param {Array} places - Array of place objects from backend
 */
function displayPlacesArray(places) {
    try {
        const placesContainer = document.getElementById('places-list');
        if (!placesContainer) return;

        const placesHTML = places.map(place => {
            // Adapt backend format to frontend format
            const adaptedPlace = {
                id: place.id || place.place_id,
                name: place.name || place.title,
                price: place.price || place.price_per_night || 0,
                location: place.location || place.city,
                country: place.country || 'France',
                description: place.description || 'Description non disponible',
                image: place.image || place.photo_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Photo non disponible</text></svg>'
            };

            return `
                <div class="place-card" data-id="${adaptedPlace.id}" data-price="${adaptedPlace.price}">
                    <img src="${adaptedPlace.image}" 
                         alt="${ValidationUtils.sanitizeString(adaptedPlace.name)}" 
                         class="place-image"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"200\"><rect width=\"100%\" height=\"100%\" fill=\"%23ddd\"/><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dy=\".3em\">Image non disponible</text></svg>'">
                    <h3>${ValidationUtils.sanitizeString(adaptedPlace.name)}</h3>
                    <p class="price">$${adaptedPlace.price} / nuit</p>
                    <p class="country">🌍 ${ValidationUtils.sanitizeString(adaptedPlace.country)}</p>
                    <p class="location">📍 ${ValidationUtils.sanitizeString(adaptedPlace.location)}</p>
                    <p>${ValidationUtils.sanitizeString(adaptedPlace.description)}</p>
                    <a href="place.html?id=${adaptedPlace.id}" class="details-button">Voir les détails</a>
                </div>
            `;
        }).join('');

        placesContainer.innerHTML = placesHTML;
        
        console.log('✅ Places from backend displayed:', places.length, 'places');

    } catch (error) {
        console.error('❌ Error displaying backend places:', error);
        // Fallback to simulation data on error
        displayPlacesFromData();
    }
}

/**
 * Initializes price filter with comprehensive error handling for review compatibility
 */
function initPriceFilter() {
    try {
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', filterByPrice);
            console.log('✅ Price filter initialized');
        }
    } catch (error) {
        console.error('❌ Price filter initialization error:', error);
    }
}

/**
 * Filters places by price with efficient DOM manipulation and user feedback
 * ✅ CRITICAL: Client-side filtering based on selected price (50, 100, 200)
 */
function filterByPrice() {
    try {
        const selectedPrice = document.getElementById('price-filter').value;
        const placeCards = document.querySelectorAll('.place-card');
        
        if (!placeCards.length) {
            console.warn('⚠️ No place cards found for filtering');
            return;
        }

        // Visual filtering feedback
        const filterIndicator = document.createElement('div');
        filterIndicator.className = 'filter-indicator';
        filterIndicator.innerHTML = '🔍 Filtrage par prix en cours...';
        filterIndicator.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(180, 140, 255, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;
        document.body.appendChild(filterIndicator);

        let visibleCount = 0;
        
        // Efficient DOM manipulation
        placeCards.forEach((card, index) => {
            try {
                if (!selectedPrice) {
                    card.style.display = 'block';
                    visibleCount++;
                    return;
                }

                const cardPrice = card.getAttribute('data-price');
                
                if (!cardPrice) {
                    console.warn(`⚠️ Price data missing on card ${index}`);
                    return;
                }
                
                if (parseInt(cardPrice) === parseInt(selectedPrice)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            } catch (cardError) {
                console.error(`❌ Card processing error ${index}:`, cardError);
            }
        });

        // User feedback on filtering results
        setTimeout(() => {
            const priceText = selectedPrice ? `$${selectedPrice}` : 'Tous prix';
            filterIndicator.innerHTML = `✅ ${visibleCount} logement(s) affiché(s) (${priceText})`;
            setTimeout(() => {
                filterIndicator.remove();
            }, 2000);
        }, 300);

        console.log(`🔍 Price filtering completed: ${visibleCount} places displayed for price:`, selectedPrice || 'All');

    } catch (error) {
        console.error('❌ Price filtering error:', error);
    }
}

/**
 * Filters places by price with efficient DOM manipulation and user feedback
 */
function filterByPrice() {
    try {
        const selectedPrice = document.getElementById('price-filter').value;
        const placeCards = document.querySelectorAll('.place-card');
        
        if (!placeCards.length) {
            console.warn('⚠️ No place cards found for filtering');
            return;
        }

        // Visual filtering feedback
        const filterIndicator = document.createElement('div');
        filterIndicator.className = 'filter-indicator';
        filterIndicator.innerHTML = '🔍 Filtrage en cours...';
        filterIndicator.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(180, 140, 255, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;
        document.body.appendChild(filterIndicator);

        let visibleCount = 0;
        
        // Efficient DOM manipulation
        placeCards.forEach((card, index) => {
            try {
                if (!selectedPrice) {
                    card.style.display = 'block';
                    visibleCount++;
                    return;
                }

                const priceElement = card.querySelector('.price');
                if (!priceElement) {
                    console.warn(`⚠️ Price element missing on card ${index}`);
                    return;
                }

                const priceText = priceElement.textContent;
                const priceMatch = priceText.match(/\d+/);
                
                if (!priceMatch) {
                    console.warn(`⚠️ Invalid price format: ${priceText}`);
                    return;
                }

                const price = parseInt(priceMatch[0]);
                
                if (price === parseInt(selectedPrice)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            } catch (cardError) {
                console.error(`❌ Card processing error ${index}:`, cardError);
            }
        });

        // User feedback on filtering results
        setTimeout(() => {
            filterIndicator.innerHTML = `✅ ${visibleCount} logement(s) affiché(s)`;
            setTimeout(() => {
                filterIndicator.remove();
            }, 2000);
        }, 300);

        console.log(`🔍 Filtering completed: ${visibleCount} places displayed`);

    } catch (error) {
        console.error('❌ Price filtering error:', error);
    }
}

/**
 * Loads place details with comprehensive error handling
 * Handles missing places and corrupted URL parameters
 */
function loadPlaceDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const placeId = urlParams.get('id');
        
        if (!placeId || !placesData[placeId]) {
            document.getElementById('place-details').innerHTML = `
                <div class="error-message">
                    <h2>❌ Logement non trouvé</h2>
                    <p>Le logement demandé n'existe pas ou l'ID est invalide.</p>
                    <p><strong>ID recherché:</strong> ${ValidationUtils.sanitizeString(placeId || 'Non spécifié')}</p>
                    <a href="index.html" class="back-button">🏠 Retour à l'accueil</a>
                </div>
            `;
            console.error('❌ Place not found:', placeId);
            return;
        }

        const place = placesData[placeId];
        displayPlaceDetails(place);
        displayReviews(place.reviews, placeId);
        console.log('✅ Place details loaded:', place.name);
        
    } catch (error) {
        console.error('❌ Place details loading error:', error);
        document.getElementById('place-details').innerHTML = `
            <div class="error-message">
                <h2>❌ Erreur de chargement</h2>
                <p>Une erreur technique est survenue lors du chargement du logement.</p>
                <a href="index.html" class="back-button">🏠 Retour à l'accueil</a>
            </div>
        `;
    }
}

/**
 * Displays place details with optimized DOM manipulation
 * @param {Object} place - Place data object
 */
function displayPlaceDetails(place) {
    try {
        const detailsSection = document.getElementById('place-details');
        detailsSection.innerHTML = `
            <div class="place-header">
                <h1>${ValidationUtils.sanitizeString(place.name)}</h1>
                <p class="place-location">📍 ${ValidationUtils.sanitizeString(place.location)}</p>
                <p class="place-country">🌍 ${ValidationUtils.sanitizeString(place.country)}</p>
                <p class="place-price">💰 $${place.price} / nuit</p>
            </div>
            
            <div class="place-image-container">
                <img src="${place.image}" alt="${ValidationUtils.sanitizeString(place.name)}" class="place-main-image" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"><rect width=\"100%\" height=\"100%\" fill=\"%23ddd\"/><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dy=\".3em\">Image non disponible</text></svg>'">
            </div>
            
            <div class="place-description">
                <h2>📝 Description</h2>
                <p>${ValidationUtils.sanitizeString(place.description)}</p>
                <p><strong>🏠 Hôte:</strong> ${ValidationUtils.sanitizeString(place.host)}</p>
            </div>
            
            <div class="place-amenities">
                <h2>🎯 Équipements</h2>
                <ul class="amenities-list">
                    ${place.amenities.map(amenity => `<li>✅ ${ValidationUtils.sanitizeString(amenity)}</li>`).join('')}
                </ul>
            </div>
        `;
        console.log('✅ Place details displayed successfully');
    } catch (error) {
        console.error('❌ Place details display error:', error);
    }
}

/**
 * =====================================================================================
 * ENHANCED REVIEW DISPLAY SYSTEM
 * =====================================================================================
 * 
 * Professional review display with comprehensive statistics, role-based styling,
 * and advanced user experience features including search, sorting, and filtering.
 */

/**
 * Displays reviews with professional styling, statistics, and interactive features
 * @param {Array} reviews - Array of review objects
 * @param {string} placeId - Place identifier
 */
function displayReviews(reviews, placeId) {
    try {
        const reviewsList = document.getElementById('reviews-list');
        const reviewsStats = document.getElementById('reviews-stats');
        
        if (!reviewsList) {
            console.error('❌ Reviews list container not found');
            return;
        }

        // === STATISTICS CALCULATION ===
        const stats = calculateReviewStatistics(reviews);
        
        // Update stats display
        if (reviewsStats) {
            reviewsStats.innerHTML = `
                <span>${stats.totalReviews} avis</span> • 
                <span>${stats.averageRating}⭐ moyenne</span>
                ${stats.totalReviews > 0 ? ` • <span>Dernier : ${stats.latestDate}</span>` : ''}
            `;
        }

        // === EMPTY STATE HANDLING ===
        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews-state">
                    <div class="no-reviews-icon">💭</div>
                    <h3>Aucun avis pour le moment</h3>
                    <p>Soyez le premier à partager votre expérience avec ce logement !</p>
                    ${currentUser ? 
                        '<p class="encouragement">👆 Utilisez le formulaire ci-dessus pour laisser votre avis</p>' : 
                        '<p class="login-prompt"><a href="login.html">Connectez-vous</a> pour laisser un avis</p>'
                    }
                </div>
            `;
            
            // Add styles for empty state
            addEmptyStateStyles();
            return;
        }

        // === REVIEWS SORTING AND FILTERING ===
        const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // === REVIEWS RENDERING ===
        reviewsList.innerHTML = `
            <div class="reviews-controls">
                <div class="reviews-summary">
                    <div class="rating-breakdown">
                        ${generateRatingBreakdown(reviews)}
                    </div>
                </div>
                <div class="reviews-filters">
                    <select id="rating-filter" onchange="filterReviewsByRating('${placeId}')">
                        <option value="">Toutes les notes</option>
                        <option value="5">5 étoiles</option>
                        <option value="4">4 étoiles</option>
                        <option value="3">3 étoiles</option>
                        <option value="2">2 étoiles</option>
                        <option value="1">1 étoile</option>
                    </select>
                </div>
            </div>
            <div class="reviews-container">
                ${sortedReviews.map(review => generateReviewCard(review, placeId)).join('')}
            </div>
        `;

        // === INTERACTIVE FEATURES INITIALIZATION ===
        initializeReviewInteractions(placeId);
        
        console.log(`✅ Reviews displayed: ${reviews.length} reviews with ${stats.averageRating}⭐ average`);
        
    } catch (error) {
        console.error('❌ Reviews display error:', error);
        displayReviewsErrorState();
    }
}

/**
 * Calculates comprehensive statistics for reviews
 * @param {Array} reviews - Array of review objects
 * @returns {Object} Statistics object
 */
function calculateReviewStatistics(reviews) {
    try {
        if (!reviews || reviews.length === 0) {
            return {
                totalReviews: 0,
                averageRating: '0.0',
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                latestDate: 'N/A',
                wordCount: 0
            };
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';
        
        // Rating distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingDistribution[review.rating]++;
            }
        });
        
        // Latest review date
        const dates = reviews.map(review => new Date(review.date)).filter(date => !isNaN(date));
        const latestDate = dates.length > 0 ? 
            new Date(Math.max(...dates)).toLocaleDateString('fr-FR') : 'N/A';
        
        // Total word count
        const wordCount = reviews.reduce((total, review) => {
            return total + (review.comment ? review.comment.split(' ').length : 0);
        }, 0);

        return {
            totalReviews,
            averageRating,
            ratingDistribution,
            latestDate,
            wordCount
        };
        
    } catch (error) {
        console.error('❌ Statistics calculation error:', error);
        return {
            totalReviews: 0,
            averageRating: '0.0',
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            latestDate: 'Error',
            wordCount: 0
        };
    }
}

/**
 * Generates rating breakdown visualization
 * @param {Array} reviews - Array of review objects
 * @returns {string} HTML for rating breakdown
 */
function generateRatingBreakdown(reviews) {
    const stats = calculateReviewStatistics(reviews);
    const total = stats.totalReviews;
    
    if (total === 0) {
        return '<div class="no-ratings">Aucune évaluation</div>';
    }
    
    return `
        <div class="rating-breakdown-content">
            <div class="average-rating">
                <span class="average-number">${stats.averageRating}</span>
                <div class="average-stars">${'⭐'.repeat(Math.round(parseFloat(stats.averageRating)))}</div>
                <span class="total-count">(${total} avis)</span>
            </div>
            <div class="rating-bars">
                ${[5,4,3,2,1].map(rating => {
                    const count = stats.ratingDistribution[rating];
                    const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
                    return `
                        <div class="rating-bar">
                            <span class="rating-label">${rating}⭐</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="rating-count">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Generates individual review card with professional styling
 * @param {Object} review - Review object
 * @param {string} placeId - Place identifier
 * @returns {string} HTML for review card
 */
function generateReviewCard(review, placeId) {
    try {
        // User display with role badges
        let userDisplay = ValidationUtils.sanitizeString(review.user || 'Utilisateur Anonyme');
        let userBadge = '';
        
        if (review.userRole === 'admin' || review.user.includes('Admin')) {
            userDisplay = `👑 ${review.user}`;
            userBadge = '<span class="admin-badge">Administrateur</span>';
        } else if (review.verified) {
            userBadge = '<span class="verified-badge">✓ Vérifié</span>';
        }
        
        // Date formatting
        const reviewDate = review.date ? new Date(review.date) : new Date();
        const formattedDate = reviewDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Comment processing
        const comment = ValidationUtils.sanitizeString(review.comment || 'Aucun commentaire');
        const wordCount = comment.split(' ').length;
        const isLongReview = wordCount > 50;
        
        // Rating stars
        const ratingStars = '⭐'.repeat(Math.max(1, Math.min(5, review.rating || 1)));
        
        return `
            <div class="review-card" data-rating="${review.rating}" data-review-id="${review.id || 'unknown'}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <h4 class="reviewer-name">${userDisplay}</h4>
                        ${userBadge}
                        <div class="review-meta">
                            <span class="review-date">📅 ${formattedDate}</span>
                            <span class="word-count">${wordCount} mots</span>
                        </div>
                    </div>
                    <div class="review-rating-display">
                        <div class="stars">${ratingStars}</div>
                        <div class="rating-number">${review.rating}/5</div>
                    </div>
                </div>
                
                <div class="review-content">
                    <p class="review-comment ${isLongReview ? 'long-review' : ''}">
                        ${comment}
                    </p>
                    ${isLongReview ? `
                        <button class="expand-review" onclick="toggleReviewExpansion(this)">
                            Lire la suite...
                        </button>
                    ` : ''}
                </div>
                
                ${review.metadata ? `
                    <div class="review-metadata">
                        <small class="metadata-info">
                            ${review.metadata.characterCount} caractères • 
                            Soumis via ${review.metadata.submissionSource || 'web'} •
                            ${review.timestamp ? new Date(review.timestamp).toLocaleTimeString('fr-FR') : ''}
                        </small>
                    </div>
                ` : ''}
                
                <div class="review-actions">
                    <button class="helpful-btn" onclick="markReviewHelpful('${review.id}', '${placeId}')" 
                            ${!currentUser ? 'disabled title="Connexion requise"' : ''}>
                        👍 Utile ${review.helpfulCount || 0 > 0 ? `(${review.helpfulCount})` : ''}
                    </button>
                    ${currentUser && (currentUser.role === 'admin' || currentUser.email === review.userId) ? `
                        <button class="edit-review-btn" onclick="editReview('${review.id}', '${placeId}')">
                            ✏️ Modifier
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Review card generation error:', error);
        return `
            <div class="review-card error-card">
                <p class="error-message">❌ Erreur d'affichage de cet avis</p>
            </div>
        `;
    }
}

/**
 * Initializes interactive features for reviews
 * @param {string} placeId - Place identifier
 */
function initializeReviewInteractions(placeId) {
    try {
        // Add dynamic styles for review components
        addReviewStyles();
        
        // Initialize long review truncation
        initializeLongReviewHandling();
        
        // Setup keyboard navigation
        setupReviewKeyboardNavigation();
        
        console.log('✅ Review interactions initialized');
        
    } catch (error) {
        console.error('❌ Review interactions initialization error:', error);
    }
}

/**
 * Adds comprehensive styles for review components
 */
function addReviewStyles() {
    if (document.getElementById('review-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'review-styles';
    style.textContent = `
        .no-reviews-state {
            text-align: center;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, rgba(180, 140, 255, 0.05), rgba(180, 140, 255, 0.02));
            border-radius: 16px;
            margin: 2rem 0;
        }
        .no-reviews-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .reviews-controls {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .rating-breakdown-content {
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        .average-rating {
            text-align: center;
        }
        .average-number {
            font-size: 2rem;
            font-weight: bold;
            color: #b48cff;
        }
        .rating-bars {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }
        .rating-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        .bar-container {
            width: 100px;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ffd700, #ffed4e);
            transition: width 0.3s ease;
        }
        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        .reviewer-info h4 {
            margin: 0 0 0.5rem 0;
            color: #2d3748;
        }
        .admin-badge {
            background: linear-gradient(135deg, #ff6b35, #ff8c42);
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: bold;
            margin-left: 0.5rem;
        }
        .verified-badge {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: bold;
            margin-left: 0.5rem;
        }
        .review-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.8rem;
            color: #666;
        }
        .review-rating-display {
            text-align: right;
        }
        .stars {
            font-size: 1.2rem;
            margin-bottom: 0.2rem;
        }
        .rating-number {
            font-size: 0.9rem;
            color: #666;
        }
        .long-review {
            max-height: 4em;
            overflow: hidden;
            position: relative;
        }
        .long-review.expanded {
            max-height: none;
        }
        .expand-review {
            background: none;
            border: none;
            color: #b48cff;
            cursor: pointer;
            font-size: 0.9rem;
            padding: 0.5rem 0;
            text-decoration: underline;
        }
        .review-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(180, 140, 255, 0.1);
        }
        .helpful-btn, .edit-review-btn {
            background: rgba(180, 140, 255, 0.1);
            border: 1px solid rgba(180, 140, 255, 0.2);
            color: #b48cff;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s ease;
        }
        .helpful-btn:hover:not(:disabled) {
            background: rgba(180, 140, 255, 0.2);
            transform: translateY(-1px);
        }
        .helpful-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .review-metadata {
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            border-top: 1px solid rgba(0,0,0,0.05);
        }
        .metadata-info {
            color: #999;
            font-size: 0.75rem;
        }
        @media (max-width: 768px) {
            .rating-breakdown-content {
                flex-direction: column;
                text-align: center;
                gap: 1rem;
            }
            .reviews-controls {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Adds empty state styles
 */
function addEmptyStateStyles() {
    if (document.getElementById('empty-state-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'empty-state-styles';
    style.textContent = `
        .encouragement {
            color: #27ae60;
            font-weight: 500;
        }
        .login-prompt a {
            color: #b48cff;
            text-decoration: none;
            font-weight: 600;
        }
        .login-prompt a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Displays error state for reviews
 */
function displayReviewsErrorState() {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = `
        <div class="reviews-error-state">
            <div class="error-icon">⚠️</div>
            <h3>Erreur de chargement</h3>
            <p>Impossible de charger les avis. Veuillez rafraîchir la page.</p>
            <button onclick="location.reload()" class="refresh-btn">
                🔄 Actualiser
            </button>
        </div>
    `;
}

/**
 * Filters reviews by rating
 * @param {string} placeId - Place identifier
 */
function filterReviewsByRating(placeId) {
    try {
        const filterValue = document.getElementById('rating-filter')?.value;
        const place = placesData[placeId];
        
        if (!place || !place.reviews) return;
        
        const filteredReviews = filterValue ? 
            place.reviews.filter(review => review.rating.toString() === filterValue) :
            place.reviews;
            
        displayReviews(filteredReviews, placeId);
        
        console.log(`🔍 Reviews filtered by rating ${filterValue || 'all'}: ${filteredReviews.length} results`);
        
    } catch (error) {
        console.error('❌ Review filtering error:', error);
    }
}

/**
 * Toggles review expansion for long reviews
 * @param {HTMLElement} button - Expand button element
 */
function toggleReviewExpansion(button) {
    try {
        const reviewComment = button.previousElementSibling;
        const isExpanded = reviewComment.classList.contains('expanded');
        
        if (isExpanded) {
            reviewComment.classList.remove('expanded');
            button.textContent = 'Lire la suite...';
        } else {
            reviewComment.classList.add('expanded');
            button.textContent = 'Réduire';
        }
        
    } catch (error) {
        console.error('❌ Review expansion error:', error);
    }
}

/**
 * Initializes handling for long reviews
 */
function initializeLongReviewHandling() {
    try {
        const longReviews = document.querySelectorAll('.long-review');
        longReviews.forEach(review => {
            if (review.scrollHeight > review.clientHeight) {
                review.classList.add('truncated');
            }
        });
    } catch (error) {
        console.error('❌ Long review handling error:', error);
    }
}

/**
 * Sets up keyboard navigation for reviews
 */
function setupReviewKeyboardNavigation() {
    try {
        const reviewCards = document.querySelectorAll('.review-card');
        reviewCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Avis ${index + 1}`);
        });
    } catch (error) {
        console.error('❌ Keyboard navigation setup error:', error);
    }
}

/**
 * Marks a review as helpful
 * @param {string} reviewId - Review identifier
 * @param {string} placeId - Place identifier
 */
function markReviewHelpful(reviewId, placeId) {
    try {
        if (!currentUser) {
            showAdvancedReviewError('Vous devez être connecté pour marquer un avis comme utile');
            return;
        }
        
        const place = placesData[placeId];
        if (!place) return;
        
        const review = place.reviews.find(r => r.id === reviewId);
        if (!review) return;
        
        // Initialize helpful count if not exists
        if (!review.helpfulCount) review.helpfulCount = 0;
        if (!review.helpfulUsers) review.helpfulUsers = [];
        
        // Check if user already marked as helpful
        if (review.helpfulUsers.includes(currentUser.email)) {
            showAdvancedReviewError('Vous avez déjà marqué cet avis comme utile');
            return;
        }
        
        // Mark as helpful
        review.helpfulCount++;
        review.helpfulUsers.push(currentUser.email);
        
        // Update localStorage
        localStorage.setItem('placesData', JSON.stringify(placesData));
        
        // Refresh display
        displayReviews(place.reviews, placeId);
        
        showEnhancedSuccessMessage(`✅ Avis marqué comme utile ! (${review.helpfulCount} personnes trouvent cet avis utile)`);
        
    } catch (error) {
        console.error('❌ Mark helpful error:', error);
        showAdvancedReviewError('Erreur lors du marquage de l\'avis');
    }
}

// ==================== REVIEWS MANAGEMENT SYSTEM ====================

/**
 * Initializes review form with real-time validation
 * Implements professional form handling with immediate user feedback
 */
function initReviewForm() {
    try {
        const reviewForm = document.getElementById('review-form');
        if (!reviewForm) {
            console.log('ℹ️ Review form not found on this page');
            return;
        }

        reviewForm.addEventListener('submit', handleReviewSubmit);
        
        // Real-time validation setup
        const reviewText = document.getElementById('review-text');
        const reviewRating = document.getElementById('review-rating');
        
        if (reviewText) {
            reviewText.addEventListener('input', validateReviewText);
            reviewText.addEventListener('blur', validateReviewText);
        }
        
        if (reviewRating) {
            reviewRating.addEventListener('change', validateReviewRating);
        }
        
        console.log('✅ Review form initialized with real-time validation');
        
    } catch (error) {
        console.error('❌ Review form initialization error:', error);
    }
}

/**
 * Real-time review text validation with character counting
 * @param {Event} event - Input event
 */
function validateReviewText(event) {
    try {
        const textInput = event.target;
        const text = textInput.value.trim();
        const validation = ValidationUtils.validateReview(text, 5); // Temporary rating for text validation
        
        // Remove previous validation messages
        const existingError = textInput.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Show validation error if text is invalid and not empty
        if (!validation.isValid && text.length > 0) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'validation-error';
            errorSpan.textContent = validation.message;
            errorSpan.style.cssText = `
                color: #e74c3c;
                font-size: 0.8rem;
                display: block;
                margin-top: 0.3rem;
            `;
            textInput.parentNode.appendChild(errorSpan);
            textInput.style.borderColor = '#e74c3c';
        } else {
            textInput.style.borderColor = '#b48cff';
        }
        
        // Character counter with visual feedback
        let charCounter = textInput.parentNode.querySelector('.char-counter');
        if (!charCounter) {
            charCounter = document.createElement('small');
            charCounter.className = 'char-counter';
            charCounter.style.cssText = `
                display: block;
                text-align: right;
                margin-top: 0.3rem;
                color: #95a5a6;
                font-size: 0.8rem;
            `;
            textInput.parentNode.appendChild(charCounter);
        }
        
        charCounter.textContent = `${text.length}/1000 caractères`;
        if (text.length > 1000) {
            charCounter.style.color = '#e74c3c';
        } else if (text.length >= 10) {
            charCounter.style.color = '#27ae60';
        } else {
            charCounter.style.color = '#95a5a6';
        }
        
    } catch (error) {
        console.error('❌ Review text validation error:', error);
    }
}

/**
 * Rating validation with visual feedback
 * @param {Event} event - Change event
 */
function validateReviewRating(event) {
    try {
        const ratingSelect = event.target;
        const rating = parseInt(ratingSelect.value);
        
        const existingError = ratingSelect.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (isNaN(rating) || rating < 1 || rating > 5) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'validation-error';
            errorSpan.textContent = 'Veuillez sélectionner une note entre 1 et 5 étoiles';
            errorSpan.style.cssText = `
                color: #e74c3c;
                font-size: 0.8rem;
                display: block;
                margin-top: 0.3rem;
            `;
            ratingSelect.parentNode.appendChild(errorSpan);
            ratingSelect.style.borderColor = '#e74c3c';
        } else {
            ratingSelect.style.borderColor = '#b48cff';
        }
        
    } catch (error) {
        console.error('❌ Rating validation error:', error);
    }
}

/**
 * =====================================================================================
 * PROFESSIONAL REVIEW SUBMISSION SYSTEM
 * =====================================================================================
 * 
 * Advanced review submission with comprehensive API integration, validation pipeline,
 * error recovery mechanisms, and professional user experience patterns.
 * 
 * Features:
 * - Multi-stage validation (client + server simulation)
 * - Real-time user feedback with loading states
 * - Comprehensive error handling with retry mechanisms
 * - Professional API simulation with realistic network behaviors
 * - Automatic data persistence and UI updates
 * - Role-based user identification and access control
 * 
 * @param {Event} e - Form submit event
 * @returns {Promise<void>} - Async operation completion
 */
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    // === INITIALIZATION AND ELEMENT REFERENCES ===
    const submitButton = document.querySelector('#review-form button[type="submit"]');
    const reviewForm = document.getElementById('review-form');
    const originalButtonText = submitButton ? submitButton.textContent : 'Submit Review';
    const loadingStates = new LoadingStateManager();
    
    let retryCount = 0;
    const maxRetries = 3;
    
    try {
        // === AUTHENTICATION AND AUTHORIZATION VALIDATION ===
        if (!currentUser) {
            throw new ValidationError('Authentication Required', 
                'Vous devez être connecté pour laisser un avis. Connectez-vous d\'abord.', 401);
        }

        // === DATA EXTRACTION AND SANITIZATION ===
        const reviewText = document.getElementById('review-text')?.value?.trim();
        const reviewRating = document.getElementById('review-rating')?.value;
        const urlParams = new URLSearchParams(window.location.search);
        const placeId = urlParams.get('id');
        
        // Comprehensive data validation
        if (!placeId) {
            throw new ValidationError('Missing Place ID', 
                'Impossible d\'identifier le logement. Rechargez la page.', 400);
        }
        
        if (!placesData[placeId]) {
            throw new ValidationError('Invalid Place', 
                'Ce logement n\'existe pas ou a été supprimé.', 404);
        }

        // === MULTI-LEVEL VALIDATION PIPELINE ===
        
        // Stage 1: Basic field validation
        const basicValidation = ValidationUtils.validateReview(reviewText, reviewRating);
        if (!basicValidation.isValid) {
            throw new ValidationError('Validation Failed', basicValidation.message, 422);
        }
        
        // Stage 2: Advanced content validation
        const advancedValidation = validateReviewContent(reviewText, reviewRating, placeId);
        if (!advancedValidation.isValid) {
            throw new ValidationError('Content Validation Failed', advancedValidation.message, 422);
        }
        
        // Stage 3: User permission validation
        const permissionValidation = validateUserReviewPermission(currentUser, placeId);
        if (!permissionValidation.isValid) {
            throw new ValidationError('Permission Denied', permissionValidation.message, 403);
        }

        // === UI STATE MANAGEMENT - LOADING STATE ===
        loadingStates.setLoading('review-form', {
            button: submitButton,
            originalText: originalButtonText,
            loadingText: '📤 Envoi de l\'avis en cours...',
            form: reviewForm
        });

        // === API SUBMISSION WITH RETRY MECHANISM ===
        let apiResponse;
        while (retryCount <= maxRetries) {
            try {
                console.log(`📝 Review submission attempt ${retryCount + 1}/${maxRetries + 1} for place:`, placeId);
                
                // Use unified API adapter for review submission
                const reviewData = {
                    placeId: placeId,
                    place_id: placeId,
                    comment: reviewText,
                    text: reviewText,
                    rating: parseInt(reviewRating)
                };
                
                // Try to submit via backend first, fallback to simulation
                try {
                    if (apiAdapter.useBackend) {
                        apiResponse = await apiAdapter.backendManager.createReview(reviewData);
                        console.log('✅ Review submitted to backend:', apiResponse);
                    } else {
                        throw new Error('Backend not available, using simulation');
                    }
                } catch (backendError) {
                    console.warn('Backend review submission failed, using simulation mode');
                    
                    // Fallback to API simulation
                    apiResponse = await APISimulator.makeAPICall('/api/v1/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser.token || 'demo-token'}`,
                            'X-User-Role': currentUser.role,
                            'X-Request-ID': generateRequestId()
                        },
                        body: {
                            placeId: placeId,
                            userId: currentUser.id || currentUser.email,
                            userName: currentUser.name,
                            userRole: currentUser.role,
                            comment: reviewText,
                            rating: parseInt(reviewRating),
                            metadata: {
                                timestamp: new Date().toISOString(),
                                userAgent: navigator.userAgent,
                                language: navigator.language,
                                wordCount: reviewText.split(' ').length,
                                characterCount: reviewText.length
                            }
                        }
                    });
                }
                
                // If we get here, the API call was successful
                break;
                
            } catch (apiError) {
                retryCount++;
                
                if (retryCount > maxRetries) {
                    throw new APIError('Submission Failed After Retries', 
                        `Impossible d'envoyer l'avis après ${maxRetries} tentatives. Vérifiez votre connexion.`, 503);
                }
                
                // Exponential backoff for retries
                const retryDelay = Math.pow(2, retryCount) * 1000;
                console.warn(`⚠️ API retry ${retryCount}/${maxRetries} after ${retryDelay}ms`, apiError.message);
                
                // Update button text to show retry
                if (submitButton) {
                    submitButton.textContent = `🔄 Tentative ${retryCount}/${maxRetries}...`;
                }
                
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        // === DATA PROCESSING AND PERSISTENCE ===
        
        // Create comprehensive review object with metadata
        const newReview = {
            id: generateUniqueReviewId(),
            placeId: placeId,
            user: currentUser.name,
            userId: currentUser.id || currentUser.email,
            userRole: currentUser.role,
            rating: parseInt(reviewRating),
            comment: ValidationUtils.sanitizeString(reviewText),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            verified: currentUser.role === 'admin',
            metadata: {
                wordCount: reviewText.split(' ').length,
                characterCount: reviewText.length,
                submissionSource: 'web-form',
                ipAddress: 'simulated-ip', // In real app, would be server-side
                userAgent: navigator.userAgent.substring(0, 100) // Truncated for storage
            }
        };

        // === DATA PERSISTENCE WITH BACKUP ===
        try {
            // Primary storage
            placesData[placeId].reviews.push(newReview);
            localStorage.setItem('placesData', JSON.stringify(placesData));
            
            // Backup storage for recovery
            const reviewBackup = JSON.parse(localStorage.getItem('reviewsBackup') || '{}');
            if (!reviewBackup[placeId]) reviewBackup[placeId] = [];
            reviewBackup[placeId].push(newReview);
            localStorage.setItem('reviewsBackup', JSON.stringify(reviewBackup));
            
            console.log('💾 Review data persisted with backup');
            
        } catch (storageError) {
            console.error('⚠️ Storage error (continuing anyway):', storageError);
            // Continue even if storage fails - the review is still shown in UI
        }
        
        // === UI UPDATES AND SUCCESS FEEDBACK ===
        
        // Update reviews display
        displayReviews(placesData[placeId].reviews, placeId);
        
        // Professional form cleanup
        performFormCleanup(reviewForm);
        
        // Success notification with detailed information
        const userName = currentUser.role === 'admin' ? `👑 ${currentUser.name} (Admin)` : currentUser.name;
        const successMessage = generateSuccessMessage(userName, reviewRating, newReview.id);
        showEnhancedSuccessMessage(successMessage);

        // === BUTTON SUCCESS STATE WITH ANIMATION ===
        loadingStates.setSuccess('review-form', {
            button: submitButton,
            successText: '✅ Avis publié avec succès !',
            successColor: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            duration: 4000
        });

        // === LOGGING AND ANALYTICS ===
        console.log('✅ Review submitted successfully:', {
            reviewId: newReview.id,
            placeId: placeId,
            userId: currentUser.email,
            rating: reviewRating,
            wordCount: newReview.metadata.wordCount,
            retryCount: retryCount
        });

        // === OPTIONAL: TRIGGER ADDITIONAL ACTIONS ===
        // Update place statistics
        updatePlaceStatistics(placeId);
        
        // Send notification (simulated)
        sendReviewNotification(newReview);

    } catch (error) {
        console.error('❌ Review submission error:', error);
        
        // === COMPREHENSIVE ERROR HANDLING ===
        
        // Determine error type and appropriate response
        let errorMessage = 'Une erreur inattendue s\'est produite.';
        let errorCode = error.code || 500;
        
        if (error instanceof ValidationError) {
            errorMessage = error.userMessage || error.message;
        } else if (error instanceof APIError) {
            errorMessage = error.userMessage || 'Erreur de connexion au serveur.';
        } else if (error.name === 'NetworkError') {
            errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
        } else {
            errorMessage = 'Erreur technique. Veuillez réessayer dans quelques instants.';
        }
        
        // Display professional error message
        showAdvancedReviewError(errorMessage, {
            errorCode: errorCode,
            retryCount: retryCount,
            canRetry: retryCount <= maxRetries,
            timestamp: new Date().toISOString()
        });
        
        // === UI STATE RESTORATION ===
        loadingStates.setError('review-form', {
            button: submitButton,
            originalText: originalButtonText,
            errorText: '❌ Erreur - Réessayer',
            duration: 5000
        });
        
        // === ERROR LOGGING FOR DEBUGGING ===
        console.error('Review submission error details:', {
            error: error,
            placeId: urlParams.get('id'),
            userId: currentUser?.email,
            retryCount: retryCount,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }
}

/**
 * =====================================================================================
 * ADVANCED REVIEW VALIDATION AND UTILITY FUNCTIONS
 * =====================================================================================
 * 
 * Professional validation pipeline with comprehensive content analysis,
 * user permission management, and supporting utility functions.
 */

/**
 * Advanced content validation for review submissions
 * Performs deep analysis of review content quality and appropriateness
 * 
 * @param {string} text - Review text content
 * @param {string|number} rating - User rating (1-5)
 * @param {string} placeId - Place identifier
 * @returns {Object} Validation result with detailed feedback
 */
function validateReviewContent(text, rating, placeId) {
    try {
        const validation = {
            isValid: true,
            issues: [],
            warnings: [],
            score: 0
        };
        
        // Content length analysis
        const wordCount = text.split(/\s+/).length;
        const charCount = text.length;
        
        if (wordCount < 3) {
            validation.issues.push('Avis trop court - minimum 3 mots requis');
            validation.isValid = false;
        } else if (wordCount >= 3) {
            validation.score += 25;
        }
        
        if (wordCount > 500) {
            validation.warnings.push('Avis très long - considérez le raccourcir');
        } else if (wordCount <= 100) {
            validation.score += 25;
        }
        
        // Content quality analysis
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0) {
            validation.issues.push('L\'avis doit contenir au moins une phrase complète');
            validation.isValid = false;
        } else {
            validation.score += 25;
        }
        
        // Spam detection (basic patterns)
        const spamPatterns = [
            /(.)\1{10,}/g, // Repeated characters
            /^[A-Z\s!]{50,}$/g, // All caps long text
            /(https?:\/\/|www\.)/gi // URLs
        ];
        
        let spamScore = 0;
        spamPatterns.forEach(pattern => {
            if (pattern.test(text)) spamScore++;
        });
        
        if (spamScore >= 2) {
            validation.issues.push('Contenu détecté comme spam potentiel');
            validation.isValid = false;
        } else {
            validation.score += 25;
        }
        
        // Rating consistency check
        const ratingNum = parseInt(rating);
        if (ratingNum <= 2 && text.toLowerCase().includes('excellent')) {
            validation.warnings.push('Note faible mais commentaire très positif - vérifiez la cohérence');
        } else if (ratingNum >= 4 && (text.toLowerCase().includes('terrible') || text.toLowerCase().includes('horrible'))) {
            validation.warnings.push('Note élevée mais commentaire négatif - vérifiez la cohérence');
        }
        
        // Comprehensive result
        validation.message = validation.isValid 
            ? `Avis valide (Score qualité: ${validation.score}/100)`
            : validation.issues.join(' • ');
            
        return validation;
        
    } catch (error) {
        console.error('❌ Content validation error:', error);
        return {
            isValid: false,
            message: 'Erreur lors de la validation du contenu',
            issues: ['Validation technique échouée'],
            warnings: [],
            score: 0
        };
    }
}

/**
 * Validates user permission to submit reviews
 * Implements business rules for review submission eligibility
 * 
 * @param {Object} user - Current user object
 * @param {string} placeId - Place identifier
 * @returns {Object} Permission validation result
 */
function validateUserReviewPermission(user, placeId) {
    try {
        const validation = {
            isValid: true,
            message: 'Permission accordée',
            restrictions: []
        };
        
        // Check if user has already reviewed this place
        const existingReviews = placesData[placeId]?.reviews || [];
        const userReviews = existingReviews.filter(review => 
            review.userId === user.email || 
            review.userId === user.id ||
            review.user === user.name
        );
        
        if (userReviews.length >= 3) {
            validation.isValid = false;
            validation.message = 'Limite de 3 avis par logement atteinte';
            validation.restrictions.push('MAX_REVIEWS_EXCEEDED');
        } else if (userReviews.length >= 1) {
            validation.restrictions.push('PREVIOUS_REVIEW_EXISTS');
            // Still allow, but add warning
        }
        
        // Check user account status
        if (!user.email || !user.name) {
            validation.isValid = false;
            validation.message = 'Profil utilisateur incomplet';
            validation.restrictions.push('INCOMPLETE_PROFILE');
        }
        
        // Role-based permissions
        if (user.role === 'admin') {
            validation.restrictions = []; // Admins can always review
            validation.isValid = true;
            validation.message = 'Privilèges administrateur - accès complet';
        }
        
        return validation;
        
    } catch (error) {
        console.error('❌ Permission validation error:', error);
        return {
            isValid: false,
            message: 'Erreur de vérification des permissions',
            restrictions: ['VALIDATION_ERROR']
        };
    }
}

/**
 * Generates a unique review ID with timestamp and random components
 * @returns {string} Unique review identifier
 */
function generateUniqueReviewId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `review_${timestamp}_${random}`;
}

/**
 * Generates a unique request ID for API tracking
 * @returns {string} Request identifier
 */
function generateRequestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `req_${timestamp}_${random}`;
}

/**
 * Performs comprehensive form cleanup after successful submission
 * @param {HTMLElement} form - Form element to clean
 */
function performFormCleanup(form) {
    try {
        if (!form) return;
        
        // Reset form fields
        form.reset();
        
        // Remove validation messages and counters
        const validationElements = form.querySelectorAll('.validation-error, .char-counter, .field-success');
        validationElements.forEach(element => element.remove());
        
        // Reset field styling
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.borderColor = '';
            input.classList.remove('error', 'success', 'warning');
        });
        
        // Reset focus to first field
        const firstInput = form.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        console.log('✅ Form cleanup completed');
        
    } catch (error) {
        console.error('❌ Form cleanup error:', error);
    }
}

/**
 * Generates contextual success message based on user and review data
 * @param {string} userName - User display name
 * @param {number} rating - Review rating
 * @param {string} reviewId - Review identifier
 * @returns {string} Formatted success message
 */
function generateSuccessMessage(userName, rating, reviewId) {
    const ratingText = '⭐'.repeat(parseInt(rating));
    const encouragements = [
        'Merci pour votre retour !',
        'Votre avis compte beaucoup !',
        'Contribution appréciée !',
        'Merci de partager votre expérience !'
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    return `✅ Avis publié par ${userName} • ${ratingText} • ${randomEncouragement} • ID: ${reviewId.split('_')[1]}`;
}

/**
 * Displays enhanced success message with professional styling and animations
 * @param {string} message - Success message to display
 */
function showEnhancedSuccessMessage(message) {
    try {
        // Remove any existing success messages
        const existingMessages = document.querySelectorAll('.success-message, .review-success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const successDiv = document.createElement('div');
        successDiv.className = 'review-success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <div class="success-text">${ValidationUtils.sanitizeString(message)}</div>
                <div class="success-actions">
                    <button class="success-close" onclick="this.parentElement.parentElement.parentElement.remove()" aria-label="Fermer">×</button>
                </div>
            </div>
        `;
        
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 1.2rem;
            border-radius: 12px;
            margin: 1rem 0;
            box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3);
            animation: slideInUp 0.6s ease-out;
            position: relative;
            overflow: hidden;
        `;
        
        // Add styles for inner elements
        const style = document.createElement('style');
        style.textContent = `
            .success-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .success-icon {
                font-size: 1.5rem;
                animation: bounce 2s infinite;
            }
            .success-text {
                flex: 1;
                font-weight: 500;
            }
            .success-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
            }
            .success-close:hover {
                background: rgba(255,255,255,0.3);
            }
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
        
        const reviewsSection = document.getElementById('reviews') || document.getElementById('add-review');
        if (reviewsSection) {
            reviewsSection.insertBefore(successDiv, reviewsSection.firstChild);
        }
        
        // Auto-removal with fade effect
        setTimeout(() => {
            successDiv.style.transition = 'opacity 0.5s ease-out';
            successDiv.style.opacity = '0';
            setTimeout(() => {
                successDiv.remove();
                style.remove();
            }, 500);
        }, 6000);
        
    } catch (error) {
        console.error('❌ Enhanced success message error:', error);
        // Fallback to simple message
        showSuccessMessage(message.replace(/[^\w\s\-.,!?⭐✅]/g, ''));
    }
}

/**
 * Displays advanced error messages with detailed information and recovery options
 * @param {string} message - Error message
 * @param {Object} options - Error display options
 */
function showAdvancedReviewError(message, options = {}) {
    try {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.review-error-message, .advanced-error-message');
        existingErrors.forEach(error => error.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'advanced-error-message';
        
        let retryButton = '';
        if (options.canRetry) {
            retryButton = `
                <button class="error-retry-btn" onclick="document.getElementById('review-form').querySelector('button[type=submit]').click()" 
                        style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; 
                               padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-top: 0.8rem;">
                    🔄 Réessayer
                </button>
            `;
        }
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <div class="error-header">
                    <span class="error-icon">⚠️</span>
                    <strong>Échec de l'envoi de l'avis</strong>
                </div>
                <p class="error-message">${ValidationUtils.sanitizeString(message)}</p>
                <div class="error-details">
                    <small>
                        ${options.errorCode ? `Code: ${options.errorCode} • ` : ''}
                        ${options.retryCount ? `Tentatives: ${options.retryCount} • ` : ''}
                        Heure: ${new Date().toLocaleTimeString('fr-FR')}
                    </small>
                </div>
                ${retryButton}
            </div>
        `;
        
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 1.2rem;
            border-radius: 12px;
            margin: 1rem 0;
            box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
            animation: shakeIn 0.6s ease-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            .error-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            .error-icon {
                font-size: 1.2rem;
            }
            .error-message {
                margin: 0.5rem 0;
                font-size: 1rem;
            }
            .error-details {
                opacity: 0.8;
                font-size: 0.8rem;
                margin-top: 0.5rem;
            }
            @keyframes shakeIn {
                0% { transform: translateX(-10px); opacity: 0; }
                25% { transform: translateX(10px); }
                50% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        const reviewSection = document.getElementById('reviews') || document.getElementById('add-review');
        if (reviewSection) {
            reviewSection.insertBefore(errorDiv, reviewSection.firstChild);
        }
        
        // Auto-removal
        setTimeout(() => {
            errorDiv.style.transition = 'opacity 0.5s ease-out';
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.remove();
                style.remove();
            }, 500);
        }, 8000);
        
    } catch (error) {
        console.error('❌ Advanced error display failed:', error);
        // Fallback to simple error
        showReviewError(message);
    }
}

/**
 * Updates place statistics after review submission
 * @param {string} placeId - Place identifier
 */
function updatePlaceStatistics(placeId) {
    try {
        const place = placesData[placeId];
        if (!place || !place.reviews) return;
        
        const reviews = place.reviews;
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
        
        // Update place object
        place.averageRating = averageRating;
        place.totalReviews = totalReviews;
        place.lastReviewDate = new Date().toISOString();
        
        // Update localStorage
        localStorage.setItem('placesData', JSON.stringify(placesData));
        
        console.log(`📊 Statistics updated for place ${placeId}: ${totalReviews} reviews, ${averageRating}⭐ average`);
        
    } catch (error) {
        console.error('❌ Statistics update error:', error);
    }
}

/**
 * Simulates sending notification about new review
 * @param {Object} review - Review object
 */
function sendReviewNotification(review) {
    try {
        // Simulate notification API call
        setTimeout(() => {
            console.log('📧 Review notification sent:', {
                type: 'new_review',
                placeId: review.placeId,
                reviewId: review.id,
                rating: review.rating,
                timestamp: review.timestamp
            });
        }, 1000);
        
    } catch (error) {
        console.error('❌ Notification sending error:', error);
    }
}

/**
 * Custom error classes for better error handling
 */
class ValidationError extends Error {
    constructor(name, userMessage, code = 400) {
        super(name);
        this.name = 'ValidationError';
        this.userMessage = userMessage;
        this.code = code;
    }
}

class APIError extends Error {
    constructor(name, userMessage, code = 500) {
        super(name);
        this.name = 'APIError';
        this.userMessage = userMessage;
        this.code = code;
    }
}

/**
 * Shows success message with professional styling
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    try {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: center;
            animation: fadeInUp 0.5s ease;
        `;
        successDiv.textContent = message;
        
        const reviewsSection = document.getElementById('reviews');
        reviewsSection.insertBefore(successDiv, reviewsSection.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    } catch (error) {
        console.error('❌ Success message display error:', error);
    }
}

// ==================== LOGIN PAGE MANAGEMENT ====================

/**
 * Initializes login form with professional real-time validation
 */
function initLoginForm() {
    try {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) {
            console.log('ℹ️ Login form not found on this page');
            return;
        }

        loginForm.addEventListener('submit', handleLogin);
        
        // Real-time validation setup
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateLoginEmail);
            emailInput.addEventListener('input', clearLoginValidation);
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', validateLoginPassword);
            passwordInput.addEventListener('input', clearLoginValidation);
        }
        
        // Demo accounts setup
        initDemoAccounts();
        
        console.log('✅ Login form initialized with real-time validation');
        
    } catch (error) {
        console.error('❌ Login form initialization error:', error);
    }
}

/**
 * Initializes clickable demo accounts for easy testing
 */
function initDemoAccounts() {
    try {
        const demoAccounts = document.querySelectorAll('.demo-account');
        demoAccounts.forEach(account => {
            account.addEventListener('click', function() {
                const email = this.dataset.email || this.querySelector('.demo-info strong')?.textContent.toLowerCase();
                const isAdmin = this.classList.contains('admin');
                const password = isAdmin ? 'admin' : 'password';
                
                // Auto-fill form fields
                const emailInput = document.getElementById('email');
                const passwordInput = document.getElementById('password');
                
                if (emailInput && passwordInput) {
                    emailInput.value = email;
                    passwordInput.value = password;
                    
                    // Visual feedback
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                    
                    console.log('👤 Demo account selected:', email);
                }
            });
        });
        
        console.log('✅ Demo accounts initialized:', demoAccounts.length, 'accounts');
    } catch (error) {
        console.error('❌ Demo accounts initialization error:', error);
    }
}

/**
 * Email validation on blur
 * @param {Event} event - Blur event
 */
function validateLoginEmail(event) {
    try {
        const emailInput = event.target;
        const email = emailInput.value.trim();
        
        if (email.length === 0) return; // Don't validate empty field
        
        const validation = ValidationUtils.validateEmail(email);
        showInputValidation(emailInput, validation);
        
    } catch (error) {
        console.error('❌ Login email validation error:', error);
    }
}

/**
 * Password validation on blur
 * @param {Event} event - Blur event
 */
function validateLoginPassword(event) {
    try {
        const passwordInput = event.target;
        const password = passwordInput.value;
        
        if (password.length === 0) return; // Don't validate empty field
        
        const validation = ValidationUtils.validatePassword(password);
        showInputValidation(passwordInput, validation);
        
    } catch (error) {
        console.error('❌ Login password validation error:', error);
    }
}

/**
 * Shows input validation feedback
 * @param {HTMLElement} input - Input element
 * @param {Object} validation - Validation result
 */
function showInputValidation(input, validation) {
    try {
        // Remove existing validation messages
        const existingError = input.parentNode.querySelector('.field-validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (!validation.isValid) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'field-validation-error';
            errorSpan.textContent = validation.message;
            errorSpan.style.cssText = `
                color: #e74c3c;
                font-size: 0.8rem;
                display: block;
                margin-top: 0.5rem;
                margin-left: 1rem;
            `;
            input.parentNode.appendChild(errorSpan);
            input.style.borderColor = '#e74c3c';
        } else {
            input.style.borderColor = '#27ae60';
        }
        
    } catch (error) {
        console.error('❌ Input validation display error:', error);
    }
}

/**
 * Clears validation on input
 * @param {Event} event - Input event
 */
function clearLoginValidation(event) {
    try {
        const input = event.target;
        const existingError = input.parentNode.querySelector('.field-validation-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    } catch (error) {
        console.error('❌ Validation clearing error:', error);
    }
}

/**
 * Handles login form submission with professional state management
 * @param {Event} e - Submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;
        
        // Clear previous errors
        const existingError = document.getElementById('error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Attempt login with comprehensive error handling
        const success = await login(email, password);
        
        if (success) {
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('❌ Login handling error:', error);
        showLoginError('Erreur technique lors de la connexion');
    }
}

// ==================== APPLICATION INITIALIZATION ====================

/**
 * Professional application initialization with comprehensive error handling
 * This is the main entry point that sets up the entire application
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 HBnB Application initialization started...');
        
        // Load saved data with error recovery
        try {
            const savedData = localStorage.getItem('placesData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData && typeof parsedData === 'object') {
                    Object.assign(placesData, parsedData);
                    console.log('✅ Places data loaded from localStorage');
                } else {
                    console.warn('⚠️ Invalid localStorage data, using defaults');
                }
            }
        } catch (storageError) {
            console.error('❌ localStorage error:', storageError);
            localStorage.removeItem('placesData'); // Clean corrupted data
        }
        
        // Authentication check
        checkAuth();
        
        // Page-specific initialization
        const currentPath = window.location.pathname;
        console.log('📍 Current page:', currentPath);
        
        if (currentPath.includes('place.html')) {
            console.log('🏠 Initializing place details page...');
            initPlacePage();
        } else if (currentPath.includes('login.html')) {
            console.log('🔐 Initializing login page...');
            initLoginForm();
        } else {
            console.log('🏡 Initializing home page...');
            initHomePage();
        }
        
        // Add dynamic styles for professional UI
        addLoadingStyles();
        
        console.log('✅ Application initialized successfully');
        console.log('📊 Performance metrics:', {
            placesCount: Object.keys(placesData).length,
            currentUser: currentUser ? currentUser.email : 'Not logged in',
            appState: currentState,
            apiCalls: apiCallsCount
        });
        
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        showCriticalError('Erreur critique lors du chargement de l\'application');
    }
});

/**
 * Initializes home page functionality with API loading and price filtering
 */
async function initHomePage() {
    try {
        // Initialize price filter (primary filtering method)
        initPriceFilter();
        
        // Load places from API
        await loadPlacesFromAPI();
        
        console.log('✅ Home page initialized with API integration and price filtering');
    } catch (error) {
        console.error('❌ Home page initialization error:', error);
    }
}

/**
 * Initializes place page functionality
 */
function initPlacePage() {
    try {
        loadPlaceDetails();
        initReviewForm();
        console.log('✅ Place page initialized');
    } catch (error) {
        console.error('❌ Place page initialization error:', error);
    }
}

/**
 * Adds professional CSS styles dynamically for loading states and animations
 */
function addLoadingStyles() {
    try {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Professional Loading States */
            .loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                color: #b48cff;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(180, 140, 255, 0.3);
                border-top: 3px solid #b48cff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-message {
                font-size: 0.9rem;
                color: #b48cff;
                margin: 0;
            }
            
            .loading-state {
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .success-state {
                background: rgba(39, 174, 96, 0.1);
                border: 1px solid rgba(39, 174, 96, 0.3);
                border-radius: 8px;
                padding: 1rem;
            }
            
            .error-state {
                background: rgba(231, 76, 60, 0.1);
                border: 1px solid rgba(231, 76, 60, 0.3);
                border-radius: 8px;
                padding: 1rem;
            }
            
            .success-indicator, .error-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .success-icon, .error-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            /* Animations */
            .validation-error, .field-validation-error {
                animation: slideInDown 0.3s ease;
            }
            
            @keyframes slideInDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .filter-indicator {
                animation: fadeInUp 0.3s ease;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .char-counter {
                transition: color 0.3s ease;
            }
            
            .demo-account {
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .demo-account:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .demo-account:active {
                transform: scale(0.98);
            }
            
            /* Professional styling for admin badges */
            .admin-badge {
                background: linear-gradient(45deg, #f39c12, #e67e22);
                color: white;
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
                border-radius: 12px;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(styleSheet);
        console.log('✅ Professional styles added');
        
    } catch (error) {
        console.error('❌ Styles addition error:', error);
    }
}

/**
 * Shows critical application error with recovery options
 * @param {string} message - Critical error message
 */
function showCriticalError(message) {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                max-width: 400px;
            ">
                <h2 style="margin: 0 0 1rem 0;">❌ Erreur Critique</h2>
                <p style="margin: 0 0 1rem 0;">${ValidationUtils.sanitizeString(message)}</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #e74c3c;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    margin: 0.5rem;
                ">🔄 Recharger</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                    padding: 0.8rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    margin: 0.5rem;
                ">❌ Fermer</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    } catch (error) {
        console.error('❌ Critical error display failed:', error);
        // Ultimate fallback
        alert('Erreur critique de l\'application. Veuillez recharger la page.');
    }
}

// ==================== GLOBAL EXPORTS ====================

/**
 * Export essential functions to global scope for HTML onclick handlers
 * This ensures backward compatibility while maintaining modular architecture
 */
window.logout = logout;