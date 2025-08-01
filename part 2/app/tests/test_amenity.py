import unittest
from app.models.amenity import Amenity
from app.services.facade import HBnBFacade
import uuid


class TestAmenity(unittest.TestCase):
    """Test cases for Amenity model"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.amenity_data = {
            'name': 'WiFi'
        }
        self.amenity = Amenity(
            id=str(uuid.uuid4()),
            name=self.amenity_data['name']
        )

    def test_amenity_creation(self):
        """Test amenity creation with valid data"""
        self.assertIsInstance(self.amenity, Amenity)
        self.assertEqual(self.amenity.name, 'WiFi')
        self.assertIsNotNone(self.amenity.id)

    def test_amenity_attributes(self):
        """Test amenity attributes are correctly set"""
        self.assertTrue(hasattr(self.amenity, 'id'))
        self.assertTrue(hasattr(self.amenity, 'name'))
        self.assertEqual(self.amenity.name, 'WiFi')

    def test_amenity_update(self):
        """Test amenity update method"""
        update_data = {
            'name': 'Updated WiFi'
        }
        self.amenity.update(update_data)
        
        self.assertEqual(self.amenity.name, 'Updated WiFi')

    def test_amenity_id_unique(self):
        """Test that amenity IDs are unique"""
        amenity2 = Amenity(
            id=str(uuid.uuid4()),
            name='Air Conditioning'
        )
        self.assertNotEqual(self.amenity.id, amenity2.id)

    def test_amenity_name_required(self):
        """Test that amenity name is required"""
        self.assertIsNotNone(self.amenity.name)
        self.assertNotEqual(self.amenity.name, '')

    def test_amenity_string_representation(self):
        """Test amenity can be represented as string"""
        amenity_str = str(self.amenity.name)
        self.assertIn('WiFi', amenity_str)


class TestAmenityFacade(unittest.TestCase):
    """Test cases for Amenity operations through HBnBFacade"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.facade = HBnBFacade()
        self.amenity_data = {
            'name': 'Swimming Pool'
        }

    def test_create_amenity_facade(self):
        """Test amenity creation through facade"""
        amenity = self.facade.create_amenity(self.amenity_data)
        
        self.assertIsInstance(amenity, Amenity)
        self.assertEqual(amenity.name, 'Swimming Pool')
        self.assertIsNotNone(amenity.id)

    def test_get_amenity_facade(self):
        """Test getting amenity by ID through facade"""
        created_amenity = self.facade.create_amenity(self.amenity_data)
        retrieved_amenity = self.facade.get_amenity(created_amenity.id)
        
        self.assertEqual(created_amenity.id, retrieved_amenity.id)
        self.assertEqual(created_amenity.name, retrieved_amenity.name)

    def test_get_all_amenities_facade(self):
        """Test getting all amenities through facade"""
        # Create multiple amenities
        amenity1 = self.facade.create_amenity(self.amenity_data)
        
        amenity_data2 = {
            'name': 'Gym'
        }
        amenity2 = self.facade.create_amenity(amenity_data2)
        
        all_amenities = self.facade.get_all_amenities()
        
        self.assertGreaterEqual(len(all_amenities), 2)
        amenity_ids = [amenity.id for amenity in all_amenities]
        self.assertIn(amenity1.id, amenity_ids)
        self.assertIn(amenity2.id, amenity_ids)

    def test_update_amenity_facade(self):
        """Test updating amenity through facade"""
        created_amenity = self.facade.create_amenity(self.amenity_data)
        
        update_data = {
            'name': 'Updated Swimming Pool'
        }
        
        updated_amenity = self.facade.update_amenity(created_amenity.id, update_data)
        
        self.assertEqual(updated_amenity.name, 'Updated Swimming Pool')
        self.assertEqual(updated_amenity.id, created_amenity.id)

    def test_get_nonexistent_amenity(self):
        """Test getting an amenity that doesn't exist"""
        fake_id = str(uuid.uuid4())
        amenity = self.facade.get_amenity(fake_id)
        self.assertIsNone(amenity)

    def test_update_nonexistent_amenity(self):
        """Test updating an amenity that doesn't exist"""
        fake_id = str(uuid.uuid4())
        update_data = {'name': 'Updated Name'}
        
        # This should handle the case gracefully
        result = self.facade.update_amenity(fake_id, update_data)
        self.assertIsNone(result)

    def test_create_multiple_amenities_different_names(self):
        """Test creating multiple amenities with different names"""
        amenities_data = [
            {'name': 'WiFi'},
            {'name': 'Air Conditioning'},
            {'name': 'Parking'},
            {'name': 'Pet Friendly'}
        ]
        
        created_amenities = []
        for data in amenities_data:
            amenity = self.facade.create_amenity(data)
            created_amenities.append(amenity)
        
        self.assertEqual(len(created_amenities), 4)
        
        # Check all names are different
        names = [amenity.name for amenity in created_amenities]
        self.assertEqual(len(names), len(set(names)))  # All names should be unique
        
        # Check all IDs are different
        ids = [amenity.id for amenity in created_amenities]
        self.assertEqual(len(ids), len(set(ids)))  # All IDs should be unique

    def test_amenity_name_validation(self):
        """Test amenity name validation"""
        amenity = self.facade.create_amenity({'name': 'Test Amenity'})
        self.assertIsInstance(amenity.name, str)
        self.assertGreater(len(amenity.name), 0)


if __name__ == '__main__':
    unittest.main()