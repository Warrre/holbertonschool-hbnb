class Amenity:
    def __init__(self, id, name):
        self.id = id
        self.name = name

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)