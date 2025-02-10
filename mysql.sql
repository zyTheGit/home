-- Adminer 4.8.1 MySQL 8.0.41 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `house`;
CREATE TABLE `house` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `baseRent` decimal(10,2) NOT NULL,
  `waterRate` decimal(10,2) NOT NULL,
  `electricityRate` decimal(10,2) NOT NULL,
  `area` decimal(10,2) NOT NULL,
  `status` enum('available','rented','maintenance') NOT NULL DEFAULT 'available',
  `description` text,
  `amenities` text NOT NULL,
  `initialWaterReading` decimal(10,2) NOT NULL DEFAULT '0.00',
  `initialElectricityReading` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tenantId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_77a424a7f436f2941836c9ce00` (`tenantId`),
  CONSTRAINT `FK_77a424a7f436f2941836c9ce002` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `house` (`id`, `title`, `address`, `baseRent`, `waterRate`, `electricityRate`, `area`, `status`, `description`, `amenities`, `initialWaterReading`, `initialElectricityReading`, `tenantId`) VALUES
(1,	'301',	'301',	400.00,	3.00,	1.00,	14.00,	'available',	'',	'',	0.00,	0.00,	NULL),
(2,	'302',	'302',	400.00,	3.00,	1.00,	14.00,	'available',	'',	'',	0.00,	0.00,	NULL);

DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `waterUsage` decimal(10,2) DEFAULT NULL,
  `electricityUsage` decimal(10,2) DEFAULT NULL,
  `previousWaterUsage` decimal(10,2) DEFAULT NULL,
  `previousElectricityUsage` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `baseRent` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `houseId` int NOT NULL,
  `tenantId` int DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_530c59f052cc57ce0972b3c96e2` (`houseId`),
  KEY `FK_6959c37c3acf0832103a2535703` (`tenantId`),
  CONSTRAINT `FK_530c59f052cc57ce0972b3c96e2` FOREIGN KEY (`houseId`) REFERENCES `house` (`id`),
  CONSTRAINT `FK_6959c37c3acf0832103a2535703` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `tenant`;
CREATE TABLE `tenant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `idCard` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `emergencyContact` varchar(255) DEFAULT NULL,
  `emergencyPhone` varchar(255) DEFAULT NULL,
  `houseId` int DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8e1f623798118e629b46a9e629` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user` (`id`, `phone`, `password`, `name`, `role`) VALUES
(1,	'admin',	'$2a$10$JiH0UF0/TAX6mxeY38EBKuMkZ5JDNtGiGS.Mm/Ga3FqJOky36BHUO',	'超级管理员',	'admin');

-- 2025-02-10 08:48:49