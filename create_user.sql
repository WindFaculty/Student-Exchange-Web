-- MySQL bootstrap script for Student Exchange backend
-- Run with a privileged account (e.g. root):
-- mysql -u root -p < create_user.sql

CREATE DATABASE IF NOT EXISTS student_exchange
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_vi_0900_ai_ci;

-- Ensure both host variants exist. Local JDBC connections usually resolve to 'localhost'.
CREATE USER IF NOT EXISTS 'student_exchange_web'@'localhost'
  IDENTIFIED BY 'wind_faculty';
CREATE USER IF NOT EXISTS 'student_exchange_web'@'%'
  IDENTIFIED BY 'wind_faculty';

-- Force expected default credentials even if accounts already existed.
ALTER USER 'student_exchange_web'@'localhost'
  IDENTIFIED BY 'wind_faculty';
ALTER USER 'student_exchange_web'@'%'
  IDENTIFIED BY 'wind_faculty';

GRANT ALL PRIVILEGES ON student_exchange.* TO 'student_exchange_web'@'localhost';
GRANT ALL PRIVILEGES ON student_exchange.* TO 'student_exchange_web'@'%';

FLUSH PRIVILEGES;
