const fs = require('fs');
const http = require('http');
const mysql = require('mysql2');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  multipleStatements: true,
});

async function download_json(url) {
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

async function load_json(path) {
  return new Promise((resolve, reject) => {
    console.log("Getting json...");
    fs.readFile(path, (err, data) => {
      if (err) throw err;
      console.log("Got json");
      resolve(JSON.parse(data));
    });
  });
}

async function connect_mysql() {
  return new Promise((resolve, reject) => {
    console.log("Connecting to root@localhost...");
    con.connect((err) => {
      if (err) throw err;
      console.log("Connected to root@localhost");
      resolve();
    });
  });
}

async function query_db(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, res) => {
      if (err) throw err;
      resolve();
    });
  });
}

async function create_db_and_tables() {
  console.log("Creating database find_my_recipe...");
  const sql = `DROP DATABASE IF EXISTS find_my_recipe;
  CREATE DATABASE find_my_recipe;
  USE find_my_recipe;
  CREATE TABLE ingredients (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (name)
  );
  CREATE TABLE recipes (
    id INT NOT NULL AUTO_INCREMENT,
    title TEXT,
    url TEXT,
    fat ENUM('green', 'orange', 'red'),
    salt ENUM('green', 'orange', 'red'),
    saturates ENUM('green', 'orange', 'red'),
    sugars ENUM('green', 'orange', 'red'),
    PRIMARY KEY (id)
  );
  CREATE TABLE recipe_ingredients (
    id INT NOT NULL AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity TEXT,
    unit TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  );
  CREATE TABLE recipe_instructions (
    id INT NOT NULL AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    step_number INT,
    instruction TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
  );
  CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );
  CREATE TABLE user_tags (
    id int NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    tag TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE user_ingredients (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    amount INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  );`;
  await query_db(sql);
  console.log("Database find_my_recipe created");
}

async function insert_ingredients_and_recipes(json) {
  console.log("Adding ingredients and recipes...");
  const ingredient_set = new Set();
  for (const recipe of json) {
    for (const ingredient of recipe.ingredients) {
      ingredient_set.add(ingredient.text);
    }
  }
  let promises = [];
  let remaining_queries = [];
  for (let name of ingredient_set.values()) {
    name = name.replace(/'/g, "''");
    promises.push(query_db(`INSERT INTO ingredients (name) VALUES ('${name}');`));
  }
  const n = json.length;
  for (let i = 0; i < n; i++) {
    const recipe = json[i];
    const id = i+1;
    const title = recipe.title.replace(/'/g, "''");
    const url = recipe.url.replace(/'/g, "''");
    const fat = recipe.fsa_lights_per100g.fat;
    const salt = recipe.fsa_lights_per100g.salt;
    const saturates = recipe.fsa_lights_per100g.saturates;
    const sugars = recipe.fsa_lights_per100g.sugars;
    promises.push(query_db(`INSERT INTO recipes (title, url, fat, salt, saturates, sugars) VALUES ('${title}', '${url}', '${fat}', '${salt}', '${saturates}', '${sugars}');`));
    let l = recipe.ingredients.length;
    for (let j = 0; j < l; j++) {
      const ingredientName = recipe.ingredients[j].text.replace(/'/g, "''");
      const quantity = recipe.quantity[j].text;
      const unit = recipe.unit[j].text
      remaining_queries.push(`INSERT INTO recipe_ingredients SET recipe_id=${id}, ingredient_id=(SELECT id FROM ingredients WHERE name='${ingredientName}' LIMIT 1), quantity='${quantity}', unit='${unit}';`);
    }
    l = recipe.instructions.length;
    for (let j = 0; j < l; j++) {
      const stepNumber = j+1;
      const instruction = recipe.instructions[j].text.replace(/'/g, "''");
      remaining_queries.push(`INSERT INTO recipe_instructions SET recipe_id=${id}, step_number=${stepNumber}, instruction='${instruction}';`);
    }
  }
  await Promise.all(promises);
  console.log("Ingredients and recipes added");
  return await remaining_queries;
}

async function reload_db() {
  console.log("reload_db running...");

  // Connect to MySQL
  await connect_mysql(con);

  // Get json
  let url = "http://data.csail.mit.edu/im2recipe/recipes_with_nutritional_info.json";
  let path = "C:\\Users\\tedzy\\Documents\\Notepad\\find my recipe testing\\recipes_with_nutritional_info.json";
  // let json = await download_json(url);
  let json = await load_json(path);

  // Reload database
  await create_db_and_tables();
  await insert_ingredients_and_recipes(json).then(async (remaining_queries) => {
    console.log("Adding recipe infomation...");
    await Promise.all(remaining_queries.map((query) => {query_db(query);}));
    console.log("Recipe information added");
  });

  console.log("reload_db finished successfully");
}

reload_db().catch((err) => {
  console.error(err.message);
});
