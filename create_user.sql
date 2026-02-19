USE master;
GO

-- 1. Create Login (Server Level)
-- Check if login exists, if not create it
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'student_exchange_web')
BEGIN
    CREATE LOGIN student_exchange_web WITH PASSWORD = 'wind_faculty', CHECK_POLICY = OFF;
END
GO

-- 2. Create Database (if not exists)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'student_exchange')
BEGIN
    CREATE DATABASE student_exchange;
END
GO

USE student_exchange;
GO

-- 3. Create User (Database Level)
-- Check if user exists in this database, if not create it
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'student_exchange_web')
BEGIN
    CREATE USER student_exchange_web FOR LOGIN student_exchange_web;
END
GO

-- 4. Grant Permissions
-- Add user to db_owner role to ensure they can create tables and read/write data
ALTER ROLE db_owner ADD MEMBER student_exchange_web;
GO
