from flask_restx import Namespace, Resource, fields, reqparse
from app.services.facade import HBnBFacade

facade = HBnBFacade()
api = Namespace('places', description='Places management')

place_model = api.model('Place', {
    'id': fields.String(readOnly=True, description='Place ID'),
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(required=True, description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude'),
    'longitude': fields.Float(required=True, description='Longitude'),
    'owner_id': fields.String(required=True, description='Owner user ID'),
    'amenities': fields.List(fields.String, description='List of amenity IDs'),
})

update_parser = reqparse.RequestParser()
update_parser.add_argument('title', type=str)
update_parser.add_argument('description', type=str)
update_parser.add_argument('price', type=float)
update_parser.add_argument('latitude', type=float)
update_parser.add_argument('longitude', type=float)
update_parser.add_argument('amenities', type=str, action='append')

@api.route('/')
class PlaceList(Resource):
    @api.marshal_list_with(place_model)
    def get(self):
        """Return all places"""
        return facade.get_all_places()

    @api.expect(place_model, validate=True)
    @api.marshal_with(place_model, code=201)
    def post(self):
        """Create a new place"""
        data = api.payload
        if data.get('price', 0) <= 0:
            api.abort(400, "Price must be positive")
        if not (-90 <= data.get('latitude', 0) <= 90):
            api.abort(400, "Latitude must be between -90 and 90")
        if not (-180 <= data.get('longitude', 0) <= 180):
            api.abort(400, "Longitude must be between -180 and 180")
        owner = facade.get_user(data['owner_id'])
        if not owner:
            api.abort(400, "The specified owner does not exist")
        return facade.create_place(data), 201

@api.route('/<string:place_id>')
@api.param('place_id', 'Place identifier')
class PlaceResource(Resource):
    @api.marshal_with(place_model)
    def get(self, place_id):
        """Return a specific place"""
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")
        return place

    @api.expect(update_parser)
    @api.marshal_with(place_model)
    def put(self, place_id):
        """Update an existing place"""
        data = update_parser.parse_args()
        clean_data = {k: v for k, v in data.items() if v is not None}
        if 'price' in clean_data and clean_data['price'] <= 0:
            api.abort(400, "Price must be positive")
        if 'latitude' in clean_data and not (-90 <= clean_data['latitude'] <= 90):
            api.abort(400, "Latitude must be between -90 and 90")
        if 'longitude' in clean_data and not (-180 <= clean_data['longitude'] <= 180):
            api.abort(400, "Longitude must be between -180 and 180")
        place = facade.update_place(place_id, clean_data)
        if not place:
            api.abort(404, "Place not found")
        return place