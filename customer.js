const mysql = require('mysql');
const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Create a local copy of items (id)
let items;

const connection = mysql.createConnection({
  "host": "localhost",
  "port": 8889, //If executing on Windows please change to 3306
  "user": "root",
  "password": "root",
  "database": "bamazon_db",
  "multipleStatements": true
});

const connectToDB = () => {
  connection.connect(error => {
    try {
      if (error) throw "Error: Connection to bamazon_db failed.\n";
    } catch (error) {
      console.log(chalk.red(error));
    }
    updateLocal();
  });
};

const updateLocal = () => {
  connection.query("SELECT item_id FROM products", (error, results) => {
    try {
      if (error) {
        throw "Error: Creating a local copy failed.\n";
      } else if (results.length === 0) {
        throw "Error: products table is empty.\n";
      }
      items = results.map(r => r.item_id);
    } catch (error) {
      console.log(chalk.red(error));
    }
  });
}

const displayProducts = () => {
  console.log("--- Available Items ---\n");

  const sqlQuery = 'SELECT p.item_id, d.name, p.name, p.price, p.quantity FROM products AS p INNER JOIN departments AS d ON p.department_id = d.department_id ORDER BY d.name, p.name';

  connection.query(sqlQuery, (error, results) => {
    try {
      if (error) throw `Error: Displaying products table failed.\n`;

      console.log(chalk.cyan(cTable.getTable(results)));
    } catch (error) {
      console.log(chalk.red(error));
    }
  });
};

const showMenu = () => {
  inquirer.prompt([{
      "type": "input",
      "name": "productID",
      "message": "Enter product ID that you want to buy:",
      "validate": value => (value !== "" && !isNaN(value))
    },
    {
      "type": "input",
      "name": "buyQty",
      "message": "Enter the quantity that you want to buy:",
      "validate": value => (value !== "" && !isNaN(value))
    }
  ]).then(response => {
    let productID = parseInt(response.productID);
    let inputQuantity = parseInt(response.buyQty);

    updateDB(productID, inputQuantity);

  });
}

const updateDB = (productID, inputQuantity) => {
  let sqlQuery = `UPDATE products
  SET sales  = IF(quantity >= ${inputQuantity}, sales + (${inputQuantity} * price), sales),
  quantity = IF(quantity >= ${inputQuantity}, quantity - ${inputQuantity}, quantity)
  WHERE item_id = ${productID};

  SELECT name, price FROM products WHERE item_id = ${productID};`;


  connection.query(sqlQuery, (error, results) => {
    let productName = results[1][0].name;
    let price = results[1][0].price;
    let subtotal = inputQuantity * price;

    try {
      if (error) throw `Error: Updating item #${productID} failed.\n`;

      if (results[0].changedRows === 1) {
        console.log("\nCongratulations, you bought " + chalk.yellow.bold(`${inputQuantity} ${productName}'s`) + "!");
        console.log(`Subtotal: $${subtotal.toFixed(2)}\n`);
      } else if (inputQuantity > 0) {
        console.log("\nSorry, we do not have " + chalk.yellow.bold(`${inputQuantity} ${productName}'s`) + " in stock.\n");
      } else {
        console.log("\nThat's all right. No pressure to buy " + chalk.yellow.bold(`${productName}'s`) + " right now.\n");
      }
    } catch (error) {
      console.log(chalk.red(error));
    } finally {
      orderAgain();
    }
  });
}

const orderAgain = () => {
  inquirer.prompt([{
    "type": "confirm",
    "name": "continue",
    "message": "Buy another Product?",
    "default": true
  }]).then(response => {
    setTimeout(response.continue ? showMenu : endApp, 100);
  });
}

const endApp = () => {
  clear();
  console.log("Thank you for shopping with Bamazon!\n");
  connection.end();
}

const displayHeader = headerText => {
  console.log(
    chalk.blue.bold(
      figlet.textSync(headerText, {
        horizontalLayout: 'full'
      })
    )
  )
}

const startApp = () => {
  clear();
  displayHeader('BAMAZON');
  console.log('Welcome Customer');
  connectToDB();
  displayProducts();
  setTimeout(showMenu, 100);
};

startApp();