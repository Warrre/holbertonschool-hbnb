import unittest
from app.models.user import User
from app.services.facade import HBnBFacade
import uuid


class TestUser(unittest.TestCase):
    """Test cases for User model"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User(
            id=str(uuid.uuid4()),
            email=self.user_data['email'],
            password=self.user_data['password'],
            first_name=self.user_data['first_name'],
            last_name=self.user_data['last_name']
        )

    def test_user_creation(self):
        """Test user creation with valid data"""
        self.assertIsInstance(self.user, User)
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.password, 'testpassword123')
        self.assertEqual(self.user.first_name, 'Test')
        self.assertEqual(self.user.last_name, 'User')
        self.assertIsNotNone(self.user.id)

    def test_user_update(self):
        """Test user update method"""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        self.user.update(update_data)
        
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        # Email should remain unchanged
        self.assertEqual(self.user.email, 'test@example.com')

    def test_user_email_validation(self):
        """Test that user email is properly set"""
        self.assertIn('@', self.user.email)
        self.assertTrue(self.user.email.endswith('.com'))

    def test_user_id_unique(self):
        """Test that user IDs are unique"""
        user2 = User(
            id=str(uuid.uuid4()),
            email='test2@example.com',
            password='password123',
            first_name='Test2',
            last_name='User2'
        )
        self.assertNotEqual(self.user.id, user2.id)


class TestUserFacade(unittest.TestCase):
    """Test cases for User operations through HBnBFacade"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.facade = HBnBFacade()
        self.user_data = {
            'email': 'facade@example.com',
            'password': 'facadepass123',
            'first_name': 'Facade',
            'last_name': 'Test'
        }

    def test_create_user_facade(self):
        """Test user creation through facade"""
        user = self.facade.create_user(self.user_data)
        
        self.assertIsInstance(user, User)
        self.assertEqual(user.email, 'facade@example.com')
        self.assertEqual(user.first_name, 'Facade')
        self.assertEqual(user.last_name, 'Test')
        self.assertIsNotNone(user.id)

    def test_get_user_facade(self):
        """Test getting user by ID through facade"""
        created_user = self.facade.create_user(self.user_data)
        retrieved_user = self.facade.get_user(created_user.id)
        
        self.assertEqual(created_user.id, retrieved_user.id)
        self.assertEqual(created_user.email, retrieved_user.email)

    def test_get_all_users_facade(self):
        """Test getting all users through facade"""
        # Create multiple users
        user1 = self.facade.create_user(self.user_data)
        
        user_data2 = {
            'email': 'second@example.com',
            'password': 'password123',
            'first_name': 'Second',
            'last_name': 'User'
        }
        user2 = self.facade.create_user(user_data2)
        
        all_users = self.facade.get_all_users()
        
        self.assertGreaterEqual(len(all_users), 2)
        user_ids = [user.id for user in all_users]
        self.assertIn(user1.id, user_ids)
        self.assertIn(user2.id, user_ids)

    def test_update_user_facade(self):
        """Test updating user through facade"""
        created_user = self.facade.create_user(self.user_data)
        
        update_data = {
            'first_name': 'UpdatedFacade',
            'last_name': 'UpdatedTest'
        }
        
        updated_user = self.facade.update_user(created_user.id, update_data)
        
        self.assertEqual(updated_user.first_name, 'UpdatedFacade')
        self.assertEqual(updated_user.last_name, 'UpdatedTest')
        # Email should remain unchanged
        self.assertEqual(updated_user.email, 'facade@example.com')

    def test_get_nonexistent_user(self):
        """Test getting a user that doesn't exist"""
        fake_id = str(uuid.uuid4())
        user = self.facade.get_user(fake_id)
        self.assertIsNone(user)

    def test_update_nonexistent_user(self):
        """Test updating a user that doesn't exist"""
        fake_id = str(uuid.uuid4())
        update_data = {'first_name': 'Test'}
        
        # This should handle the case gracefully
        result = self.facade.update_user(fake_id, update_data)
        self.assertIsNone(result)


if __name__ == '__main__':
    unittest.main()