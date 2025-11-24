from app.models.base_model import BaseModel

class User(BaseModel):
    """User model with deferred column definitions."""
    __tablename__ = 'users'
    
    def __init_subclass__(cls, **kwargs):
        """Set up SQLAlchemy columns when the class is first used."""
        super().__init_subclass__(**kwargs)
        
    def __new__(cls, *args, **kwargs):
        # Set up columns on first instantiation if not already done
        if not hasattr(cls, '_columns_initialized'):
            cls._setup_columns()
            cls._columns_initialized = True
        return super().__new__(cls, *args, **kwargs)
    
    @classmethod
    def _setup_columns(cls):
        """Set up SQLAlchemy columns with late import."""
        from app import db, bcrypt
        
        # Define columns
        cls.first_name = db.Column(db.String(50), nullable=False)
        cls.last_name = db.Column(db.String(50), nullable=False) 
        cls.email = db.Column(db.String(120), unique=True, nullable=False)
        cls.password = db.Column(db.String(128), nullable=False)
        cls.is_admin = db.Column(db.Boolean, default=False)
        
        # Store bcrypt reference for instance methods
        cls._bcrypt = bcrypt
    
    def hash_password(self, password):
        """Hash the password using available bcrypt implementation.

        Supports both Flask-Bcrypt (generate_password_hash) and raw bcrypt (hashpw).
        """
        if hasattr(self._bcrypt, 'generate_password_hash'):
            # Flask-Bcrypt
            self.password = self._bcrypt.generate_password_hash(password).decode('utf-8')
        else:
            # fallback to plain bcrypt API
            self.password = self._bcrypt.hashpw(password.encode('utf-8'), self._bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password):
        """Verify the password using available bcrypt implementation.

        Supports both Flask-Bcrypt (check_password_hash) and raw bcrypt (checkpw).
        """
        if not self.password:
            return False
        if hasattr(self._bcrypt, 'check_password_hash'):
            return self._bcrypt.check_password_hash(self.password, password)
        else:
            return self._bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    # Backwards-compatible alias expected by some modules
    def check_password(self, password):
        return self.verify_password(password)
    
    def to_dict(self):
        """Return a dictionary representation of the user."""
        result = super().to_dict()
        # Remove password from dictionary for security
        result.pop('password', None)
        return result
