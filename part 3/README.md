# HBnB - Part 2: RESTful API with Flask

## Table of Contents

- [ Overview](#-overview)
- [ Project Structure](#-project-structure)
- [Features](#-features)
- [How to Run](#-how-to-run)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Technologies](#-technologies)
- [Authors](#-authors)

---

## Overview

This is the second part of the **HBnB project**, where we implement a **RESTful API** using **Python**, **Flask**, and **Flask-RESTx**.  
The API allows management of the main entities of the HBnB system: `Users`, `Places`, `Amenities`, and `Reviews`.

The project follows a **layered architecture** with clear separation of concerns:
- **Models**: Data entities and business logic
- **Services**: Business logic layer (Facade pattern)
- **API**: RESTful endpoints
- **Persistence**: Data storage layer
- **Tests**: Comprehensive unit testing

---

## Project Structure

```
part 2/
├── config.py                 # Configuration settings
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── README.md               # This file
│
├── app/                    # Main application package
│   ├── __init__.py
│   │
│   ├── api/               # API layer (RESTful endpoints)
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py      # User endpoints
│   │       ├── places.py     # Place endpoints
│   │       ├── amenities.py  # Amenity endpoints
│   │       └── reviews.py    # Review endpoints
│   │
│   ├── models/            # Data models
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── place.py         # Place model
│   │   ├── amenity.py       # Amenity model
│   │   └── review.py        # Review model
│   │
│   ├── services/          # Business logic layer
│   │   ├── __init__.py
│   │   └── facade.py        # Facade pattern implementation
│   │
│   ├── persistence/       # Data persistence layer
│   │   ├── __init__.py
│   │   └── repository.py    # Repository pattern implementation
│   │
│   └── tests/            # Unit tests
│       ├── __init__.py
│       ├── test_user.py     # User model tests
│       ├── test_place.py    # Place model tests
│       ├── test_amenity.py  # Amenity model tests
│       └── test_review.py   # Review model tests
```

## Features

### User Management
- Create new users with email validation
- Retrieve user information by ID
- Update user details (first name, last name)
- List all users
- Email uniqueness validation

### Place Management
- Create places with owner validation
- Add amenities to places
- Update place information
- Price and coordinate validation
- List all places
- Retrieve place details with amenities

### Amenity Management
- Create amenities
- Update amenity information
- List all amenities
- Retrieve amenity details

### Review Management
- Create reviews for places
- Update review content
- Delete reviews
- List reviews by place
- Rating validation (1-5 stars)

## How to Run

### Prerequisites
- Python 3.8+ installed
- pip package manager

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd holbertonschool-hbnb-2/part\ 2/
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server**:
   ```bash
   python run.py
   ```

4. **Access the API**:
   - Server runs at: `http://localhost:5000`
   - Interactive documentation: `http://localhost:5000/api/v1/`

## Testing

### Test Structure
The project includes comprehensive unit tests for all models and facade operations:

```
app/tests/
├── test_user.py      # User model and facade tests
├── test_place.py     # Place model and facade tests  
├── test_amenity.py   # Amenity model and facade tests
└── test_review.py    # Review model and facade tests
```

### Running Tests

1. **Run all tests**:
   ```bash
   python -m unittest discover app/tests/
   ```

2. **Run specific test file**:
   ```bash
   python -m unittest app.tests.test_user
   python -m unittest app.tests.test_place
   python -m unittest app.tests.test_amenity
   python -m unittest app.tests.test_review
   ```

3. **Run with verbose output**:
   ```bash
   python -m unittest discover app/tests/ -v
   ```

### Test Coverage

Each test file covers:
- **Model Creation**: Testing object instantiation with valid data
- **Attribute Validation**: Ensuring all attributes are properly set
- **Update Operations**: Testing model update functionality
- **Facade Operations**: Testing business logic through the facade
- **Error Handling**: Testing invalid data and edge cases
- **Data Validation**: Testing input validation rules

### Example Test Scenarios

#### User Tests
- Email format validation
- Unique ID generation
- User update operations
- Facade CRUD operations

#### Place Tests  
- Price validation (must be positive)
- Coordinate validation (latitude: -90 to 90, longitude: -180 to 180)
- Owner validation
- Amenity association

#### Amenity Tests
- Name requirement validation
- Unique amenity creation
- Update operations

#### Review Tests
- Rating validation (1-5 scale)
- User and place association
- Review content validation

## API Documentation

### Available Endpoints

#### Users
- `GET /api/v1/users/` - List all users
- `POST /api/v1/users/` - Create a new user
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user

#### Places
- `GET /api/v1/places/` - List all places
- `POST /api/v1/places/` - Create a new place
- `GET /api/v1/places/{id}` - Get place by ID
- `PUT /api/v1/places/{id}` - Update place

#### Amenities
- `GET /api/v1/amenities/` - List all amenities
- `POST /api/v1/amenities/` - Create a new amenity
- `GET /api/v1/amenities/{id}` - Get amenity by ID
- `PUT /api/v1/amenities/{id}` - Update amenity

#### Reviews
- `GET /api/v1/reviews/` - List all reviews
- `POST /api/v1/reviews/` - Create a new review
- `GET /api/v1/reviews/{id}` - Get review by ID
- `PUT /api/v1/reviews/{id}` - Update review
- `DELETE /api/v1/reviews/{id}` - Delete review
- `GET /api/v1/places/{id}/reviews` - Get reviews for a place

### Interactive Documentation
Visit `http://localhost:5000/api/v1/` to access the **Swagger UI** for interactive API testing.

## Technologies

- **Python 3.8+** - Programming language
- **Flask** - Web framework
- **Flask-RESTx** - RESTful API extension with Swagger documentation
- **unittest** - Python testing framework
- **UUID** - Unique identifier generation

### Architecture Patterns
- **Facade Pattern** - Simplified interface to complex subsystems
- **Repository Pattern** - Data access abstraction layer
- **Layered Architecture** - Clear separation of concerns

## Authors

**Nawfel** | **Warren** | **Yassine**

# HBnB - Part 3: Database Integration with SQLAlchemy

## Table of Contents

- [ Overview](#-overview)
- [ Project Structure](#-project-structure)
- [Database Features](#-database-features)
- [How to Run](#-how-to-run)
- [Database Setup](#-database-setup)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Technologies](#-technologies)
- [Authors](#-authors)

---

## Overview

This is the third part of the **HBnB project**, where we integrate **SQLAlchemy ORM** for database persistence.  
The API now uses a real database to store and manage the main entities: `Users`, `Places`, `Amenities`, and `Reviews`.

New features in Part 3:
- **SQLAlchemy ORM**: Database models with relationships
- **Database Relations**: One-to-Many and Many-to-Many relationships
- **Data Integrity**: Foreign keys and constraints
- **Migration Scripts**: SQL scripts for schema creation
- **Database Diagrams**: ER diagrams with Mermaid.js

---

## Project Structure

```
part 3/
├── config.py                 # Configuration settings
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── README.md               # This file
│
├── app/                    # Main application package
│   ├── __init__.py
│   │
│   ├── api/               # API layer (RESTful endpoints)
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py      # User endpoints
│   │       ├── places.py     # Place endpoints
│   │       ├── amenities.py  # Amenity endpoints
│   │       └── reviews.py    # Review endpoints
│   │
│   ├── models/            # Data models
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── place.py         # Place model
│   │   ├── amenity.py       # Amenity model
│   │   └── review.py        # Review model
│   │
│   ├── services/          # Business logic layer
│   │   ├── __init__.py
│   │   └── facade.py        # Facade pattern implementation
│   │
│   ├── persistence/       # Data persistence layer
│   │   ├── __init__.py
│   │   └── repository.py    # Repository pattern implementation
│   │
│   └── tests/            # Unit tests
│       ├── __init__.py
│       ├── test_user.py     # User model tests
│       ├── test_place.py    # Place model tests
│       ├── test_amenity.py  # Amenity model tests
│       └── test_review.py   # Review model tests
```

## Database Features

### Entity Relationships
- **User ↔ Places**: One-to-Many (User owns multiple Places)
- **User ↔ Reviews**: One-to-Many (User writes multiple Reviews)
- **Place ↔ Reviews**: One-to-Many (Place receives multiple Reviews)
- **Place ↔ Amenities**: Many-to-Many (through place_amenity table)

### Database Tables
- `users`: User accounts with authentication
- `places`: Property listings with geolocation
- `reviews`: User reviews with ratings (1-5)
- `amenities`: Available amenities/features
- `place_amenity`: Junction table for Place-Amenity relationships

---

## How to Run

### Prerequisites
- Python 3.8+ installed
- pip package manager
- PostgreSQL or MySQL database server

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd holbertonschool-hbnb-2/part\ 3/
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database settings** in `config.py`:
   ```python
   SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:password@localhost/hbnb_db'
   SQLALCHEMY_TRACK_MODIFICATIONS = False
   ```

4. **Create the database** (if not already done):
   ```sql
   CREATE DATABASE hbnb_db;
   ```

5. **Run migrations** to set up the schema:
   ```bash
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Start the Flask server**:
   ```bash
   python run.py
   ```

7. **Access the API**:
   - Server runs at: `http://localhost:5000`
   - Interactive documentation: `http://localhost:5000/api/v1/`

## Testing

### Test Structure
The project includes comprehensive unit tests for all models and facade operations:

```
app/tests/
├── test_user.py      # User model and facade tests
├── test_place.py     # Place model and facade tests  
├── test_amenity.py   # Amenity model and facade tests
└── test_review.py    # Review model and facade tests
```

### Running Tests

1. **Run all tests**:
   ```bash
   python -m unittest discover app/tests/
   ```

2. **Run specific test file**:
   ```bash
   python -m unittest app.tests.test_user
   python -m unittest app.tests.test_place
   python -m unittest app.tests.test_amenity
   python -m unittest app.tests.test_review
   ```

3. **Run with verbose output**:
   ```bash
   python -m unittest discover app/tests/ -v
   ```

### Test Coverage

Each test file covers:
- **Model Creation**: Testing object instantiation with valid data
- **Attribute Validation**: Ensuring all attributes are properly set
- **Update Operations**: Testing model update functionality
- **Facade Operations**: Testing business logic through the facade
- **Error Handling**: Testing invalid data and edge cases
- **Data Validation**: Testing input validation rules

### Example Test Scenarios

#### User Tests
- Email format validation
- Unique ID generation
- User update operations
- Facade CRUD operations

#### Place Tests  
- Price validation (must be positive)
- Coordinate validation (latitude: -90 to 90, longitude: -180 to 180)
- Owner validation
- Amenity association

#### Amenity Tests
- Name requirement validation
- Unique amenity creation
- Update operations

#### Review Tests
- Rating validation (1-5 scale)
- User and place association
- Review content validation

## API Documentation

### Available Endpoints

#### Users
- `GET /api/v1/users/` - List all users
- `POST /api/v1/users/` - Create a new user
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user

#### Places
- `GET /api/v1/places/` - List all places
- `POST /api/v1/places/` - Create a new place
- `GET /api/v1/places/{id}` - Get place by ID
- `PUT /api/v1/places/{id}` - Update place

#### Amenities
- `GET /api/v1/amenities/` - List all amenities
- `POST /api/v1/amenities/` - Create a new amenity
- `GET /api/v1/amenities/{id}` - Get amenity by ID
- `PUT /api/v1/amenities/{id}` - Update amenity

#### Reviews
- `GET /api/v1/reviews/` - List all reviews
- `POST /api/v1/reviews/` - Create a new review
- `GET /api/v1/reviews/{id}` - Get review by ID
- `PUT /api/v1/reviews/{id}` - Update review
- `DELETE /api/v1/reviews/{id}` - Delete review
- `GET /api/v1/places/{id}/reviews` - Get reviews for a place

### Interactive Documentation
Visit `http://localhost:5000/api/v1/` to access the **Swagger UI** for interactive API testing.

## Technologies

- **Python 3.8+** - Programming language
- **Flask** - Web framework
- **Flask-RESTx** - RESTful API extension with Swagger documentation
- **unittest** - Python testing framework
- **UUID** - Unique identifier generation
- **SQLAlchemy** - ORM for database integration
- **MySQL/PostgreSQL** - Relational database management system

### Architecture Patterns
- **Facade Pattern** - Simplified interface to complex subsystems
- **Repository Pattern** - Data access abstraction layer
- **Layered Architecture** - Clear separation of concerns

## Authors

**Nawfel** | **Warren** | **Yassine**

---

## Database Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
# Option 1: Using the initialization script
python init_db.py

# Option 2: Using SQL scripts directly
# Create schema
sqlite3 hbnb.db < sql/create_schema.sql
# Insert initial data
sqlite3 hbnb.db < sql/insert_initial_data.sql
```

### 3. Run Tests
```bash
# Test CRUD operations
python test_models.py

# Test with SQL scripts
sqlite3 hbnb.db < sql/test_crud.sql
```

### 4. Start Application
```bash
python run.py
```

---

## SQL Scripts

The project includes several SQL scripts in the `sql/` directory:

- `create_schema.sql`: Creates all database tables and relationships
- `insert_initial_data.sql`: Inserts admin user and basic amenities
- `test_crud.sql`: Tests CRUD operations with sample data

---

## Database Diagram

See `database_diagram.md` for the complete Entity-Relationship diagram created with Mermaid.js.

The diagram shows:
- All table structures with fields and types
- Primary and foreign key relationships
- Constraints and indexes
- Relationship cardinalities

---

## Technologies Used

- **Python 3.x**: Programming language
- **Flask**: Web framework
- **Flask-SQLAlchemy**: ORM for database operations
- **Flask-RESTx**: RESTful API with Swagger documentation
- **Flask-Bcrypt**: Password hashing
- **Flask-JWT-Extended**: JWT authentication
- **SQLite**: Default database (configurable)
- **Mermaid.js**: Database diagram generation

---