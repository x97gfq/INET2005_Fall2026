-- =============================================================================
--  Plaintext-password table for the INTENTIONALLY VULNERABLE login example
--  (www/login_example2_broken). Storing plaintext passwords is a bad practice
--  on its own; here it is deliberate so the password can be compared inside the
--  SQL query, which is what makes the classic auth-bypass injection possible.
--  The secure example (www/login_example2) uses bcrypt hashes in `users`.
-- =============================================================================

USE login_demo;

DROP TABLE IF EXISTS users_plaintext;

CREATE TABLE users_plaintext (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_plaintext (username, password) VALUES
('jsmith', 'password123'),
('agreen', 'letmein'),
('bwayne', 'batcave');

-- The app's existing least-privilege login also needs read access to this table
GRANT SELECT ON login_demo.users_plaintext TO 'login_demo_user'@'%';
FLUSH PRIVILEGES;
