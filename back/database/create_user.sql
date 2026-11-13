CREATE DATABASE IF NOT EXISTS braytech_todo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'braytech_app'@'localhost'
  IDENTIFIED BY 'Braytech';

ALTER USER 'braytech_app'@'localhost'
  IDENTIFIED BY 'Braytech';

GRANT ALL PRIVILEGES ON braytech_todo.*
  TO 'braytech_app'@'localhost';

FLUSH PRIVILEGES;