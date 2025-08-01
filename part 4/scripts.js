/* 
  HBnB JavaScript
*/

let connected = false;
let currentUser = '';

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const accounts = {
        'demo@hbnb.com': 'demo123',
        'test@hbnb.com': 'test123',
        'user@hbnb.com': 'user123'
    };
    
    if (accounts[email] && accounts[email] === password) {
        connected = true;
        currentUser = email.split('@')[0];
        
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('user-info').style.display = 'inline';
        document.getElementById('username').textContent = currentUser;
        
        addCommentButtons();
        
        alert('Connecté ! Vous pouvez maintenant commenter.');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        alert('Mauvais identifiants');
    }
}

function logout() {
    connected = false;
    currentUser = '';
    
    document.getElementById('login-btn').style.display = 'inline';
    document.getElementById('user-info').style.display = 'none';
    
    removeCommentButtons();
    
    alert('Déconnecté');
}

function addCommentButtons() {
    const placeCards = document.querySelectorAll('.place-card');
    placeCards.forEach((card, index) => {
        if (!card.querySelector('.comment-btn')) {
            const btn = document.createElement('button');
            btn.textContent = '💬 Commenter';
            btn.className = 'comment-btn';
            btn.onclick = () => showCommentForm(card, index);
            card.appendChild(btn);
        }
    });
}

function removeCommentButtons() {
    document.querySelectorAll('.comment-btn').forEach(btn => btn.remove());
    document.querySelectorAll('.comment-form').forEach(form => form.remove());
}

function showCommentForm(card, placeIndex) {
    const oldForm = card.querySelector('.comment-form');
    if (oldForm) {
        oldForm.remove();
        return;
    }
    
    const form = document.createElement('div');
    form.className = 'comment-form';
    form.style.cssText = 'background: #444; padding: 15px; margin: 10px 0; border-radius: 5px;';
    
    form.innerHTML = `
        <h4>Ajouter un commentaire</h4>
        <textarea placeholder="Votre commentaire..." style="width: 100%; height: 60px; margin: 5px 0;"></textarea>
        <div>
            Note: 
            <select style="margin: 5px;">
                <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                <option value="4">⭐⭐⭐⭐ 4/5</option>
                <option value="3">⭐⭐⭐ 3/5</option>
                <option value="2">⭐⭐ 2/5</option>
                <option value="1">⭐ 1/5</option>
            </select>
        </div>
        <button onclick="submitComment(this, ${placeIndex})">Publier</button>
        <button onclick="this.parentElement.remove()">Annuler</button>
    `;
    
    card.appendChild(form);
}

function submitComment(button, placeIndex) {
    const form = button.parentElement;
    const textarea = form.querySelector('textarea');
    const select = form.querySelector('select');
    
    const comment = textarea.value.trim();
    const rating = select.value;
    
    if (!comment) {
        alert('Écrivez un commentaire !');
        return;
    }
    
    const commentDiv = document.createElement('div');
    commentDiv.style.cssText = 'background: #2a5298; padding: 10px; margin: 10px 0; border-radius: 5px; color: white;';
    commentDiv.innerHTML = `
        <strong>${currentUser}</strong> - ${'⭐'.repeat(rating)}
        <p>${comment}</p>
        <small>À l'instant</small>
    `;
    
    form.parentElement.insertBefore(commentDiv, form);
    form.remove();
    
    alert('Commentaire publié !');
}

const placesData = {
    'logement-occasion': {
        name: 'Logement d\'Occasion',
        host: 'juna Lartego',
        price: '$50 / nuit',
        mainImage: 'https://cdn.generationvoyage.fr/2022/02/logement-2-1.png',
        galleryImages: [
            'https://cdn.generationvoyage.fr/2022/02/logement-2-1.png',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Logement confortable et abordable, parfait pour un séjour économique sans compromis sur le confort. Excellent rapport qualité-prix dans un cadre agréable avec tous les équipements nécessaires.',
        amenities: ['WiFi gratuit', 'Cuisine équipée', 'Parking gratuit', 'Lave-linge', 'Balcon', 'Proximité commerces'],
        reviews: [
            { comment: 'Très bon rapport qualité-prix ! Logement propre et bien situé.', user: 'Harry Kane', rating: '★★★★☆ 4/5' },
            { comment: 'Parfait pour un budget serré, je recommande vivement !', user: 'Sané Leroy', rating: '★★★★☆ 4/5' }
        ]
    },
    'appartement-ville': {
        name: 'Appartement en Ville',
        host: 'Laurent Leblanc',
        price: '$50 / nuit',
        mainImage: 'https://cdn.generationvoyage.fr/2022/02/logement-7-1.png',
        galleryImages: [
            'https://cdn.generationvoyage.fr/2022/02/logement-7-1.png',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Logement moderne au cœur de la ville, proche de tous les commerces. Parfait pour explorer la ville à pied et profiter de tous les services urbains.',
        amenities: ['WiFi haut débit', 'Cuisine moderne', 'Balcon', 'Climatisation', 'Parking', 'Transports en commun'],
        reviews: [
            { comment: 'Emplacement parfait en centre-ville ! Tout à portée de main.', user: 'William Rousseau', rating: '★★★★★ 5/5' },
            { comment: 'Appartement moderne et bien situé, parfait pour un séjour urbain.', user: 'Tapis Bernard', rating: '★★★★☆ 4/5' }
        ]
    },
    'studio-building': {
        name: 'Studio dans un Building',
        host: 'Anna Kowalski',
        price: '$100 / nuit',
        mainImage: 'https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0',
        galleryImages: [
            'https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Studio élégant dans un immeuble moderne avec toutes les commodités. Design contemporain et équipements haut de gamme pour un séjour confortable.',
        amenities: ['WiFi fibre', 'Salle de sport', 'Concierge', 'Terrasse commune', 'Sécurité 24h/24', 'Ascenseur'],
        reviews: [
            { comment: 'Studio moderne et bien équipé ! Le building est magnifique.', user: 'James Lebrun', rating: '★★★★☆ 4/5' },
            { comment: 'Parfait pour un séjour d\'affaires, très professionnel.', user: 'Jackson Michel', rating: '★★★★★ 5/5' }
        ]
    },
    'logement-naturel': {
        name: 'Logement Naturel',
        host: 'Notthigham Forest',
        price: '$100 / nuit',
        mainImage: 'https://offloadmedia.feverup.com/lyonsecret.com/wp-content/uploads/2021/06/29070343/shutterstock_1531738394-1-1024x683.jpg',
        galleryImages: [
            'https://offloadmedia.feverup.com/lyonsecret.com/wp-content/uploads/2021/06/29070343/shutterstock_1531738394-1-1024x683.jpg',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Échappez-vous dans ce logement en pleine nature, calme et ressourçant. Parfait pour se déconnecter du stress urbain et retrouver la sérénité.',
        amenities: ['Vue panoramique', 'Cheminée', 'Jardin privé', 'Barbecue', 'Randonnées à proximité', 'Air pur'],
        reviews: [
            { comment: 'Cadre magnifique, très reposant ! La nature à perte de vue.', user: 'Gérard Moreau', rating: '★★★★★ 5/5' },
            { comment: 'Parfait pour une déconnexion totale, je recommande vivement.', user: 'Thomas Verdier', rating: '★★★★★ 5/5' }
        ]
    },
    'logement-luxe': {
        name: 'Logement de Luxe',
        host: 'Raheem Sterling',
        price: '$200 / nuit',
        mainImage: 'https://th.bing.com/th/id/R.71168989b965ab7a44303873f6d662e1?rik=Qan76jaH30nDSw&pid=ImgRaw&r=0',
        galleryImages: [
            'https://th.bing.com/th/id/R.71168989b965ab7a44303873f6d662e1?rik=Qan76jaH30nDSw&pid=ImgRaw&r=0',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Expérience haut de gamme dans ce logement luxueux avec services premium. Le summum du raffinement et de l\'élégance pour un séjour d\'exception.',
        amenities: ['Conciergerie', 'Spa privé', 'Chef à domicile', 'Chauffeur', 'Service premium 24h/24', 'Vue panoramique'],
        reviews: [
            { comment: 'Service exceptionnel, luxe absolu ! Une expérience inoubliable.', user: 'Kevin Durand', rating: '★★★★★ 5/5' },
            { comment: 'Le summum du raffinement, tout était parfait.', user: 'Ousmane Dembélé', rating: '★★★★★ 5/5' }
        ]
    },
    'logement-atypique': {
        name: 'Logement Atypique',
        host: 'Kylian Mbappé',
        price: '$200 / nuit',
        mainImage: 'https://th.bing.com/th/id/R.a9f34fe1621bc5b434560f2108eea67c?rik=35e6%2fBt8noSMEA&pid=ImgRaw&r=0',
        galleryImages: [
            'https://th.bing.com/th/id/R.a9f34fe1621bc5b434560f2108eea67c?rik=35e6%2fBt8noSMEA&pid=ImgRaw&r=0',
            'https://cdn.generationvoyage.fr/2022/02/logement-1-1.png'
        ],
        description: 'Logement unique et original pour une expérience inoubliable et authentique. Architecture surprenante et caractère unique pour les voyageurs en quête d\'originalité.',
        amenities: ['Design unique', 'Architecture originale', 'Expérience immersive', 'Photo-friendly', 'Histoire fascinante', 'Concept novateur'],
        reviews: [
            { comment: 'Expérience vraiment unique ! Jamais vu quelque chose d\'aussi original.', user: 'Nuno Mendes', rating: '★★★★★ 5/5' },
            { comment: 'Architecture fascinante, un séjour mémorable garanti !', user: 'Cheyma Gomes', rating: '★★★★★ 5/5' }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'place.html') {
        loadPlaceDetails();
    } else {
        animatePageLoad();
        setupPriceFilter();
        setupNavigation();
        setupCardAnimations();
    }
});

function loadPlaceDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id') || 'logement-occasion';
    const placeData = placesData[placeId];
    
    console.log('Chargement du logement:', placeId);
    console.log('Données du logement:', placeData);
    
    if (!placeData) {
        console.error('Logement non trouvé:', placeId);
        window.location.href = 'index.html';
        return;
    }
    
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        console.log('Section place-details trouvée, ajout du contenu...');
        console.log('Image principale:', placeData.mainImage);
        console.log('Images de galerie:', placeData.galleryImages);
        
        placeDetailsSection.innerHTML = `
            <div class="place-info">
                <h2>${placeData.name}</h2>
                <p class="host">Hôte: ${placeData.host}</p>
                <p class="price">${placeData.price}</p>
                <div class="place-images">
                    <img src="${placeData.mainImage}" alt="Vue principale" class="main-detail-image" onload="console.log('Image principale chargée')" onerror="console.error('Erreur chargement image principale')">
                    <div class="detail-gallery">
                        ${placeData.galleryImages.map((img, index) => 
                            `<img src="${img}" alt="Vue intérieure ${index + 1}" class="detail-gallery-image" onload="console.log('Image galerie ${index + 1} chargée')" onerror="console.error('Erreur chargement image galerie ${index + 1}')">`
                        ).join('')}
                    </div>
                </div>
                <p class="description">${placeData.description}</p>
                <div class="amenities">
                    <h3>Équipements</h3>
                    <ul>
                        ${placeData.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        console.log('Contenu HTML ajouté à place-details');
    } else {
        console.error('Section place-details non trouvée !');
    }
    
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsList && placeData.reviews) {
        reviewsList.innerHTML = placeData.reviews.map(review => `
            <div class="review-card">
                <p class="comment">${review.comment}</p>
                <p class="user-name">${review.user}</p>
                <p class="rating">${review.rating}</p>
            </div>
        `).join('');
    }
    
    document.title = `HBnB - ${placeData.name}`;
    
    setTimeout(() => {
        const placeInfo = document.querySelector('.place-info');
        const reviewCards = document.querySelectorAll('.review-card');
        
        if (placeInfo) {
            placeInfo.style.opacity = '0';
            placeInfo.style.transform = 'translateY(30px)';
            setTimeout(() => {
                placeInfo.style.transition = 'all 0.6s ease';
                placeInfo.style.opacity = '1';
                placeInfo.style.transform = 'translateY(0)';
            }, 200);
        }
        
        reviewCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 400 + (index * 200));
        });
    }, 100);
}

function animatePageLoad() {
    const cards = document.querySelectorAll('.place-card');
    const filter = document.querySelector('#filter');
    
    if (filter) {
        filter.style.opacity = '0';
        filter.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            filter.style.transition = 'all 0.6s ease';
            filter.style.opacity = '1';
            filter.style.transform = 'translateY(0)';
        }, 200);
    }
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 400 + (index * 150));
    });
}

function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    const filterContainer = document.querySelector('.filter-container');
    
    if (!priceFilter) return;
    
    priceFilter.addEventListener('focus', function() {
        filterContainer.style.transform = 'scale(1.08)';
        filterContainer.style.background = 'rgba(52, 152, 219, 0.1)';
        filterContainer.style.borderColor = '#3498db';
    });
    
    priceFilter.addEventListener('blur', function() {
        filterContainer.style.transform = 'scale(1.05)';
        filterContainer.style.background = 'rgba(224, 229, 235, 1)';
        filterContainer.style.borderColor = 'rgba(245, 251, 255, 1)';
    });
    
    priceFilter.addEventListener('change', function() {
        const selectedPrice = this.value;
        const placeCards = document.querySelectorAll('.place-card');
        
        console.log('Filtre sélectionné:', selectedPrice);
        console.log('Nombre de cartes trouvées:', placeCards.length);
        
        filterContainer.style.background = 'rgba(46, 204, 113, 0.2)';
        filterContainer.style.borderColor = '#2ecc71';
        filterContainer.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            filterContainer.style.background = 'rgba(240, 243, 247, 1)';
            filterContainer.style.borderColor = 'rgba(219, 232, 240, 1)';
            filterContainer.style.transform = 'scale(1.05)';
        }, 500);
        
        placeCards.forEach((card, index) => {
            const priceElement = card.querySelector('.price');
            if (!priceElement) return;
            
            const priceText = priceElement.textContent;
            const cardPrice = priceText.match(/\$(\d+)/);
            const cardPriceValue = cardPrice ? cardPrice[1] : '';
            
            console.log('Prix de la carte:', cardPriceValue, 'vs filtre:', selectedPrice);
            
            if (selectedPrice === '' || cardPriceValue === selectedPrice) {

                setTimeout(() => {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8) translateY(30px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.6s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    }, 50);
                }, index * 100);
            } else {
    
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8) translateY(-30px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {

            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            

            if (this.href !== window.location.href) {
                document.body.style.opacity = '0.7';
                document.body.style.transform = 'scale(0.98)';
            }
        });
        

        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}


function setupCardAnimations() {
    const cards = document.querySelectorAll('.place-card');
    
    cards.forEach(card => {

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(card);
        

        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (x - centerX) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)';
        });
    });
}

/* 
  Page principale avec API
*/

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

function checkAuthentication() {
    const token = getCookie('access_token');
    const loginLink = document.getElementById('login-link');

    if (!token) {

        if (loginLink) {
            loginLink.style.display = 'block';
        }
       
        fetchPlaces(null);
    } else {

        if (loginLink) {
            loginLink.style.display = 'none';
        }
        
        fetchPlaces(token);
    }
}

async function fetchPlaces(token) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:5000/api/v1/places', {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            console.error('Erreur lors du chargement des logements:', response.statusText);

        }
    } catch (error) {
        console.error('Erreur de connexion à l\'API:', error);

    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    if (!placesList) return;
    

    placesList.innerHTML = '';

    places.forEach(place => {
        const placeEl = document.createElement('div');
        placeEl.classList.add('place-card');
        placeEl.dataset.id = place.id;
        placeEl.dataset.price = place.price;

        placeEl.innerHTML = `
            <img src="${place.image}" alt="${place.name}" class="place-image">
            <h3>${place.name}</h3>
            <p class="price">$${place.price} / nuit</p>
            <p>${place.description}</p>
            <a href="place.html?id=${place.id}" class="details-button">Voir les détails</a>
        `;

        placesList.appendChild(placeEl);
    });
    

    if (typeof addCardHoverEffects === 'function') {
        addCardHoverEffects();
    }
}

function initializePriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    priceFilter.addEventListener('change', (event) => {
        const maxPrice = event.target.value;
        const places = document.querySelectorAll('.place-card');

        places.forEach(place => {
            const price = parseInt(place.dataset.price, 10);
            
            if (maxPrice === '' || price <= parseInt(maxPrice, 10)) {
                place.style.display = 'block';
            } else {
                place.style.display = 'none';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('places-list')) {
        checkAuthentication();
        initializePriceFilter();
    }
    

    if (document.getElementById('place-details')) {
        initializePlaceDetailsPage();
    }
    

    if (document.getElementById('review-form') && window.location.pathname.includes('add_review.html')) {
        initializeAddReviewPage();
    }
});

/* 
  FONCTIONNALITÉS DE LA PAGE DE DÉTAILS D'UN LIEU
*/

function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function checkAuthenticationForDetails() {
    const token = getCookie('access_token');
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {

        if (loginLink) {
            loginLink.style.display = 'block';
        }
        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        }
        return null;
    } else {

        if (loginLink) {
            loginLink.style.display = 'none';
        }
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }
        return token;
    }
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const placeDetails = await response.json();
            displayPlaceDetails(placeDetails);
        } else if (response.status === 404) {
            displayPlaceNotFound();
        } else {
            console.error('Erreur lors du chargement des détails:', response.statusText);
            displayErrorMessage('Erreur lors du chargement des détails du lieu.');
        }
    } catch (error) {
        console.error('Erreur de connexion à l\'API:', error);
        displayErrorMessage('Erreur de connexion au serveur.');
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    const reviewsList = document.getElementById('reviews-list');
    
    if (!placeDetailsSection) return;

    placeDetailsSection.innerHTML = '';

    const placeHTML = `
        <div class="place-header">
            <h1>${place.name}</h1>
            <p class="place-location">📍 ${place.location}</p>
            <p class="place-price">💰 $${place.price} / nuit</p>
        </div>
        
        <div class="place-image-container">
            <img src="${place.image}" alt="${place.name}" class="place-main-image">
        </div>
        
        <div class="place-description">
            <h2>Description</h2>
            <p>${place.description}</p>
        </div>
        
        <div class="place-amenities">
            <h2>Équipements</h2>
            <ul class="amenities-list">
                ${place.amenities.map(amenity => `<li>✅ ${amenity}</li>`).join('')}
            </ul>
        </div>
    `;

    placeDetailsSection.innerHTML = placeHTML;

    if (reviewsList && place.reviews) {
        displayReviews(place.reviews);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>Aucun avis pour ce lieu.</p>';
        return;
    }

    const reviewsHTML = reviews.map(review => {
        const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        return `
            <div class="review-item">
                <div class="review-header">
                    <h4>${review.user_name}</h4>
                    <div class="review-rating">${stars} (${review.rating}/5)</div>
                    <span class="review-date">${formatDate(review.created_at)}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
            </div>
        `;
    }).join('');

    reviewsList.innerHTML = reviewsHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function displayErrorMessage(message) {
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        placeDetailsSection.innerHTML = `
            <div class="error-message">
                <h2>Erreur</h2>
                <p>${message}</p>
                <a href="index.html" class="back-button">← Retour à l'accueil</a>
            </div>
        `;
    }
}

function displayPlaceNotFound() {
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        placeDetailsSection.innerHTML = `
            <div class="error-message">
                <h2>Lieu introuvable</h2>
                <p>Le lieu demandé n'existe pas ou a été supprimé.</p>
                <a href="index.html" class="back-button">← Retour à l'accueil</a>
            </div>
        `;
    }
}

function initializePlaceDetailsPage() {
    const placeId = getPlaceIdFromURL();
    
    if (!placeId) {
        displayErrorMessage('Aucun identifiant de lieu spécifié.');
        return;
    }

    const token = checkAuthenticationForDetails();
    
    fetchPlaceDetails(token, placeId);
    
    if (token) {
        initializeReviewForm(token, placeId);
    }
}

function initializeReviewForm(token, placeId) {
    const reviewForm = document.getElementById('review-form');
    const addReviewSection = document.getElementById('add-review');
    
    if (!addReviewSection) return;

    addReviewSection.innerHTML = `
        <h2>Ajouter un Avis</h2>
        <p>Partagez votre expérience avec ce logement :</p>
        <a href="add_review.html?place_id=${placeId}" class="add-review-button">
            ➕ Écrire un avis
        </a>
    `;

    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const reviewText = document.getElementById('review-text').value.trim();
            const reviewRating = document.getElementById('review-rating').value;
            
            if (!reviewText || !reviewRating) {
                alert('Veuillez remplir tous les champs.');
                return;
            }


            alert('Avis soumis avec succès ! (Fonctionnalité en développement)');
            

            reviewForm.reset();
        });
    }
}

/* 
  FONCTIONNALITÉS DE LA PAGE D'AJOUT D'AVIS
*/

function checkAuthenticationForAddReview() {
    const token = getCookie('access_token');
    
    if (!token) {

        alert('Vous devez être connecté pour ajouter un avis.');
        window.location.href = 'index.html';
        return null;
    }
    
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.style.display = 'none';
    }
    
    return token;
}

function getPlaceIdFromURLForReview() {
    const params = new URLSearchParams(window.location.search);
    return params.get('place_id');
}

async function loadPlaceInfoForReview(placeId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceInfoHeader(place);
        } else {
            console.error('Erreur lors du chargement des informations du lieu');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
}

function displayPlaceInfoHeader(place) {
    const placeInfoDiv = document.getElementById('place-info');
    if (!placeInfoDiv) return;

    placeInfoDiv.innerHTML = `
        <h3>Ajouter un avis pour :</h3>
        <div class="place-info-content">
            <img src="${place.image}" alt="${place.name}" class="place-info-image">
            <div class="place-info-details">
                <h4>${place.name}</h4>
                <p class="place-location">📍 ${place.location}</p>
                <p class="place-price">💰 $${place.price} / nuit</p>
            </div>
        </div>
    `;
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: reviewText,
                rating: parseInt(rating, 10),
                place_id: placeId
            })
        });

        await handleReviewResponse(response);
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        showMessage('Une erreur s\'est produite lors de la soumission de votre avis.', 'error');
    }
}

async function handleReviewResponse(response) {
    const messageContainer = document.getElementById('message-container');
    
    if (response.ok) {
        const data = await response.json();
        showMessage('Avis soumis avec succès ! Merci pour votre contribution.', 'success');
        
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.reset();
        }
        
        setTimeout(() => {
            const placeId = getPlaceIdFromURLForReview();
            window.location.href = `place.html?id=${placeId}`;
        }, 2000);
        
    } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Erreur inconnue';
        showMessage(`Échec de la soumission : ${errorMessage}`, 'error');
    }
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) return;

    messageContainer.className = `message-container ${type}`;
    messageContainer.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="message-text">${message}</span>
        </div>
    `;
    messageContainer.style.display = 'block';

    if (type === 'error') {
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
}

function initializeAddReviewPage() {

    const token = checkAuthenticationForAddReview();
    if (!token) return;

    const placeId = getPlaceIdFromURLForReview();
    if (!placeId) {
        alert('Aucun lieu spécifié pour l\'avis.');
        window.location.href = 'index.html';
        return;
    }

    // Charger les informations du lieu
    loadPlaceInfoForReview(placeId);

    // Configurer le formulaire
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const reviewText = document.getElementById('review-text').value.trim();
            const rating = document.getElementById('review-rating').value;
            
            // Validation côté client
            if (!reviewText) {
                showMessage('Veuillez saisir votre avis.', 'error');
                return;
            }
            
            if (!rating) {
                showMessage('Veuillez sélectionner une note.', 'error');
                return;
            }
            
            if (reviewText.length < 10) {
                showMessage('Votre avis doit contenir au moins 10 caractères.', 'error');
                return;
            }

            // Désactiver le bouton de soumission pendant l'envoi
            const submitButton = reviewForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';

            try {
                await submitReview(token, placeId, reviewText, rating);
            } finally {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
}

/* 
  FONCTIONNALITÉ DE CONNEXION - Gestion JWT et API
*/

// Fonction pour définir un cookie
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Fonction pour obtenir un cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Fonction pour afficher un message d'erreur
function showErrorMessage(message) {
    // Créer ou mettre à jour le message d'erreur
    let errorDiv = document.getElementById('login-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'login-error';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
            animation: fadeIn 0.3s ease;
        `;
        
        // Insérer le message d'erreur avant le formulaire
        const form = document.getElementById('login-form');
        if (form) {
            form.parentNode.insertBefore(errorDiv, form);
        }
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }, 5000);
}

// Fonction pour masquer le message d'erreur
function hideErrorMessage() {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Fonction principale de connexion
async function handleLogin(email, password) {
    try {
        // Requête AJAX vers l'API de connexion backend
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Connexion réussie - Stocker le token dans un cookie
            setCookie('access_token', data.token, 7); // Cookie valide 7 jours
            setCookie('user_name', data.user_name, 7); // Stocker le nom d'utilisateur
            
            // Masquer le message d'erreur s'il existe
            hideErrorMessage();
            
            // Rediriger vers la page principale
            window.location.href = 'index.html';
            
        } else {
            // Connexion échouée - Afficher le message d'erreur
            const errorMessage = data.error || data.message || 'Erreur de connexion. Vérifiez vos identifiants.';
            showErrorMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        showErrorMessage('Erreur de connexion au serveur. Assurez-vous que le serveur backend est démarré.');
    }
}

// Écouteur d'événement pour le formulaire de connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Empêcher le comportement par défaut de soumission de formulaire
            event.preventDefault();
            
            // Récupérer les valeurs des champs
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Validation basique
            if (!email || !password) {
                showErrorMessage('Veuillez remplir tous les champs.');
                return;
            }
            
            // Validation format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showErrorMessage('Veuillez entrer une adresse email valide.');
                return;
            }
            
            // Masquer le message d'erreur précédent
            hideErrorMessage();
            
            // Désactiver le bouton de soumission pendant la requête
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Connexion...';
            
            // Appeler la fonction de connexion
            handleLogin(email, password).finally(() => {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
        });
    }
});
