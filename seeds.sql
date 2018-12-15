USE bamazon_db;

INSERT INTO departments (name, overhead_costs) VALUES
("Books", 2000),
("Home & Kitchen", 8000),
("Entertainment", 15000),
("Video Games", 44000),
("Electronics", 50000),
("Clothes", 3000);

INSERT INTO products (department_id, name, price, quantity) VALUES
(1, "Harry Potter & The Prisoner of Azkaban",19.99, 250),
(1, "Catch 22", 22.45, 35),
(2, "Crockpot", 29.99, 33),
(2, "Instant Pot 3qt", 99, 8),
(3, "Lord of The Rings BluRay", 69.76, 44),
(3, "Titanic Bluray", 12.44, 28),
(4, "Red Dead Redemption 2", 29.99, 75),
(4, "Fortnite", 49.99, 3),
(5, "Xbox One S", 250, 8),
(5, "PS4", 229, 10),
(5, "Nintendo Switch", 159, 23),
(6, "NY I Love You T-Shirt", 9.99, 10),
(1, "Dairy of a Wimpy Kid - The Meltdown",9.62 , 45),
(2, "Humidifier", 19.99, 10),
(3, "Harry Potter DVD", 72, 49),
(4, "Minecraft", 34.99, 33),
(6, "Beach Shorts", 4.99, 26),
(6, "PJs", 29.99, 18),
(6, "Crocs", 14.99, 24),
(5, "Wii U", 129, 14),
(1, "The Happy Cookbook",29.99 , 20),
(1, "A Gentleman in Moscow", 22.68, 5),
(4, "God of War", 39.99, 25),
(2, "Table Lamp",10 , 4);