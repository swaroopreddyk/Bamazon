DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE departments (
    department_id   INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30) NOT NULL,
    overhead_costs  DECIMAL(8, 2) NOT NULL,
    PRIMARY KEY (department_id)
);

CREATE TABLE products (
    item_id        INT AUTO_INCREMENT NOT NULL,
    department_id  INT NOT NULL,
    name   VARCHAR(100) NOT NULL,
    price          DECIMAL(8, 2) NOT NULL,
    quantity INT NOT NULL,
    sales  DECIMAL(8, 2) NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id)
);