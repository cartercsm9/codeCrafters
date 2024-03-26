CREATE DATABASE IF NOT EXISTS weatherappdb;
USE weatherappdb;

CREATE USER IF NOT EXISTS 'testuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'rootpw';
GRANT ALL PRIVILEGES ON weatherappdb.* TO 'testuser'@'localhost';
FLUSH PRIVILEGES;


DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS weather_data;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weather_data (
    weather_id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    forecast_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    temperature DECIMAL(5, 2) NOT NULL,
    weather_description TEXT NOT NULL,
    icon VARCHAR(255),
    humidity DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE weather_data ADD UNIQUE(city, forecast_date);

CREATE TABLE user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferred_city VARCHAR(255),
    temperature_unit CHAR(1),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    CHECK (temperature_unit IN ('C', 'F')) -- 'C' for Celsius, 'F' for Fahrenheit
);


