const mysql = require('mysql');
const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
  });
};

const menuItems = {
  "Create New Department": addDepartment,
  "View Product Sales By Department": viewSalesByDept,
  "Logoff": exitProgram
};

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

function addDepartment() {

  inquirer.prompt([{
    "type": "input",
    "name": "newDeptName",
    "message": "Enter Department name:",
    "validate": value => (value !== "")
  }, {
    "type": "input",
    "name": "overheadCosts",
    "message": "Enter overhead costs:",
    "validate": value => (value !== "" && !isNaN(value) && value >= 0)
  }]).then(response => {
    let deptName = response.newDeptName;
    let oc = response.overheadCosts;

    const sqlQuery = `INSERT INTO departments (name, overhead_costs) VALUES ("${deptName}",${oc});`

    connection.query(sqlQuery, (error, results) => {
      try {
        if (error) throw `Error: Adding ${deptName} failed.\n ${error}`;

        console.log(chalk.yellow.bold(`\n ${deptName} was successfully added.`));
      } catch (error) {
        console.log(chalk.red(error));
      } finally {
        addAnotherDepartment();
      }
    })
  })
}

const addAnotherDepartment = () => {
  inquirer.prompt([{
    "type": "confirm",
    "name": "continue",
    "message": "Add another Department?",
    "default": true
  }]).then(response => {
    setTimeout(response.continue ? addDepartment : showMenu, 100);
  });
}

function viewSalesByDept() {
  let sqlQuery =
    `select d.department_id, d.name as department_name, overhead_costs, sum(p.sales) as product_sales, (sum(p.sales) - overhead_costs) as total_profit 
  from departments d left join products p on d.department_id = p.department_id  
  group by d.department_id`;

  connection.query(sqlQuery, (error, results) => {
    try {
      if (error) {
        throw `Error: Something went wrong while calculating Department Sales.\n`;
      }

      if (results.length === 0) {
        console.log(chalk.cyan("There are no departments yet. Please create one now!\n"));
      } else {
        console.table(results);
      }
    } catch (error) {
      console.log(chalk.red(error));
    } finally {
      setTimeout(showMenu, 1500);
    }
  })
}

function exitProgram() {
  clear();
  console.log("Thank you!\n");
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
  console.log('Welcome Supervisor');
  connectToDB();
  setTimeout(showMenu, 100);
};

startApp();