from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('amenities', description='Endpoints pour les commodités')

amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Nom de la commodité')
})

@api.route('/')
class AmenityList(Resource):
    @api.expect(amenity_model, validate=True)
    @api.response(201, 'Commodité créée')
    def post(self):
        """Créer une nouvelle commodité"""
        data = api.payload
        new_amenity = facade.create_amenity(data)
        return vars(new_amenity), 201

    @api.response(200, 'Liste des commodités')
    def get(self):
        """Obtenir la liste de toutes les commodités"""
        return facade.get_all_amenities(), 200

@api.route('/<string:amenity_id>')
@api.param('amenity_id', 'ID de la commodité')
class AmenityResource(Resource):
    @api.response(200, 'Commodité trouvée')
    @api.response(404, 'Commodité non trouvée')
    def get(self, amenity_id):
        """Obtenir une commodité par ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Commodité non trouvée'}, 404
        return vars(amenity), 200

    @api.expect(amenity_model, validate=True)
    @api.response(200, 'Commodité mise à jour')
    @api.response(404, 'Commodité non trouvée')
    def put(self, amenity_id):
        """Mettre à jour une commodité"""
        updated = facade.update_amenity(amenity_id, api.payload)
        if not updated:
            return {'error': 'Commodité non trouvée'}, 404
        return updated, 200