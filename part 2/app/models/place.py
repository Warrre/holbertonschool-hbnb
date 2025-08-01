from app.models.review import Review

# models/place.py - Updated Place model
class Place:
    def __init__(self, id, title, description, price, latitude, longitude, owner_id, amenities=None):
        self.id = id
        self.title = title
        self.description = description
        self.price = self._validate_price(price)
        self.latitude = self._validate_latitude(latitude)
        self.longitude = self._validate_longitude(longitude)
        self.owner_id = owner_id
        self.amenities = amenities or []
        self.reviews = []  # List of reviews for this place

    def _validate_price(self, price):
        """Validate that the price is positive"""
        if price < 0:
            raise ValueError("Price must be positive")
        return price

    def _validate_latitude(self, latitude):
        """Validate that latitude is between -90 and 90"""
        if not -90 <= latitude <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return latitude

    def _validate_longitude(self, longitude):
        """Validate that longitude is between -180 and 180"""
        if not -180 <= longitude <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return longitude

    def update(self, data):
        """Update the attributes of the place"""
        for key, value in data.items():
            if key == 'price':
                value = self._validate_price(value)
            elif key == 'latitude':
                value = self._validate_latitude(value)
            elif key == 'longitude':
                value = self._validate_longitude(value)
            setattr(self, key, value)

    def add_review(self, review):
        """Add a review to this place"""
        self.reviews.append(review)

    def remove_review(self, review_id):
        """Remove a review from this place"""
        self.reviews = [r for r in self.reviews if r.id != review_id]