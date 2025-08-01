from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade

api = Namespace('users', description='Operations related to users')

user_model = api.model('User', {
    'id': fields.String(readOnly=True, description='User ID'),
    'first_name': fields.String(required=True, description='User\'s first name'),
    'last_name': fields.String(required=True, description='User\'s last name'),
    'email': fields.String(required=True, description='User\'s email address'),
})

@api.route('/<string:user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Retrieve user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200

    @api.expect(user_model, validate=True)
    @api.response(200, 'User updated successfully')
    @api.response(404, 'User not found')
    def put(self, user_id):
        """Update user information"""
        user_data = request.json
        updated_user = facade.update_user(user_id, user_data)
        if not updated_user:
            return {'error': 'User not found'}, 404
        return updated_user, 200

@api.route('/')
class UserList(Resource):
    @api.response(200, 'User list retrieved successfully')
    def get(self):
        """Retrieve the list of all users"""
        users = facade.get_all_users()
        return users, 200

    @api.expect(user_model, validate=True)
    @api.response(201, 'User created successfully')
    @api.response(400, 'Invalid data')
    def post(self):
        """Create a new user"""
        user_data = request.json
        try:
            new_user = facade.create_user(user_data)
            return new_user, 201
        except ValueError as e:
            return {'error': str(e)}, 400