from flask_restx import Namespace, Resource, fields
from app.services.facade import HBnBFacade

api = Namespace('reviews', description='Endpoints for managing reviews')
facade = HBnBFacade()

review_model = api.model('Review', {
    'id': fields.String(readOnly=True, description='Unique review ID'),
    'text': fields.String(required=True, description='Review content'),
    'rating': fields.Integer(required=True, description='Rating (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})

@api.route('/')
class ReviewList(Resource):
    @api.marshal_list_with(review_model)
    def get(self):
        """Get all reviews"""
        return facade.get_all_reviews(), 200

    @api.expect(review_model, validate=True)
    @api.marshal_with(review_model, code=201)
    def post(self):
        """Create a new review"""
        data = api.payload
        review = facade.create_review(data)
        return review, 201

@api.route('/<string:review_id>')
class ReviewResource(Resource):
    @api.marshal_with(review_model)
    def get(self, review_id):
        """Get a review by its ID"""
        review = facade.get_review(review_id)
        if not review:
            api.abort(404, "Review not found")
        return review

    @api.expect(review_model, validate=True)
    @api.marshal_with(review_model)
    def put(self, review_id):
        """Update a review"""
        data = api.payload
        review = facade.update_review(review_id, data)
        if not review:
            api.abort(404, "Review not found")
        return review

    def delete(self, review_id):
        """Delete a review"""
        result = facade.delete_review(review_id)
        if not result:
            api.abort(404, "Review not found")
        return {'message': 'Review deleted'}, 200