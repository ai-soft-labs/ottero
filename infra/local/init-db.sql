-- Create database and user for local development
CREATE DATABASE IF NOT EXISTS quickledger;
CREATE USER IF NOT EXISTS 'QuickLedger'@'%' IDENTIFIED BY 'Password123!';
GRANT ALL PRIVILEGES ON quickledger.* TO 'QuickLedger'@'%';
FLUSH PRIVILEGES;

-- Usage:
-- docker exec -i <container> mysql -u root -prootpassword < infra/local/init-db.sql
