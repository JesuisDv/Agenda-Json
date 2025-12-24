CREATE DATABASE appointment_manager;
USE appointment_manager;


CREATE TABLE `admins` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `appointments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum(pending,confirmed,canceled,completed) DEFAULT 'pending',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `blocked_slots` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `block_date` date NOT NULL,
  `block_time` time NOT NULL,
  `reason` varchar(100),
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX `appointments_index_0` ON `appointments` (`appointment_date`, `appointment_time`);

CREATE UNIQUE INDEX `blocked_slots_index_1` ON `blocked_slots` (`block_date`, `block_time`);
