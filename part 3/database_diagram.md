# Database Schema Diagram

```mermaid
erDiagram
    User {
        string id PK
        string first_name
        string last_name
        string email
        string password
        boolean is_admin
    }
    
    Place {
        string id PK
        string title
        string description
        float price
        float latitude
        float longitude
        string owner_id FK
    }
    
    Review {
        string id PK
        string text
        integer rating
        string user_id FK
        string place_id FK
    }
    
    Amenity {
        string id PK
        string name
    }
    
    Place_Amenity {
        string place_id FK
        string amenity_id FK
    }
    
    User ||--o{ Place : owns
    Place ||--o{ Review : has
    User ||--o{ Review : writes
    Place }o--o{ Amenity : includes
```