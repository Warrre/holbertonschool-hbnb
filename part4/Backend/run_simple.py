from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from sqlalchemy.exc import IntegrityError
from functools import wraps
from flask_cors import CORS
import os
import uuid

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'development.db')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)


def gen_id():
    return str(uuid.uuid4())


class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {'id': self.id, 'first_name': self.first_name, 'last_name': self.last_name, 'email': self.email, 'is_admin': self.is_admin}


class Place(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Integer)
    owner_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)

    def to_dict(self):
        # include an `amenities` list in the API response so frontend can render names
        # For now, provide sensible defaults for seeded places; empty list otherwise
        amenities = []
        try:
            title_lower = (self.title or '').lower()
            if 'beach' in title_lower:
                amenities = ['WiFi', 'Sea view', 'Air conditioning']
            elif 'cabin' in title_lower:
                amenities = ['Fireplace', 'Kitchen']
            elif 'apartment' in title_lower or 'modern' in title_lower:
                amenities = ['WiFi', 'Elevator']
        except Exception:
            amenities = []
        return {'id': self.id, 'title': self.title, 'description': self.description, 'price': self.price, 'owner_id': self.owner_id, 'amenities': amenities}


class Review(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey('place.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'user_id': self.user_id, 'place_id': self.place_id, 'text': self.text, 'rating': self.rating}


def init_db():
    with app.app_context():
        db.create_all()
        # seed if empty
        # seed places
        if Place.query.count() == 0:
            p1 = Place(title='Beautiful Beach House', description='A beautiful beach house with amazing views.', price=150)
            p2 = Place(title='Cozy Cabin', description='Small cozy cabin in the woods.', price=100)
            p3 = Place(title='Modern Apartment', description='Central apartment, modern amenities.', price=200)
            # add a second place with the same name and price as the first (requested)
            p4 = Place(title='Beautiful Beach', description='A second beautiful beach apartment with amazing views.', price=150)
            db.session.add_all([p1, p2, p3, p4])
            db.session.commit()

        # Ensure admin and demo accounts exist; leave existing users untouched
        admin_email = 'admin@example.com'
        admin_pw = 'AdminPass123'
        demo_email = 'demo@example.com'
        demo_pw = 'DemoPass123'

        admin_user = User.query.filter_by(email=admin_email).first()
        if not admin_user:
            pw_hash = generate_password_hash(admin_pw)
            admin = User(first_name='Admin', last_name='User', email=admin_email, password=pw_hash, is_admin=True)
            db.session.add(admin)
        else:
            admin = admin_user

        demo_user = User.query.filter_by(email=demo_email).first()
        if not demo_user:
            demo_hash = generate_password_hash(demo_pw)
            demo = User(first_name='Demo', last_name='User', email=demo_email, password=demo_hash, is_admin=False)
            db.session.add(demo)
        else:
            demo = demo_user

        db.session.commit()

        # Ensure admin is the only admin: revoke is_admin for all other users
        try:
            User.query.update({User.is_admin: False})
            db.session.commit()
            admin_row = User.query.filter_by(email=admin_email).first()
            if admin_row:
                admin_row.is_admin = True
                db.session.commit()
        except Exception:
            db.session.rollback()

        # Write known demo/admin credentials to a file for instructor/demo use (overwrite safe)
        try:
            users_list_path = os.path.join(BASE_DIR, 'users_list.txt')
            with open(users_list_path, 'w', encoding='utf-8') as f:
                f.write('Admin account:\n')
                f.write(f'  email: {admin.email}\n')
                f.write(f'  password: {admin_pw}\n')
                f.write('Demo account:\n')
                f.write(f'  email: {demo.email}\n')
                f.write(f'  password: {demo_pw}\n')
        except Exception:
            # best-effort only; do not fail DB init if file write fails
            pass

        # Ensure the requested extra seeded place exists (idempotent)
        try:
            beach_exists = Place.query.filter_by(title='Beautiful Beach', price=150).first()
            if not beach_exists:
                p_extra = Place(title='Beautiful Beach', description='A second beautiful beach apartment with amazing views.', price=150)
                db.session.add(p_extra)
                db.session.commit()
        except Exception:
            db.session.rollback()


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
        except Exception:
            return jsonify({'error': 'Authentication required'}), 401
        if not claims.get('is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    claims = {'user_id': user.id, 'email': user.email, 'is_admin': bool(user.is_admin)}
    token = create_access_token(identity=user.id, additional_claims=claims)
    return jsonify({'access_token': token}), 200


@app.route('/api/v1/users', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    if not email or not data.get('password') or not data.get('first_name') or not data.get('last_name'):
        return jsonify({'error': 'Missing fields'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    pw_hash = generate_password_hash(data['password'])
    user = User(first_name=data['first_name'], last_name=data['last_name'], email=email, password=pw_hash, is_admin=False)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Email already registered'}), 400
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500
    # create a JWT for the newly registered user so frontend can log in seamlessly
    claims = {'user_id': user.id, 'email': user.email, 'is_admin': bool(user.is_admin)}
    token = create_access_token(identity=user.id, additional_claims=claims)
    return jsonify({'user': user.to_dict(), 'access_token': token}), 201


@app.route('/api/v1/places', methods=['GET'])
def list_places():
    places = Place.query.all()
    return jsonify([p.to_dict() for p in places])


@app.route('/api/v1/places', methods=['POST'])
@admin_required
def create_place():
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    price = data.get('price')
    if not title or price is None:
        return jsonify({'error': 'Missing fields'}), 400
    place = Place(title=title, description=description, price=int(price))
    db.session.add(place)
    db.session.commit()
    return jsonify(place.to_dict()), 201


@app.route('/api/v1/places/<place_id>', methods=['PUT'])
@admin_required
def update_place(place_id):
    p = Place.query.get(place_id)
    if not p:
        return jsonify({'error': 'Place not found'}), 404
    data = request.get_json() or {}
    p.title = data.get('title', p.title)
    p.description = data.get('description', p.description)
    if data.get('price') is not None:
        p.price = int(data.get('price'))
    db.session.commit()
    return jsonify(p.to_dict()), 200


@app.route('/api/v1/places/<place_id>', methods=['DELETE'])
@admin_required
def delete_place(place_id):
    p = Place.query.get(place_id)
    if not p:
        return jsonify({'error': 'Place not found'}), 404
    try:
        # delete related reviews first
        Review.query.filter_by(place_id=place_id).delete()
        db.session.delete(p)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete place'}), 500
    return jsonify({'message': 'Place deleted successfully'}), 200


@app.route('/api/v1/places/<place_id>', methods=['GET'])
def get_place(place_id):
    p = Place.query.get(place_id)
    if not p:
        return jsonify({'error': 'Place not found'}), 404
    # return place object (frontend expects place fields like owner_id, amenities...)
    return jsonify(p.to_dict()), 200


@app.route('/api/v1/reviews', methods=['GET', 'POST'])
def reviews():
    if request.method == 'GET':
        all_reviews = Review.query.all()
        return jsonify([r.to_dict() for r in all_reviews])
    # POST
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_jwt
        verify_jwt_in_request()
        identity = get_jwt_identity()
    except Exception:
        return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json() or {}
    place_id = data.get('place_id')
    text = data.get('text')
    rating = data.get('rating')
    if not place_id or not text or rating is None:
        return jsonify({'error': 'Missing fields'}), 400
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Place not found'}), 404
    # Prevent exact duplicate reviews by same user on same place
    clean_text = text.strip()
    existing = Review.query.filter_by(user_id=identity, place_id=place_id, text=clean_text, rating=int(rating)).first()
    if existing:
        return jsonify({'error': 'Duplicate review detected'}), 409

    review = Review(user_id=identity, place_id=place_id, text=clean_text, rating=int(rating))
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201


@app.route('/api/v1/reviews/places/<place_id>', methods=['GET'])
def reviews_by_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Place not found'}), 404
    reviews = Review.query.filter_by(place_id=place_id).all()
    return jsonify([r.to_dict() for r in reviews])


@app.route('/api/v1/reviews/<review_id>', methods=['DELETE'])
def delete_review(review_id):
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_jwt
        verify_jwt_in_request()
        identity = get_jwt_identity()
        claims = get_jwt()
    except Exception:
        return jsonify({'error': 'Authentication required'}), 401

    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    is_admin = bool(claims.get('is_admin', False)) if isinstance(claims, dict) else False
    # allow delete if admin or owner of the review
    if not is_admin and review.user_id != identity:
        return jsonify({'error': 'Unauthorized action'}), 403

    try:
        db.session.delete(review)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete review'}), 500

    return jsonify({'message': 'Review deleted successfully'}), 200


@app.route('/api/v1/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200


@app.route('/api/v1/users', methods=['GET'])
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


@app.route('/api/v1/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    try:
        # remove user's reviews and optionally places
        Review.query.filter_by(user_id=user_id).delete()
        Place.query.filter_by(owner_id=user_id).update({Place.owner_id: None})
        db.session.delete(user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user'}), 500
    return jsonify({'message': 'User deleted successfully'}), 200


if __name__ == '__main__':
    # initialize DB and run
    init_db()
    app.run(host='127.0.0.1', port=5000, debug=True)
