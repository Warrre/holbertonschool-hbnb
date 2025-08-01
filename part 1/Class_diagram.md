```mermaid
classDiagram
  class BaseModel {
    + UUID id
    + DateTime created_at
    + DateTime updated_at
    + save()
    + delete()
  }

  class User {
    + string first_name
    + string last_name
    + string email
    + string password
    + boolean is_admin
    + login()
    + logout()
    + validate()
  }

  class Place {
    + string name
    + string description
    + float price
    + string address
    + int max_guests
    + UUID owner_id
    + publish()
    + search()
  }

  class Review {
    + UUID user_id
    + UUID place_id
    + int rating
    + string text
    + boolean verified
    + moderate()
  }

  class Amenity {
    + string name
    + string type
    + activate()
    + deactivate()
  }

  BaseModel <|-- User
  BaseModel <|-- Place
  BaseModel <|-- Review
  BaseModel <|-- Amenity

  User "1" --> "0..*" Place : owns
  User "1" --> "0..*" Review : creates  
  Place "1" --> "0..*" Review : receives
  Place "0..*" --> "0..*" Amenity : includes