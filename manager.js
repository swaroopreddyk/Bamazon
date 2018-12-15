const mysql = require('mysql');
const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');
const cTable = require('console.table');


// Create a local copy of items & departments
let items = {},
  departments = {};

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
  let sqlQuery = `select department_id, name from departments;
                  select item_id, name from products;`
  connection.query(sqlQuery, (error, results) => {
    try {
      if (error) {
        throw "Error: Creating a local copy failed.\n";
      } else if (results[0].length === 0) {
        throw "Error: Departments table is empty.\n";
      } else if (results[1].length === 0) {
        throw "Error: Products table is empty.\n";
      }

      results[0].forEach(element => {
        departments[element.name] = element.department_id;
      });

      results[1].forEach(element => {
        items[element.name] = element.item_id;
      });

    } catch (error) {
      console.log(chalk.red(error));
    }
  });
}

const viewProducts = () => {
  console.log("--- Available Items ---\n");

  const sqlQuery = 'SELECT p.item_id, d.name, p.name, p.price, p.quantity FROM products AS p INNER JOIN departments AS d ON p.department_id = d.department_id ORDER BY d.name, p.name';

  connection.query(sqlQuery, (error, results) => {
    try {
      if (error) throw `Error: Displaying products table failed.\n`;

      console.log(chalk.cyan(cTable.getTable(results)));
    } catch (error) {
      console.log(chalk.red(error));
    } finally {
      setTimeout(showMenu, 100);
    }
  });
};

const menuItems = {
  "Add a New Product": addProduct,
  "View Products for Sale": viewProducts,
  "Add to Inventory": addToInventory,
  "View Low Inventory": viewLowInventory,
  "Logoff": exitProgram
};

function addProduct() {
  inquirer.prompt([{
      "type": "list",
      "name": "departmentName",
      "message": "Select Department:",
      "choices": Object.keys(departments)
    }, {
      "type": "input",
      "name": "newProductName",
      "message": "Enter product name:",
      "validate": value => (value !== "")
    }, {
      "type": "input",
      "name": "newQty",
      "message": "Enter initial Quantity:",
      "validate": value => (value !== "" && !isNaN(value) && value >= 0)
    },
    {
      "type": "input",
      "name": "newPrice",
      "message": "Enter Price:",
      "validate": value => (value !== "" && !isNaN(value) && value >= 0)
    }
  ]).then(response => {
    let departmentID = departments[response.departmentName];
    let productName = response.newProductName;
    let productQty = response.newQty;
    let productPrice = response.newPrice;
    console.log(departmentID)

    const sqlQuery = `INSERT INTO products (department_id, name, price, quantity) values (${departmentID},"${productName}",${productPrice},${productQty})`

    connection.query(sqlQuery, (error, results) => {
      try {
        if (error) {
          throw `Error: Adding ${productName} failed.\n ${error}`;
        }

        console.log(chalk.yellow.bold(`\n ${productName} was successfully added`));
        updateLocal();
      } catch (error) {
        console.log(chalk.red(error));
      } finally {
        addAnotherProduct();
      }
    })
  })
}

const addAnotherProduct = () => {
  inquirer.prompt([{
    "type": "confirm",
    "name": "continue",
    "message": "Add another Product?",
    "default": true
  }]).then(response => {
    setTimeout(response.continue ? addProduct : showMenu, 100);
  });
}

function addToInventory() {
  inquirer.prompt([{
      "type": "list",
      "name": "productName",
      "message": "Select the item to update:",
      "choices": Object.keys(items)
    },
    {
      "type": "input",
      "name": "newQty",
      "message": "Update the inventory by:",
      "validate": value => (value !== "" && !isNaN(value))
    }
  ]).then(response => {
    let itemID = items[response.productName];

    const sqlQuery = `update products set quantity = quantity + ${response.newQty} where item_id = ${itemID};
                      select quantity from products where item_id = ${itemID}`;

    connection.query(sqlQuery, (error, results) => {
      try {
        if (error) throw `Error: Updating quantity for item # ${itemID} failed.\n`;

        console.log("\nThere are now " + chalk.green(results[1][0].quantity) + ` of ${response.productName} in stock`)
      } catch (error) {
        console.log(chalk.bold.red(error));
      } finally {
        setTimeout(showMenu, 1000);
      }
    })
  })

}

function viewLowInventory() {
  const sqlQuery = 'SELECT p.item_id, d.name, p.name, p.price, p.quantity FROM products AS p INNER JOIN departments AS d ON p.department_id = d.department_id where p.quantity < 5 ORDER BY p.item_id, d.name, p.name';

  connection.query(sqlQuery, (error, results) => {
    try {
      if (error) throw `Error: Displaying products table failed.\n`;

      console.log(chalk.blue(cTable.getTable(results)));
    } catch (error) {
      console.log(chalk.red(error));
    } finally {
      setTimeout(showMenu, 100);
    }
  });
}

function exitProgram() {
  clear();
  console.log("Thank you!\n");
  connection.end();
}

const showMenu = () => {
  inquirer.prompt([{
    "type": "list",
    "name": "choice",
    "message": "Select an option:",
    "choices": Object.keys(menuItems)
  }]).then(response => {
    menuItems[response.choice]();
  })
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
  console.log('Welcome Manager');
  connectToDB();
  setTimeout(showMenu, 100);
};

startApp();