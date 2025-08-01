class Review:
    def __init__(self, id, text, rating, user_id, place_id):
        self.id = id
        self.text = text
        self.rating = self._validate_rating(rating)
        self.user_id = user_id
        self.place_id = place_id

    def _validate_rating(self, rating):
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return rating

    def update(self, data):
        for key, value in data.items():
            if key == 'rating':
                value = self._validate_rating(value)
            setattr(self, key, value)