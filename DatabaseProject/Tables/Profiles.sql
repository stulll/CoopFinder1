-- Таблица профилей игроков
CREATE TABLE profiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    games NVARCHAR(MAX), -- JSON
    role NVARCHAR(50),
    rank NVARCHAR(50),
    goal NVARCHAR(50),
    platform NVARCHAR(50),
    language NVARCHAR(50),
    about NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);