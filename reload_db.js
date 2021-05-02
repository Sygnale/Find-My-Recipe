const http = require('http');
const mysql = require('mysql2');

async function get_json(url) {
  return new Promise((resolve, reject) => {
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
        let json;
        try {
          json = JSON.parse(body);
          console.log("Json parsed");
        }
        catch (err) {
          console.error(err.message);
        }
        resolve(json);
      });
    }).on("error", (err) => {
      console.error(err.message);
    });
  });
}

async function connect_mysql(con) {
  return new Promise((resolve, reject) => {
    console.log("Connecting to root@localhost...");
    con.connect((err) => {
      if (err) throw err;
      console.log("Connected to root@localhost");
      resolve();
    });
  });
}

async function create_db(con) {
  return new Promise((resolve, reject) => {
    console.log("Creating database find_my_recipe...");
    const sql = "CREATE DATABASE IF NOT EXISTS find_my_recipe; USE find_my_recipe";
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Database find_my_recipe created");
      resolve();
    });
  });
}

async function insert_ingredient(con, name) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ingredients (name) VALUES ('${name}')`;
    con.query(sql, (err, res) => {
      if (err && err.code !== "ER_DUP_ENTRY") throw err;
      resolve();
    });
  });
}

async function create_ingredients(con, json) {
  return new Promise((resolve, reject) => {
    console.log("Creating table ingredients...");
    const sql = `CREATE TABLE IF NOT EXISTS ingredients (
      ingredient_id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255),
      PRIMARY KEY (ingredient_id),
      UNIQUE (name)
    ); TRUNCATE TABLE ingredients`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table ingredients created");

      console.log("Inserting ingredients...");
      Promise.all(json.flatMap(async (recipe) => {
        recipe.ingredients.map(async (ingredient) => {
          await insert_ingredient(con, ingredient.text);
        });
      }));
      console.log("Ingredients inserted");
      resolve();
    });
  });
}

async function insert_recipe(con, title, url, fat, salt, saturates, sugars) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO recipes (title, url, fat, salt, saturates, sugars)
    VALUES ('${title}', '${url}', '${fat}', '${salt}', '${saturates}', '${sugars}')`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      resolve();
    });
  });
}

async function create_recipes(con, json) {
  return new Promise((resolve, reject) => {
    console.log("Creating table recipes...");
    const sql = `CREATE TABLE IF NOT EXISTS recipes (
      recipe_id INT NOT NULL AUTO_INCREMENT,
      title TEXT,
      url TEXT,
      fat ENUM('green', 'orange', 'red'),
      salt ENUM('green', 'orange', 'red'),
      saturates ENUM('green', 'orange', 'red'),
      sugars ENUM('green', 'orange', 'red'),
      PRIMARY KEY (recipe_id)
    ); TRUNCATE TABLE recipes`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table recipes created");

      console.log("Inserting recipes...");
      Promise.all(json.map((recipe) => {
        await insert_recipe(con, recipe.title, recipe.url,
          recipe.fsa_lights_per100g.fat,
          recipe.fsa_lights_per100g.salt,
          recipe.fsa_lights_per100g.saturates,
          recipe.fsa_lights_per100g.sugars
        );
      }));
      console.log("Recipes inserted");
      resolve();
    });
  });
}



async function create_users(con) {
  return new Promise((resolve, reject) => {
    console.log("Creating table users...");
    const sql = `CREATE TABLE IF NOT EXISTS users (
      user_id INT NOT NULL AUTO_INCREMENT,
      password VARCHAR(255) NOT NULL,
      PRIMARY KEY (user_id)
    ); TRUNCATE TABLE users`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table users created");
      resolve();
    });
  });
}

async function create_user_tags(con) {
  return new Promise((resolve, reject) => {
    console.log("Creating table user_tags...");
    const sql = `CREATE TABLE IF NOT EXISTS user_tags (
      id int NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      tag TEXT,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id)
    ); TRUNCATE TABLE user_tags`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table user_tags created");
      resolve();
    });
  });
}

async function create_user_ingredients(con) {
  return new Promise((resolve, reject) => {
    console.log("Creating table user_ingredients...");
    const sql = `CREATE TABLE IF NOT EXISTS user_ingredients (
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
}

async function reload_db() {
  console.log("reload_db running...");

  // Get json
  let url = "http://data.csail.mit.edu/im2recipe/recipes_with_nutritional_info.json";
  url = "http://localhost:8080/";
  let json = await get_json(url);

  // Connect to MySQL
  const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    multipleStatements: true,
  });
  await connect_mysql(con);

  // Reload database
  await create_db(con);
  create_users(con);
  create_user_tags(con);
  create_user_ingredients(con);
  Promise.all([
    await create_ingredients(con, json),
    await create_recipes(con, json)
  ]);
  

  console.log("reload_db finished successfully");
}

reload_db().catch((err) => {
  console.error(err.message);
});
