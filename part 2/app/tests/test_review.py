import unittest
from app.models.review import Review
from app.models.place import Review
from app.models.user import User
from app.models.place import Place  
from app.services.facade import HBnBFacade
import uuid


class TestReview(unittest.TestCase):
    """Test cases for Review model"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.review_data = {
            'text': 'Great place to stay!',
            'rating': 5,
            'user_id': str(uuid.uuid4()),
            'place_id': str(uuid.uuid4())
        }
        self.review = Review(
            id=str(uuid.uuid4()),
            text=self.review_data['text'],
            rating=self.review_data['rating'],
            user_id=self.review_data['user_id'],
            place_id=self.review_data['place_id']
        )

    def test_review_creation(self):
        """Test review creation with valid data"""
        self.assertIsInstance(self.review, Review)
        self.assertEqual(self.review.text, 'Great place to stay!')
        self.assertEqual(self.review.rating, 5)
        self.assertIsNotNone(self.review.id)
        self.assertIsNotNone(self.review.user_id)
        self.assertIsNotNone(self.review.place_id)

    def test_review_attributes(self):
        """Test review attributes are correctly set"""
        self.assertTrue(hasattr(self.review, 'id'))
        self.assertTrue(hasattr(self.review, 'text'))
        self.assertTrue(hasattr(self.review, 'rating'))
        self.assertTrue(hasattr(self.review, 'user_id'))
        self.assertTrue(hasattr(self.review, 'place_id'))

    def test_review_rating_validation_valid(self):
        """Test review rating validation with valid ratings"""
        for rating in [1, 2, 3, 4, 5]:
            review = Review(
                id=str(uuid.uuid4()),
                text='Test review',
                rating=rating,
                user_id=str(uuid.uuid4()),
                place_id=str(uuid.uuid4())
            )
            self.assertEqual(review.rating, rating)

    def test_review_rating_validation_invalid_low(self):
        """Test review rating validation with invalid low rating"""
        with self.assertRaises(ValueError):
            Review(
                id=str(uuid.uuid4()),
                text='Test review',
                rating=0,  # Invalid rating
                user_id=str(uuid.uuid4()),
                place_id=str(uuid.uuid4())
            )

    def test_review_rating_validation_invalid_high(self):
        """Test review rating validation with invalid high rating"""
        with self.assertRaises(ValueError):
            Review(
                id=str(uuid.uuid4()),
                text='Test review',
                rating=6,  # Invalid rating
                user_id=str(uuid.uuid4()),
                place_id=str(uuid.uuid4())
            )

    def test_review_update(self):
        """Test review update method"""
        update_data = {
            'text': 'Updated review text',
            'rating': 4
        }
        self.review.update(update_data)
        
        self.assertEqual(self.review.text, 'Updated review text')
        self.assertEqual(self.review.rating, 4)

    def test_review_update_with_validation(self):
        """Test review update with validation"""
        with self.assertRaises(ValueError):
            self.review.update({'rating': 0})

    def test_review_text_content(self):
        """Test review text content"""
        self.assertIsInstance(self.review.text, str)
        self.assertGreater(len(self.review.text), 0)

    def test_review_id_unique(self):
        """Test that review IDs are unique"""
        review2 = Review(
            id=str(uuid.uuid4()),
            text='Another review',
            rating=3,
            user_id=str(uuid.uuid4()),
            place_id=str(uuid.uuid4())
        )
        self.assertNotEqual(self.review.id, review2.id)


class TestReviewFacade(unittest.TestCase):
    """Test cases for Review operations through HBnBFacade"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.facade = HBnBFacade()
        
        # Create a user first (required for review creation)
        self.user_data = {
            'email': 'reviewer@example.com',
            'password': 'password123',
            'first_name': 'Jane',
            'last_name': 'Reviewer'
        }
        self.user = self.facade.create_user(self.user_data)
        
        # Create an owner for the place
        self.owner_data = {
            'email': 'owner@example.com',
            'password': 'password123',
            'first_name': 'John',
            'last_name': 'Owner'
        }
        self.owner = self.facade.create_user(self.owner_data)
        
        # Create a place (required for review creation)
        self.place_data = {
            'title': 'Test Place for Review',
            'description': 'A place to review',
            'price': 100.0,
            'latitude': 40.7128,
            'longitude': -74.0060,
            'owner_id': self.owner.id,
            'amenities': []
        }
        self.place = self.facade.create_place(self.place_data)
        
        self.review_data = {
            'text': 'Excellent place!',
            'rating': 5,
            'user_id': self.user.id,
            'place_id': self.place['id']
        }

    def test_create_review_facade(self):
        """Test review creation through facade"""
        review = self.facade.create_review(self.review_data)
        
        self.assertIsInstance(review, Review)
        self.assertEqual(review.text, 'Excellent place!')
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.user_id, self.user.id)
        self.assertEqual(review.place_id, self.place['id'])
        self.assertIsNotNone(review.id)

    def test_get_review_facade(self):
        """Test getting review by ID through facade"""
        created_review = self.facade.create_review(self.review_data)
        retrieved_review = self.facade.get_review(created_review.id)
        
        self.assertEqual(created_review.id, retrieved_review.id)
        self.assertEqual(created_review.text, retrieved_review.text)
        self.assertEqual(created_review.rating, retrieved_review.rating)

    def test_get_all_reviews_facade(self):
        """Test getting all reviews through facade"""
        review1 = self.facade.create_review(self.review_data)
        
        review_data2 = {
            'text': 'Good place',
            'rating': 4,
            'user_id': self.user.id,
            'place_id': self.place['id']
        }
        review2 = self.facade.create_review(review_data2)
        
        all_reviews = self.facade.get_all_reviews()
        
        self.assertGreaterEqual(len(all_reviews), 2)
        review_ids = [review.id for review in all_reviews]
        self.assertIn(review1.id, review_ids)
        self.assertIn(review2.id, review_ids)

    def test_update_review_facade(self):
        """Test updating review through facade"""
        created_review = self.facade.create_review(self.review_data)
        
        update_data = {
            'text': 'Updated excellent place!',
            'rating': 4
        }
        
        updated_review = self.facade.update_review(created_review.id, update_data)
        
        self.assertEqual(updated_review.text, 'Updated excellent place!')
        self.assertEqual(updated_review.rating, 4)
        self.assertEqual(updated_review.id, created_review.id)

    def test_get_reviews_by_place_facade(self):
        """Test getting reviews by place through facade"""
        review1 = self.facade.create_review(self.review_data)
        
        review_data2 = {
            'text': 'Another review for same place',
            'rating': 3,
            'user_id': self.user.id,
            'place_id': self.place['id']
        }
        review2 = self.facade.create_review(review_data2)
        
        place_reviews = self.facade.get_reviews_by_place(self.place['id'])
        
        self.assertGreaterEqual(len(place_reviews), 2)
        place_review_ids = [review.id for review in place_reviews]
        self.assertIn(review1.id, place_review_ids)
        self.assertIn(review2.id, place_review_ids)

    def test_create_review_invalid_rating(self):
        """Test creating review with invalid rating"""
        invalid_review_data = self.review_data.copy()
        invalid_review_data['rating'] = 6
        
        with self.assertRaises(ValueError):
            self.facade.create_review(invalid_review_data)

    def test_get_nonexistent_review(self):
        """Test getting a review that doesn't exist"""
        fake_id = str(uuid.uuid4())
        review = self.facade.get_review(fake_id)
        self.assertIsNone(review)

    def test_update_nonexistent_review(self):
        """Test updating a review that doesn't exist"""
        fake_id = str(uuid.uuid4())
        update_data = {'text': 'Updated text'}
        
        result = self.facade.update_review(fake_id, update_data)
        self.assertIsNone(result)

    def test_delete_review_facade(self):
        """Test deleting review through facade"""
        created_review = self.facade.create_review(self.review_data)
        
        # Delete the review
        result = self.facade.delete_review(created_review.id)
        self.assertTrue(result)
        
        # Verify it's deleted
        deleted_review = self.facade.get_review(created_review.id)
        self.assertIsNone(deleted_review)


if __name__ == '__main__':
    unittest.main()