const http = require('http');
const mysql = require('mysql2');

console.log("reload_db running");

// Make MySQL connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  multipleStatements: true,
});

// Get json
let url = "http://data.csail.mit.edu/im2recipe/recipes_with_nutritional_info.json";
url = "http://localhost:8080/";

console.log("Getting http request...");
http.get(url, (res) => {
  console.log("Http request recieved");

  let body = "";

  console.log("Loading data...");
  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Data loaded");

    console.log("Parsing json...");
    try {
      let json = JSON.parse(body);
      console.log("Json parsed");

      // Connect to MySQL
      console.log("Connecting to root@localhost...");
      con.connect((err) => {
        if (err) throw err;
        console.log("Connected to root@localhost");

        let sql = "";

        console.log("Creating database find_my_recipe...");
        sql = "CREATE DATABASE IF NOT EXISTS find_my_recipe; USE find_my_recipe";
        con.query(sql, (err, res) => {
          if (err) throw err;
          console.log("Database find_my_recipe created");

          console.log("Creating table ingredients...");
          sql =
          `CREATE TABLE IF NOT EXISTS ingredients (
            ingredient_id int NOT NULL AUTO_INCREMENT,
            name text,
            PRIMARY KEY (ingredient_id)
          ); TRUNCATE TABLE ingredients`;
          con.query(sql, (err, res) => {
            if (err) throw err;
            console.log("Table ingredients created");

            console.log("Inserting ingredients...");
            

            console.log("Creating table recipes...");
            sql =
            `CREATE TABLE IF NOT EXISTS recipes (
              recipe_id int NOT NULL AUTO_INCREMENT,
              title text,
              PRIMARY KEY (recipe_id)
            ); TRUNCATE TABLE recipes`;
            con.query(sql, (err, res) => {
              if (err) throw err;
              console.log("Table recipes created");

            });

            console.log("Creating table users...");
            sql =
            `CREATE TABLE IF NOT EXISTS users (
              user_id int NOT NULL AUTO_INCREMENT,
              password varchar(255) NOT NULL,
              PRIMARY KEY (user_id)
            ); TRUNCATE TABLE users`;
            con.query(sql, (err, res) => {
              if (err) throw err;
              console.log("Table users created");

              console.log("Creating table user_tags...");
              sql =
              `CREATE TABLE IF NOT EXISTS user_tags (
                id int NOT NULL AUTO_INCREMENT,
                tag text,
                PRIMARY KEY (id)
              ); TRUNCATE TABLE user_tags`;
              con.query(sql, (err, res) => {
                if (err) throw err;
                console.log("Table user_tags created");
              });

              console.log("Creating table user_ingredients...");
              sql =
              `CREATE TABLE IF NOT EXISTS user_ingredients (
                id int NOT NULL AUTO_INCREMENT,
                ingredient_id int NOT NULL,
                amount int,
                PRIMARY KEY (id),
                FOREIGN KEY (ingredient_id)
              ); TRUNCATE TABLE user_ingredients`;
              con.query(sql, (err, res) => {
                if (err) throw err;
                console.log("Table user_ingredients created");
              });
            });
          });
        });
      });
    }
    catch (error) {
      console.error(error.message);
    }
  });
}).on("error", (error) => {
  console.error(error.message);
});
