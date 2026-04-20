-- Таблица откликов на лобби
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    lobby_id INT NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lobby_id) REFERENCES lobbies(id) ON DELETE CASCADE
);