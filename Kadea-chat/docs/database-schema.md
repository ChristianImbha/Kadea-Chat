
erDiagram
    USERS ||--o{ CONVERSATIONS : "created_by"
    USERS ||--o{ CONVERSATION_MEMBERS : "user_id"
    CONVERSATIONS ||--o{ CONVERSATION_MEMBERS : "conversation_id"
    USERS ||--o{ MESSAGES : "user_id"
    CONVERSATIONS ||--o{ MESSAGES : "conversation_id"
    MESSAGES o|--o{ CONVERSATION_MEMBERS : "last_read_message_id"
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : "user_id"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "user_id"

    USERS {
        int id PK
        string full_name
        string email UK
        string password
        timestamp email_verified_at
        string avatar_path
        timestamp created_at
        timestamp updated_at
    }

    CONVERSATIONS {
        int id PK
        string type
        string name
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }

    CONVERSATION_MEMBERS {
        int id PK
        int conversation_id FK
        int user_id FK
        int last_read_message_id FK
        timestamp created_at
        timestamp updated_at
    }

    MESSAGES {
        int id PK
        int conversation_id FK
        int user_id FK
        text content
        boolean is_deleted
        timestamp created_at
        timestamp updated_at
    }

    EMAIL_VERIFICATION_TOKENS {
        int id PK
        int user_id FK
        string token_hash UK
        timestamp expires_at
        timestamp used_at
        timestamp created_at
        timestamp updated_at
    }

    PASSWORD_RESET_TOKENS {
        int id PK
        int user_id FK
        string token_hash UK
        timestamp expires_at
        timestamp used_at
        timestamp created_at
        timestamp updated_at
    }