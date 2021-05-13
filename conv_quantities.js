const mysql = require('mysql2');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "find_my_recipe"
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

async function query(sql, arg) {
  return new Promise(resolve => {
    con.query(sql, arg, (err, res) => {
      if (err) throw err;
      resolve(res);
    });
  });
}

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

function process_row(id, quantity, unit) {
  const min_si = parse_quantity(quantity) * conv[unit];
  let sql = `UPDATE recipe_ingredients SET min_si=? WHERE id=?`;
  return query(sql, [min_si, id]);
}

async function conv_quantities() {
  console.log('conv_quantities running...');
  let sql = '';

  console.log('Modifying user_ingredients.amount...');
  sql = `ALTER TABLE user_ingredients MODIFY COLUMN amount float(5)`;
  await query(sql);
  console.log('user_ingredients.amount modified');

  console.log('Checking if recipe_ingredients.min_si exists...');
  sql = `SELECT count(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA='find_my_recipe'
  AND TABLE_NAME='recipe_ingredients'
  AND COLUMN_NAME='min_si'`;
  const colCount = await query(sql);
  if (colCount[0]['count(*)'] === 0) {
    console.log('recipe_ingredients.min_si does not exist, adding recipe_ingredients.min_si...');
    sql = `ALTER TABLE recipe_ingredients ADD min_si float(5)`;
    await query(sql);
    console.log('recipe_ingredients.min_si added');
  }
  else {
    console.log('recipe_ingredients.min_si exists, modifying recipe_ingredients.min_si...');
    sql = `ALTER TABLE recipe_ingredients MODIFY min_si float(5)`;
    await query(sql);
    console.log('recipe_ingredients.min_si modified');
  }

  console.log('Getting recipe ingredients...');
  sql = `SELECT id, quantity, unit FROM recipe_ingredients`;
  const ingredients = await query(sql);
  console.log('Got recipe ingredients');

  console.log('Inserting min_si...');
  const promises = [];
  for (const row of ingredients) {
    const { id, quantity, unit } = row;
    const promise = process_row(id, quantity, unit);
    promises.push(promise);
  }
  await Promise.all(promises);
  console.log('min_si inserted');

  console.log('conv_quantities successfully finished');
  process.exit(0);
}

conv_quantities().catch((err) => {
  console.error(err.message);
});
