const fs = require('fs');
const http = require('http');
const mysql = require('mysql2');
const csv=require('csv-parser');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  multipleStatements: true,
});

const conv = {
  'ounce': 0.028349,
  'pound': 0.4535,
  'g': 0.001,
  'kg': 1,
  'teaspoon': 0.00493,
  'tablespoon': 0.014787,
  'fl. oz': 0.029574,
  'cup': 0.2400,
  'pint': 0.4733,
  'quart': 0.9461,
  'gallon': 3.785,
  'bushel': 35.239,
  'ml': 0.001,
  'liter': 1,
  'shot': 0,
  'dash': 0,
  'drop': 0,
  'pinch': 0,
  'scoop': 0,
  'glass': 0,
};

function parse_quantity(quantity) {
  const dashSplit = quantity.split('-');
  const toSplit = dashSplit[0].split(' to ');
  const val = toSplit[0];
  const parts = val.split(' ');
  if (parts.length === 1)
    return eval(parts[0]);
  const intRe = /^[0-9]+$/;
  const fracRe = /^[0-9]+\/[0-9]+/;
  if (intRe.test(parts[0]) && fracRe.test(parts[1]))
    return parseInt(parts[0]) + eval(parts[1]);
  if (fracRe.test(parts[0]) && fracRe.test(parts[1]))
    return eval(parts[0]);
  if (intRe.test(parts[1]))
    return eval(parts[0]) * parseInt(parts[1]);
  return 0;
}

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

async function query_db(query, args) {
  return new Promise((resolve, reject) => {
    con.query(query, args, (err, res) => {
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
    min_si FLOAT(5),
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
    username TEXT,
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
    amount FLOAT(5),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  );
  CREATE TABLE IF NOT EXISTS user_favorite_recipes(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
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
    promises.push(query_db("INSERT INTO ingredients (name) VALUES (?);", [name]));
  }
  const n = json.length;
  for (let i = 0; i < n; i++) {
    const recipe = json[i];
    const id = i+1;
    const title = recipe.title;
    const url = recipe.url;
    const fat = recipe.fsa_lights_per100g.fat;
    const salt = recipe.fsa_lights_per100g.salt;
    const saturates = recipe.fsa_lights_per100g.saturates;
    const sugars = recipe.fsa_lights_per100g.sugars;
    let args = [title, url, fat, salt, saturates, sugars];
    promises.push(query_db("INSERT INTO recipes (title, url, fat, salt, saturates, sugars) VALUES (?, ?, ?, ?, ?, ?);", args));
    let l = recipe.ingredients.length;
    for (let j = 0; j < l; j++) {
      const ingredientName = recipe.ingredients[j].text;
      const quantity = recipe.quantity[j].text;
      const unit = recipe.unit[j].text
      const min_si = parse_quantity(quantity) * conv[unit];
      args = [id, ingredientName, quantity, unit, min_si];
      remaining_queries.push({
        query: `INSERT INTO recipe_ingredients
        SET recipe_id=?,
        ingredient_id=(SELECT id FROM ingredients WHERE name=? LIMIT 1),
        quantity=?,
        unit=?,
        min_si=?;`,
        args: args
      });
    }
    l = recipe.instructions.length;
    for (let j = 0; j < l; j++) {
      const stepNumber = j+1;
      const instruction = recipe.instructions[j].text;
      args = [id, stepNumber, instruction];
      remaining_queries.push({
        query: "INSERT INTO recipe_instructions SET recipe_id=?, step_number=?, instruction=?;",
        args: args
      });
    }
  }
  await Promise.all(promises);
  console.log("Ingredients and recipes added");
  return await remaining_queries;
}

async function fix_ingredients (){
  fs.createReadStream('ingredients.csv')
  .pipe(csv( {separator: ","}))
  .on('data', (row) => {
      let name=row.name.replace('\'','\\\'');
      let label=row.label.replace('\'','\\\'');
      let sql=`UPDATE ingredients SET name=\'${label}\' WHERE name=\'${name}\'`;
      console.log(sql);
      query(sql);
  })
  .on('end', () => {
  console.log('Ingredient names updated');
  });
}

async function reload_db() {
  console.log("reload_db running...");

  // Connect to MySQL
  await connect_mysql(con);

  // Get json
  //let url = "http://data.csail.mit.edu/im2recipe/recipes_with_nutritional_info.json";
  let path = "C:\\Users\\Emily\\Desktop\\recipes_with_nutritional_info.json";
  //let json = await download_json(url);
  let json = await load_json(path);

  // Reload database
  await create_db_and_tables();
  await insert_ingredients_and_recipes(json).then(async (remaining_queries) => {
    console.log("Adding recipe infomation...");
    let promises = [];
    for (const query of remaining_queries) {
      promises.push(query_db(query.query, query.args));
    }
    await Promise.all(promises);
    console.log("Recipe information added");
  });

  console.log("Updating ingredient names");
  await(fix_ingredients());

  console.log("reload_db finished successfully");
}

reload_db().catch((err) => {
  console.error(err.message);
});
