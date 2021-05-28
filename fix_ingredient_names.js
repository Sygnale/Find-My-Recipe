const mysql = require('mysql2');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "find_my_recipe"
});

const csv=require('csv-parser');
const fs=require('fs');

async function query(sql, arg) {
    return new Promise(resolve => {
      con.query(sql, arg, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });
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

fix_ingredients().catch((err) => {
    console.error(err.message);
  });
  