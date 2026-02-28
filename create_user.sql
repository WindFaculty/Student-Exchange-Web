-- MySQL bootstrap script for Student Exchange backend
-- Run with a privileged account (e.g. root):
-- mysql -u root -p < create_user.sql

CREATE DATABASE IF NOT EXISTS student_exchange
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_vi_0900_ai_ci;

CREATE USER IF NOT EXISTS 'student_exchange_web'@'%'
  IDENTIFIED BY 'wind_faculty';

GRANT ALL PRIVILEGES ON student_exchange.* TO 'student_exchange_web'@'%';

FLUSH PRIVILEGES;
