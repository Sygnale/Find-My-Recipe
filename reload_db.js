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
    const sql = `DROP DATABASE IF EXISTS find_my_recipe;
    CREATE DATABASE find_my_recipe;
    USE find_my_recipe`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Database find_my_recipe created");
      resolve();
    });
  });
}

async function insert_ingredient(con, name) {
  return new Promise((resolve, reject) => {
    name = name.replace(/'/g, "''");
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
    const sql = `CREATE TABLE ingredients (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255),
      PRIMARY KEY (id),
      UNIQUE (name)
    )`;
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
    title = title.replace(/'/g, "''");
    url = url.replace(/'/g, "''");
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
    const sql = `CREATE TABLE recipes (
      id INT NOT NULL AUTO_INCREMENT,
      title TEXT,
      url TEXT,
      fat ENUM('green', 'orange', 'red'),
      salt ENUM('green', 'orange', 'red'),
      saturates ENUM('green', 'orange', 'red'),
      sugars ENUM('green', 'orange', 'red'),
      PRIMARY KEY (id)
    )`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table recipes created");

      console.log("Inserting recipes...");
      Promise.all(json.map(async (recipe) => {
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

async function insert_recipe_ingredient(con, recipeTitle, ingredientName, quantity, unit) {
  return new Promise((resolve, reject) => {
    recipeTitle = recipeTitle.replace(/'/g, "''");
    ingredientName = ingredientName.replace(/'/g, "''");
    const sql = `INSERT INTO recipe_ingredients
    SET recipe_id=(SELECT id FROM recipes WHERE title='${recipeTitle}' LIMIT 1),
    ingredient_id=(SELECT id FROM ingredients WHERE name='${ingredientName}'),
    quantity='${quantity}',
    unit='${unit}'`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      resolve();
    });
  });
}

async function create_recipe_ingredients(con, json) {
  return new Promise((resolve, reject) => {
    console.log("Creating table recipe_ingredients...");
    const sql = `CREATE TABLE recipe_ingredients (
      id INT NOT NULL AUTO_INCREMENT,
      recipe_id INT NOT NULL,
      ingredient_id INT NOT NULL,
      quantity TEXT,
      unit TEXT,
      PRIMARY KEY (id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    )`;
    con.query(sql, async (err, res) => {
      if (err) throw err;
      console.log("Table recipe_ingredients created");

      console.log("Inserting recipe ingredients...");
      let insert_recipe_ingredients = [];
      for (const recipe of json) {
        const n = recipe.ingredients.length;
        for (let i = 0; i < n; i++) {
          insert_recipe_ingredients.push(
            insert_recipe_ingredient(con, recipe.title,
              recipe.ingredients[i].text,
              recipe.quantity[i].text,
              recipe.unit[i].text)
          );
        }
      }
      await Promise.all(insert_recipe_ingredients);
      console.log("Recipe ingredients inserted");
      resolve();
    });
  });
}

async function insert_recipe_instruction(con, recipeTitle, stepNumber, instruction) {
  return new Promise((resolve, reject) => {
    recipeTitle = recipeTitle.replace(/'/g, "''");
    instruction = instruction.replace(/'/g, "''");
    const sql = `INSERT INTO recipe_instructions
    SET recipe_id=(SELECT id FROM recipes WHERE title='${recipeTitle}' LIMIT 1),
    step_number=${stepNumber},
    instruction='${instruction}'`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      resolve();
    });
  });
}

async function create_recipe_instructions(con, json) {
  return new Promise((resolve, reject) => {
    console.log("Creating table recipe_instructions...");
    const sql = `CREATE TABLE recipe_instructions (
      id INT NOT NULL AUTO_INCREMENT,
      recipe_id INT NOT NULL,
      step_number INT,
      instruction TEXT,
      PRIMARY KEY (id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    )`;
    con.query(sql, async (err, res) => {
      console.log("Created table recipe_instructions");

      console.log("Inserting recipe instructions...");
      let insert_recipe_instructions = [];
      for (const recipe of json) {
        const n = recipe.instructions.length;
        for (let i = 0; i < n; i++) {
          insert_recipe_instructions.push(
            insert_recipe_instruction(con, recipe.title, i+1,
              recipe.instructions[i].text)
          );
        }
      }
      await Promise.all(insert_recipe_instructions);
      console.log("Recipe instructions inserted");
      resolve();
    });
  });
}

async function create_users(con) {
  return new Promise((resolve, reject) => {
    console.log("Creating table users...");
    const sql = `CREATE TABLE users (
      id INT NOT NULL AUTO_INCREMENT,
      password VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
    )`;
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
    const sql = `CREATE TABLE user_tags (
      id int NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      tag TEXT,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`;
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
    const sql = `CREATE TABLE user_ingredients (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      ingredient_id INT NOT NULL,
      amount INT,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
    )`;
    con.query(sql, (err, res) => {
      if (err) throw err;
      console.log("Table user_ingredients created");
      resolve();
    });
  });
}

async function reload_db() {
  console.log("reload_db running...");

  // Get json
  let url = "http://data.csail.mit.edu/im2recipe/recipes_with_nutritional_info.json";
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
  await create_ingredients(con, json);
  create_user_ingredients(con);
  await create_recipes(con, json);
  Promise.all([
    await create_recipe_ingredients(con, json),
    await create_recipe_instructions(con, json)
  ]);

  console.log("reload_db finished successfully");
}

reload_db().catch((err) => {
  console.error(err.message);
});
