const mysql = require('mysql2');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "find_my_recipe"
});

async function query(sql, arg) {
  return new Promise(resolve => {
    con.query(sql, arg, (err, res) => {
      if (err) throw err;
      resolve(res);
    });
  });
}

async function add_favorites() {
  console.log('add_favorites running...');

  let sql = `CREATE TABLE IF NOT EXISTS user_favorite_recipes(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
  )`;
  await query(sql);

  console.log('add_favorites finished successfully');
  process.exit(0);
}

add_favorites().catch((err) => {
  console.error(err.message);
});
