/**
 * Extracts a cookie value by name from document.cookie
 * @param {string} name - Cookie name to retrieve
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Extracts place ID from URL search parameters
 * @returns {string|null} Place ID from ?id= parameter
 */
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Validates user authentication for review operations
 * Redirects to home page if user is not authenticated
 * @returns {string|null} JWT token if authenticated
 */
function checkAuthenticationForReview() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

/**
 * Updates UI based on authentication status
 * Toggles login/logout button visibility and fetches places data
 * @returns {string|null} JWT token if authenticated
 */
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');
    
    if (loginLink && logoutButton) {
        if (token) {
            loginLink.style.display = 'none';
            logoutButton.style.display = 'block';
        } else {
            loginLink.style.display = 'block';
            logoutButton.style.display = 'none';
        }
    }
    
    // Fetch places data only on index page when authenticated
    // Always fetch places data on the index page (listing is public)
    if (document.getElementById('places-list')) {
        fetchPlaces(token);
    }
    return token;
}


/**
 * Decode a JWT (no verification) to access payload fields like is_admin
 */
function parseJwt(token) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
        return null;
    }
}

/**
 * Returns true if current cookie token has is_admin claim
 */
function isTokenAdmin() {
    const token = getCookie('token');
    if (!token) return false;
    const payload = parseJwt(token);
    return payload && payload.is_admin === true;
}


/**
 * Controls review form visibility based on authentication
 * Shows form to authenticated users, login prompt to others
 * @returns {string|null} JWT token if authenticated
 */
function checkAuthenticationForReviewForm() {
    const token = getCookie('token');
    const reviewSection = document.querySelector('.add-review');
    const loginMessage = document.getElementById('login-message');
    
    if (reviewSection) {
        if (token) {
            // Show review form for authenticated users
            reviewSection.style.display = 'block';
            if (loginMessage) {
                loginMessage.style.display = 'none';
            }
        } else {
            // Hide form and show login prompt for unauthenticated users
            reviewSection.style.display = 'none';
            if (!loginMessage) {
                // Create login prompt message
                const messageDiv = document.createElement('div');
                messageDiv.id = 'login-message';
                messageDiv.className = 'add-review';
                messageDiv.innerHTML = `
                    <h2>Add a Review</h2>
                    <p>You must be logged in to submit a review.</p>
                    <a href="login.html" class="details-button">Login</a>
                `;
                reviewSection.parentNode.insertBefore(messageDiv, reviewSection.nextSibling);
            } else {
                loginMessage.style.display = 'block';
            }
        }
    }
    
    return token;
}

/**
 * Fetches places data from API and renders them
 * @param {string} token - JWT authentication token
 */
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            // Accept different response shapes: array or { value: [...], Count: n }
            const places = Array.isArray(data) ? data : (data.value || data.places || []);
            displayPlaces(places);
        } else {
            document.getElementById('places-list').innerHTML = '<p>Error loading places.</p>';
        }
    } catch (error) {
        document.getElementById('places-list').innerHTML = '<p>API connection error.</p>';
    }
}

/**
 * Renders places list in the DOM
 * @param {Array} places - Array of place objects from API
 */
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';
    // Render each place immediately (no await inside loop)
    const token = getCookie('token');
    places.forEach((place) => {
        const placeDiv = document.createElement('div');
        placeDiv.className = 'place-card';
        // Ensure data-price is a numeric string (or empty)
        const priceVal = (place && (place.price || place.price === 0)) ? Number(place.price) : NaN;
        placeDiv.setAttribute('data-price', isNaN(priceVal) ? '' : String(priceVal));

        // Insert basic card with placeholder for amenities
        placeDiv.innerHTML = `
            <img src="/images/appart.jpg" alt="${place.title}" class="place-image">
            <h3>${place.title}</h3>
            <p>${place.description}</p>
            <p>Location: ${place.latitude || ''}, ${place.longitude || ''}</p>
            <p class="place-price">Price: ${place.price} €</p>
            <p class="place-amenities">Amenities: Loading...</p>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
        `;
        placesList.appendChild(placeDiv);

        // Add a small visible badge showing the data-price (helps debugging/visual proof)
        const badge = document.createElement('span');
        badge.className = 'price-badge';
        badge.textContent = isNaN(priceVal) ? '' : `${priceVal} €`;
        const priceEl = placeDiv.querySelector('.place-price');
        if (priceEl) priceEl.appendChild(badge);

        // Fetch amenities asynchronously and update the card when ready
        if (place.amenities && Array.isArray(place.amenities) && place.amenities.length > 0) {
            fetchAmenitiesNames(token, place.amenities).then(amenityNames => {
                const el = placeDiv.querySelector('.place-amenities');
                if (!el) return;
                if (amenityNames.length > 0) {
                    let display = amenityNames.slice(0, 3).join(', ');
                    if (amenityNames.length > 3) display += ` (+${amenityNames.length - 3} more)`;
                    el.textContent = `Amenities: ${display}`;
                } else {
                    el.textContent = 'Amenities: None';
                }
            }).catch(() => {
                const el = placeDiv.querySelector('.place-amenities');
                if (el) el.textContent = 'Amenities: None';
            });
        } else {
            const el = placeDiv.querySelector('.place-amenities');
            if (el) el.textContent = 'Amenities: None';
        }

        // If current user is admin, show admin controls for the place
        if (isTokenAdmin()) {
            const adminControls = document.createElement('div');
            adminControls.style.marginTop = '8px';
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Supprimer la place';
            delBtn.className = 'btn';
            delBtn.style.background = 'var(--accent-red)';
            delBtn.addEventListener('click', async () => {
                if (!confirm('Supprimer cette place ?')) return;
                const ok = await deletePlace(place.id);
                if (ok) {
                    placeDiv.remove();
                } else {
                    alert('Erreur suppression place');
                }
            });
            adminControls.appendChild(delBtn);
            placeDiv.appendChild(adminControls);
        }
    });

    // Apply current price filter after all cards have been appended
    applyPriceFilter();
}

/**
 * Apply the price filter to currently rendered place cards.
 * Uses the `#price-filter` select value ('all' or numeric) to hide/show cards.
 */
function applyPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;
    const selected = String(priceFilter.value || 'all').toLowerCase();
    // Update active filter label
    setActiveFilterLabel(selected);
    console.debug('applyPriceFilter -> selected:', selected);
    document.querySelectorAll('.place-card').forEach(card => {
        const priceAttr = card.getAttribute('data-price');
        const price = priceAttr === null || priceAttr === '' ? NaN : parseFloat(priceAttr);
        console.debug(' card', card, 'data-price=', priceAttr, 'parsed=', price);
        // If 'all' selected show everything
        if (selected === 'all' || isNaN(parseFloat(selected))) {
            // Reset display to default (allow CSS grid to manage layout)
            card.style.display = '';
            return;
        }
        const required = parseFloat(selected);
        // Strict equality: show only when price exactly equals the selected value
        if (!isNaN(price) && price === required) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Update the visible active filter label element
 * @param {string} selected - currently selected filter value
 */
function setActiveFilterLabel(selected) {
    const el = document.getElementById('active-filter');
    if (!el) return;
    if (!selected || selected === 'all') {
        el.textContent = 'Filtre actif: All';
    } else {
        el.textContent = `Filtre actif: ${selected} €`;
    }
}

/**
 * Initializes price filter dropdown and adds event handler
 * Filters places by maximum price threshold
 */
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter && priceFilter.options.length === 0) {
        ['all', 10, 50, 100].forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = (val === 'all') ? 'All' : String(val);
            if (val === 'all') opt.selected = true;
            priceFilter.appendChild(opt);
        });
    }
    if (priceFilter) {
        // Use centralized filter application to avoid duplicate logic
        priceFilter.addEventListener('change', () => {
            applyPriceFilter();
        });
    }
}


/**
 * Authenticates user with email/password credentials
 * Stores JWT token in cookies and redirects on success
 * @param {string} email - User email address
 * @param {string} password - User password
 */
async function loginUser(email, password) {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html';
    } else {
        // Display detailed error message from API response
        try {
            const errorData = await response.json();
            alert('Login failed: ' + (errorData.error || 'Unknown error'));
        } catch (parseError) {
            // Fallback to HTTP status text
            alert('Login failed: ' + response.statusText);
        }
    }
}

/**
 * Registers a new user by POSTing to the users endpoint.
 * On success stores JWT token in cookie `token` and redirects to index.
 */
async function registerUser(first_name, last_name, email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/v1/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name, last_name, email, password })
        });
        if (response.ok) {
            const data = await response.json();
            // API returns access_token on successful registration (backend seed supports this)
            const token = data.access_token || (data && data.token) || null;
            if (token) {
                document.cookie = `token=${token}; path=/`;
                window.location.href = 'index.html';
                return;
            }
            // Fallback: attempt to login automatically
            await loginUser(email, password);
        } else {
            try {
                const err = await response.json();
                alert('Registration failed: ' + (err.error || err.message || 'Unknown error'));
            } catch (parseErr) {
                alert('Registration failed: ' + response.statusText);
            }
        }
    } catch (error) {
        alert('API connection error during registration');
    }
}

/**
 * Fetches and displays detailed information for a specific place
 * @param {string} token - JWT authentication token
 * @param {string} placeId - Unique place identifier
 */
async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            document.querySelector('.place-details').innerHTML = '<p>Error loading place details.</p>';
        }
    } catch (error) {
        document.querySelector('.place-details').innerHTML = '<p>API connection error.</p>';
    }
}

/**
 * Retrieves owner's full name from user API
 * @param {string} token - JWT authentication token
 * @param {string} ownerId - User ID of the place owner
 * @returns {Promise<string>} Owner's full name or 'Unknown'
 */
async function fetchOwnerDetails(token, ownerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/users/${ownerId}`, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
            const owner = await response.json();
            return `${owner.first_name} ${owner.last_name}`;
        }
    } catch (error) {
        console.error('Error fetching owner details:', error);
    }
    return 'Unknown';
}

/**
 * Fetches all reviews and filters by place ID
 * @param {string} token - JWT authentication token
 * @param {string} placeId - Place identifier to filter reviews
 * @returns {Promise<Array>} Array of review objects for the place
 */
async function fetchPlaceReviews(token, placeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/reviews`, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
            const allReviews = await response.json();
            // Filter reviews for this specific place
            return allReviews.filter(review => review.place_id === placeId);
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
    return [];
}

/**
 * Retrieves user's full name for review attribution
 * @param {string} token - JWT authentication token
 * @param {string} userId - User identifier
 * @returns {Promise<string>} User's full name or 'Unknown User'
 */
async function fetchUserDetails(token, userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/users/${userId}`, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
            const user = await response.json();
            return `${user.first_name} ${user.last_name}`;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
    return 'Unknown User';
}

/**
 * Fetches amenity details by ID
 * @param {string} token - JWT authentication token
 * @param {string} amenityId - Amenity identifier
 * @returns {Promise<string>} Amenity name or 'Unknown'
 */
async function fetchAmenityDetails(token, amenityId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/amenities/${amenityId}`, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
            const amenity = await response.json();
            return amenity.name || 'Unknown';
        } else {
            console.error(`Failed to fetch amenity ${amenityId}:`, response.status);
        }
    } catch (error) {
        console.error('Error fetching amenity details:', error);
    }
    return 'Unknown';
}

/**
 * Fetches names for a list of amenity IDs
 * @param {string} token - JWT authentication token
 * @param {Array} amenityIds - Array of amenity IDs
 * @returns {Promise<Array>} Array of amenity names
 */
async function fetchAmenitiesNames(token, amenityIds) {
    // Handle null, undefined, empty array, or non-array cases
    if (!amenityIds || !Array.isArray(amenityIds) || amenityIds.length === 0) {
        return [];
    }
    
    console.log('Fetching amenities for IDs:', amenityIds); // Debug log
    
    try {
        const amenityNames = await Promise.all(
            amenityIds.map(id => fetchAmenityDetails(token, id))
        );
        
        console.log('Retrieved amenity names:', amenityNames); // Debug log
        
        // Filter out 'Unknown' amenities to avoid displaying them
        const validAmenities = amenityNames.filter(name => name !== 'Unknown' && name !== null);
        
        return validAmenities;
    } catch (error) {
        console.error('Error fetching amenities names:', error);
        return [];
    }
}

/**
 * Renders reviews section with user names and ratings
 * @param {string} token - JWT authentication token
 * @param {string} placeId - Place identifier for reviews
 */
async function displayReviews(token, placeId) {
    const reviewsSection = document.querySelector('.reviews');
    if (reviewsSection) {
        reviewsSection.innerHTML = '<p>Loading reviews...</p>';
        
        const reviews = await fetchPlaceReviews(token, placeId);
        reviewsSection.innerHTML = '';
        
        if (reviews && reviews.length > 0) {
            for (const review of reviews) {
                const userName = await fetchUserDetails(token, review.user_id);
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'review-card';
                reviewDiv.innerHTML = `
                    <p>${review.text}</p>
                    <p>User: ${userName}</p>
                    <p>Rating: ${review.rating}/5</p>
                `;
                // If admin, add delete button to each review
                if (isTokenAdmin()) {
                    const del = document.createElement('button');
                    del.textContent = 'Supprimer';
                    del.style.marginTop = '8px';
                    del.className = 'btn';
                    del.style.background = 'var(--accent-red)';
                    del.addEventListener('click', async () => {
                        if (!confirm('Supprimer cet avis ?')) return;
                        const ok = await deleteReview(review.id);
                        if (ok) {
                            reviewDiv.remove();
                        } else {
                            alert('Erreur lors de la suppression');
                        }
                    });
                    reviewDiv.appendChild(del);
                }

                reviewsSection.appendChild(reviewDiv);
            }
        } else {
            reviewsSection.innerHTML = '<p>No reviews yet.</p>';
        }
    }
}

/**
 * Renders place details including owner info, amenities, and reviews
 * @param {Object} place - Place object from API
 */
async function displayPlaceDetails(place) {
    const detailsSection = document.querySelector('.place-details');
    if (detailsSection) {
        // Fetch owner information for display
        const token = getCookie('token');
        const ownerName = place.owner_id ? await fetchOwnerDetails(token, place.owner_id) : 'Unknown';
        
        console.log('Place object:', place); // Debug log
        console.log('Place amenities:', place.amenities); // Debug log
        
        // Enhanced amenities handling
        let amenitiesDisplay = 'None';
        
        if (place.amenities && Array.isArray(place.amenities) && place.amenities.length > 0) {
            const amenityNames = await fetchAmenitiesNames(token, place.amenities);
            amenitiesDisplay = amenityNames.length > 0 ? amenityNames.join(', ') : 'None';
        } else if (place.amenities && !Array.isArray(place.amenities)) {
            console.warn('Amenities is not an array:', place.amenities);
            amenitiesDisplay = 'Invalid amenities format';
        }
        
        detailsSection.innerHTML = `
            <img src="/images/appart.jpg" alt="${place.title}" class="place-image">
            <h2>${place.title}</h2>
            <div class="place-info">
                <p>Host: ${ownerName}</p>
                <p>Price per night: ${place.price} €</p>
                <p>Description: ${place.description}</p>
                <p>Location: ${place.latitude}, ${place.longitude}</p>
                <p>Amenities: ${amenitiesDisplay}</p>
            </div>
        `;
    }

    // Load and display reviews for this place
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();
    await displayReviews(token, placeId);
}

/**
 * Renders place information for review submission page
 * @param {Object} place - Place object from API
 */
async function displayPlaceInfoForReview(place) {
    const placeInfoSection = document.getElementById('place-info');
    if (placeInfoSection) {
        placeInfoSection.innerHTML = `
            <h2>Reviewing: ${place.title}</h2>
            <div class="place-info">
                <p>Price per night: ${place.price} €</p>
                <p>Description: ${place.description}</p>
            </div>
        `;
    }
}

/**
 * Submits a new review to the API
 * @param {string} token - JWT authentication token
 * @param {string} placeId - Place identifier for the review
 * @param {string} reviewText - Review content text
 * @param {number} rating - Numeric rating (1-5)
 */
async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: reviewText,
                rating: parseInt(rating),
                place_id: placeId
                // user_id is extracted from JWT token on backend
            })
        });
        await handleReviewResponse(response);
    } catch (error) {
        alert('API connection error');
    }
}

/**
 * Processes review submission response and handles UI updates
 * @param {Response} response - Fetch API response object
 */
async function handleReviewResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
        // Navigate back to place details page
        const placeId = getPlaceIdFromURL();
        if (placeId) {
            window.location.href = `place.html?id=${placeId}`;
        }
    } else {
        try {
            const errorData = await response.json();
            // Check for different possible error message formats
            const errorMessage = errorData.message || errorData.error || errorData.description || 'Unknown error';
            alert('Failed to submit review: ' + errorMessage);
        } catch (parseError) {
            // Fallback if JSON parsing fails
            alert('Failed to submit review: ' + response.statusText);
        }
    }
}

/**
 * Clears authentication token and refreshes the page
 */
function logout() {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.reload();
}

/**
 * Main application initialization when DOM is loaded
 * Handles page-specific functionality and event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication state across all pages
    checkAuthentication();

    // Login page functionality
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }

    // Register page functionality
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const first_name = document.getElementById('first_name').value;
            const last_name = document.getElementById('last_name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!first_name || !last_name || !email || !password) {
                alert('Veuillez remplir tous les champs.');
                return;
            }

            await registerUser(first_name, last_name, email, password);
        });
    }

    // Index page: places list and price filtering
    if (document.getElementById('places-list')) {
        setupPriceFilter();
        fetchPlaces(getCookie('token'));
        // Refresh button to re-fetch places and reapply filters
        const refreshBtn = document.getElementById('refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fetchPlaces(getCookie('token'));
            });
        }
    }

    // Place details page: show place info and reviews
    if (document.querySelector('.place-details')) {
        const placeId = getPlaceIdFromURL();
        const token = getCookie('token');
        fetchPlaceDetails(token, placeId);
        
        // Control review form visibility based on auth status
        checkAuthenticationForReviewForm();
    }

    // Add review page: authentication-protected functionality
    if (window.location.pathname.includes('add_review.html')) {
        // Ensure user is authenticated, redirect if not
        const token = checkAuthenticationForReview();
        const placeId = getPlaceIdFromURL();
        
        if (!placeId) {
            alert('No place ID provided. Redirecting to home page.');
            window.location.href = 'index.html';
            return;
        }
        
        // Load place information for context
        fetchPlaceDetails(token, placeId).then(() => {
            const placeDetailsSection = document.querySelector('.place-details');
            if (placeDetailsSection) {
                // Transfer content to review page layout
                const placeInfoSection = document.getElementById('place-info');
                if (placeInfoSection) {
                    placeInfoSection.innerHTML = placeDetailsSection.innerHTML;
                }
            }
        });
    }

    // (admin page UI removed — admin controls are inline on existing pages)

    // Review form submission (works on both place.html and add_review.html)
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        const placeId = getPlaceIdFromURL();
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Security check: verify authentication at submission time
            const token = getCookie('token');
            if (!token) {
                alert('You must be logged in to submit a review. Redirecting to login page...');
                window.location.href = 'login.html';
                return;
            }
            
            if (!placeId) {
                alert('No place ID provided.');
                return;
            }
            
            const reviewText = document.getElementById('review-text').value;
            const rating = document.getElementById('rating').value;

            // Prevent double submission by disabling the submit button
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi...';
            }
            
            if (!reviewText || !rating) {
                alert('Please fill in all fields.');
                return;
            }
            
            await submitReview(token, placeId, reviewText, rating);

            // Re-enable submit button after attempt (UI will navigate on success)
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer';
            }
        });
    }

    // Logout button functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    // reflect admin controls (inline) on load
});

// Admin user controls implemented inline; admin-specific page functions removed.

/**
 * Delete review (admin action)
 */
async function deleteReview(reviewId) {
    try {
        const token = getCookie('token');
        const res = await fetch(`http://127.0.0.1:5000/api/v1/reviews/${reviewId}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        return res.ok;
    } catch (e) { return false; }
}

/**
 * Delete place (admin action)
 */
async function deletePlace(placeId) {
    try {
        const token = getCookie('token');
        const res = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        return res.ok;
    } catch (e) { return false; }
}