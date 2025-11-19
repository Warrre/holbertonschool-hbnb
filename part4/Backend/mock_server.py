from flask import Flask, jsonify, request
from flask_cors import CORS
import json, base64

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# In-memory sample data
PLACES = [
    {"id": "p1", "title": "Studio cosy", "description": "Petit studio au centre.", "price": 35.0},
    {"id": "p2", "title": "Appartement moderne", "description": "Appartement 2 chambres.", "price": 80.0},
    {"id": "p3", "title": "Maison de campagne", "description": "Grande maison, calme.", "price": 120.0},
]

REVIEWS = []

def b64url_encode(obj):
    j = json.dumps(obj, separators=(',', ':')).encode('utf-8')
    return base64.urlsafe_b64encode(j).decode('utf-8').rstrip('=')

def make_token(payload: dict):
    header = {"alg": "none", "typ": "JWT"}
    return f"{b64url_encode(header)}.{b64url_encode(payload)}."

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400
    # Accept any credentials in mock, create a token with user_id
    user_id = f"u_{email.split('@')[0]}"
    claims = {"user_id": user_id, "email": email, "is_admin": False}
    token = make_token(claims)
    return jsonify({'access_token': token, 'token_type': 'Bearer'})

@app.route('/api/v1/places/', methods=['GET', 'POST'])
def places_list():
    if request.method == 'GET':
        return jsonify(PLACES)
    data = request.get_json(force=True, silent=True) or {}
    # create new place
    new_id = f"p{len(PLACES)+1}"
    place = {
        'id': new_id,
        'title': data.get('title', 'Untitled'),
        'description': data.get('description', ''),
        'price': data.get('price', 0.0)
    }
    PLACES.append(place)
    return jsonify(place), 201

@app.route('/api/v1/places/<place_id>', methods=['GET'])
def place_detail(place_id):
    p = next((x for x in PLACES if x['id'] == place_id), None)
    if not p:
        return jsonify({'error': 'Place not found'}), 404
    # supply amenities and reviews
    amenities = []
    reviews = [r for r in REVIEWS if r.get('place_id') == place_id]
    res = {**p, 'amenities': amenities, 'reviews': reviews}
    return jsonify(res)

@app.route('/api/v1/reviews/', methods=['GET', 'POST'])
def reviews_list():
    if request.method == 'GET':
        return jsonify(REVIEWS)
    data = request.get_json(force=True, silent=True) or {}
    # Validate minimal fields
    text = data.get('text')
    rating = data.get('rating')
    user_id = data.get('user_id')
    place_id = data.get('place_id')
    if not all([text, rating, user_id, place_id]):
        return jsonify({'error': 'Missing fields'}), 400
    # Prevent duplicate by same user on same place
    for r in REVIEWS:
        if r['user_id'] == user_id and r['place_id'] == place_id:
            return jsonify({'error': 'You have already reviewed this place'}), 400
    new = {'id': f'r{len(REVIEWS)+1}', 'text': text, 'rating': rating, 'user_id': user_id, 'place_id': place_id}
    REVIEWS.append(new)
    return jsonify(new), 201

@app.route('/api/v1/reviews/places/<place_id>', methods=['GET'])
def reviews_by_place(place_id):
    p = next((x for x in PLACES if x['id'] == place_id), None)
    if not p:
        return jsonify({'error': 'Place not found'}), 404
    reviews = [r for r in REVIEWS if r['place_id'] == place_id]
    return jsonify(reviews)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
