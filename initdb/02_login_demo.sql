CREATE DATABASE IF NOT EXISTS login_demo;

USE login_demo;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passwords below are hashed with PHP's password_hash() (bcrypt) - see login_example2 for the plaintext values used to generate them
INSERT INTO users (username, password_hash) VALUES
('jsmith', '$2y$10$L6T4IlS/Y1FY8dtUerJ5He1romFYxh/XAoo3jmOeBHzxEfyfMSE8q'),
('agreen', '$2y$10$78nazAbvTTUnssPTgnaDHeeiZwVsZTjiFidty2fYyTHPH2OV3S9mi'),
('bwayne', '$2y$10$JyV9C84JjwkhTZp1XV.LsuMzqrTfWCQsHiLl30bo5HaSLUMAzXaSm');

-- Dedicated login for the app to use in its connection string - least privilege: read-only on this one table
CREATE USER IF NOT EXISTS 'login_demo_user'@'%' IDENTIFIED BY 'LoginDemo!2026';
GRANT SELECT ON login_demo.users TO 'login_demo_user'@'%';
FLUSH PRIVILEGES;
