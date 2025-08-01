import unittest
from app.models.place import Place
from app.models.user import User
from app.models.amenity import Amenity
from app.services.facade import HBnBFacade
import uuid


class TestPlace(unittest.TestCase):
    """Test cases for Place model"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.place_data = {
            'title': 'Beautiful Apartment',
            'description': 'A lovely place to stay',
            'price': 100.0,
            'latitude': 40.7128,
            'longitude': -74.0060,
            'owner_id': str(uuid.uuid4()),
            'amenities': []
        }
        self.place = Place(
            id=str(uuid.uuid4()),
            title=self.place_data['title'],
            description=self.place_data['description'],
            price=self.place_data['price'],
            latitude=self.place_data['latitude'],
            longitude=self.place_data['longitude'],
            owner_id=self.place_data['owner_id'],
            amenities=self.place_data['amenities']
        )

    def test_place_creation(self):
        """Test place creation with valid data"""
        self.assertIsInstance(self.place, Place)
        self.assertEqual(self.place.title, 'Beautiful Apartment')
        self.assertEqual(self.place.description, 'A lovely place to stay')
        self.assertEqual(self.place.price, 100.0)
        self.assertEqual(self.place.latitude, 40.7128)
        self.assertEqual(self.place.longitude, -74.0060)
        self.assertIsNotNone(self.place.id)

    def test_place_attributes(self):
        """Test place attributes are correctly set"""
        self.assertTrue(hasattr(self.place, 'id'))
        self.assertTrue(hasattr(self.place, 'title'))
        self.assertTrue(hasattr(self.place, 'description'))
        self.assertTrue(hasattr(self.place, 'price'))
        self.assertTrue(hasattr(self.place, 'latitude'))
        self.assertTrue(hasattr(self.place, 'longitude'))
        self.assertTrue(hasattr(self.place, 'owner_id'))
        self.assertTrue(hasattr(self.place, 'amenities'))
        self.assertTrue(hasattr(self.place, 'reviews'))

    def test_place_price_validation(self):
        """Test place price validation"""
        with self.assertRaises(ValueError):
            Place(
                id=str(uuid.uuid4()),
                title='Test Place',
                description='Test description',
                price=-50.0,  # Negative price should raise error
                latitude=40.0,
                longitude=-74.0,
                owner_id=str(uuid.uuid4())
            )

    def test_place_latitude_validation(self):
        """Test place latitude validation"""
        with self.assertRaises(ValueError):
            Place(
                id=str(uuid.uuid4()),
                title='Test Place',
                description='Test description',
                price=100.0,
                latitude=95.0,  # Invalid latitude
                longitude=-74.0,
                owner_id=str(uuid.uuid4())
            )

    def test_place_longitude_validation(self):
        """Test place longitude validation"""
        with self.assertRaises(ValueError):
            Place(
                id=str(uuid.uuid4()),
                title='Test Place',
                description='Test description',
                price=100.0,
                latitude=40.0,
                longitude=185.0,  # Invalid longitude
                owner_id=str(uuid.uuid4())
            )

    def test_place_update(self):
        """Test place update method"""
        update_data = {
            'title': 'Updated Beautiful Apartment',
            'price': 150.0
        }
        self.place.update(update_data)
        
        self.assertEqual(self.place.title, 'Updated Beautiful Apartment')
        self.assertEqual(self.place.price, 150.0)

    def test_place_update_with_validation(self):
        """Test place update with validation"""
        with self.assertRaises(ValueError):
            self.place.update({'price': -50.0})

    def test_place_reviews_list(self):
        """Test place reviews list initialization"""
        self.assertIsInstance(self.place.reviews, list)
        self.assertEqual(len(self.place.reviews), 0)


class TestPlaceFacade(unittest.TestCase):
    """Test cases for Place operations through HBnBFacade"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.facade = HBnBFacade()
        
        # Create a user first (required for place creation)
        self.user_data = {
            'email': 'owner@example.com',
            'password': 'password123',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        self.user = self.facade.create_user(self.user_data)
        
        # Create an amenity
        self.amenity_data = {
            'name': 'WiFi'
        }
        self.amenity = self.facade.create_amenity(self.amenity_data)
        
        self.place_data = {
            'title': 'Test Place',
            'description': 'A test place',
            'price': 100.0,
            'latitude': 40.7128,
            'longitude': -74.0060,
            'owner_id': self.user.id,
            'amenities': [self.amenity.id]
        }

    def test_create_place_facade(self):
        """Test place creation through facade"""
        place = self.facade.create_place(self.place_data)
        
        self.assertIsInstance(place, dict)  # Facade returns dict with details
        self.assertEqual(place['title'], 'Test Place')
        self.assertEqual(place['price'], 100.0)
        self.assertEqual(place['owner']['id'], self.user.id)
        self.assertIsNotNone(place['id'])

    def test_get_place_facade(self):
        """Test getting place by ID through facade"""
        created_place = self.facade.create_place(self.place_data)
        retrieved_place = self.facade.get_place(created_place['id'])
        
        self.assertEqual(created_place['id'], retrieved_place['id'])
        self.assertEqual(created_place['title'], retrieved_place['title'])

    def test_get_all_places_facade(self):
        """Test getting all places through facade"""
        place1 = self.facade.create_place(self.place_data)
        
        place_data2 = {
            'title': 'Second Place',
            'description': 'Another test place',
            'price': 150.0,
            'latitude': 41.0,
            'longitude': -75.0,
            'owner_id': self.user.id,
            'amenities': []
        }
        place2 = self.facade.create_place(place_data2)
        
        all_places = self.facade.get_all_places()
        
        self.assertGreaterEqual(len(all_places), 2)
        place_ids = [place['id'] for place in all_places]
        self.assertIn(place1['id'], place_ids)
        self.assertIn(place2['id'], place_ids)

    def test_update_place_facade(self):
        """Test updating place through facade"""
        created_place = self.facade.create_place(self.place_data)
        
        update_data = {
            'title': 'Updated Test Place',
            'price': 200.0
        }
        
        updated_place = self.facade.update_place(created_place['id'], update_data)
        
        self.assertEqual(updated_place['title'], 'Updated Test Place')
        self.assertEqual(updated_place['price'], 200.0)

    def test_create_place_invalid_owner(self):
        """Test creating place with invalid owner"""
        invalid_place_data = self.place_data.copy()
        invalid_place_data['owner_id'] = str(uuid.uuid4())
        
        with self.assertRaises(ValueError):
            self.facade.create_place(invalid_place_data)

    def test_create_place_invalid_amenity(self):
        """Test creating place with invalid amenity"""
        invalid_place_data = self.place_data.copy()
        invalid_place_data['amenities'] = [str(uuid.uuid4())]
        
        with self.assertRaises(ValueError):
            self.facade.create_place(invalid_place_data)

    def test_get_nonexistent_place(self):
        """Test getting a place that doesn't exist"""
        fake_id = str(uuid.uuid4())
        place = self.facade.get_place(fake_id)
        self.assertIsNone(place)

    def test_update_nonexistent_place(self):
        """Test updating a place that doesn't exist"""
        fake_id = str(uuid.uuid4())
        update_data = {'title': 'Updated Title'}
        
        result = self.facade.update_place(fake_id, update_data)
        self.assertIsNone(result)


if __name__ == '__main__':
    unittest.main()