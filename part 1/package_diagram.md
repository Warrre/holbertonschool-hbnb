```mermaid
graph TB
    subgraph PL["Presentation Layer"]
        API[API Services]
        UI[User Interface]
    end
    subgraph BL["Business Logic Layer"]
        Facade[Facade Pattern]
        Models[Business Models]
        Services[Business Services]
    end
    subgraph DL["Persistence Layer"]
        Repo[Repositories]
        DB[Database]
    end
    API --> Facade
    UI --> Facade
    Facade --> Models
    Facade --> Services
    Models --> Repo
    Services --> Repo
    Repo --> DB