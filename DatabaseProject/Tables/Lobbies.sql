-- Таблица лобби
CREATE TABLE lobbies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    leader_id INT NOT NULL,
    game NVARCHAR(100) NOT NULL,
    role_needed NVARCHAR(50) NOT NULL,
    goal NVARCHAR(50),
    description NVARCHAR(MAX),
    platform NVARCHAR(50),
    max_players INT DEFAULT 1,
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);