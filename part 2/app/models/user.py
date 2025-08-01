class User:
    def __init__(self, id, email, password, first_name, last_name):
        self.id = id
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)