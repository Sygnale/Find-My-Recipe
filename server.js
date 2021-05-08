var mysql = require('mysql2');

//Open connection to MySQL database
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "find_my_recipe"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL Database");
});

//Setup express server
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: 'Server Home'
    });
});

/** ---------------------------------------- Backend APIs --------------------------------------- */

//Method to add user to database
//Usage (from frontend): http://localhost:8080/add-user/[username]-[password]
//@returns user ID (in format  {"id":[id]}) for success (for use in later frontend requests), relevant error message for failure (see lines with res.end)
app.post('/add-user/:username-:password', (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    console.log(`Request to add user "${username}" with password "${password}"`);

    //Basic data validation, probably not necessary as this should be done in the frontend
    if (username == null || username == "") { //Note that this may not actually be necessary, any bad requests probably would not even be routed here
        res.end("Invalid username");
        return;
    }
    if (password == null || password == "") {
        res.end("Invalid password");
        return;
    }

    var countQueryString = "SELECT COUNT (*) FROM users WHERE username=?";
    con.query(countQueryString, [username], function (err, result) { //Check if user already exists
        if (err) throw err;
        if (result[0]["COUNT (*)"] != 0) {
            console.log("Request denied: user already found in database");
            res.end("Username already exists"); //User exists, return error
        }
        else { //User does not exist, insert into database with null ingredients/tags and with corresponding userID and password
            var addQueryString = "INSERT INTO users (username, password) VALUES (?, ?)";
            con.query(addQueryString, [username, password], function (err, result) {
                if (err) throw err;
                console.log(result);
                var idStruct = {
                    id: result.insertId,
                };
                res.end(JSON.stringify(idStruct));
            });
        }
    });
});

//Method to authenticate user from database
//Usage (from frontend): http://localhost:8080/authenticate-user/[username]-[password]
//@returns "Authentication failed" for failure, user ID in struct in format {"id":[id]} for authenticated user for future frontend requests
app.get('/authenticate-user/:userId-:userPassword', (req, res) => {
    const userId = req.params.userId;
    const userPassword = req.params.userPassword;

    console.log("Request to authenticate user (id: " + userId + ") with password " + userPassword);

    var queryString = "SELECT username FROM users WHERE id=? AND password=?";
    con.query(queryString, [userId, userPassword], function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            console.log("Authentication Failed");
            res.end("Authentication failed"); //Username/password does not match
        }
        else {
            console.log("Authentication success");
            var idStruct = {
                id: result[0].username,
            };
            res.end(JSON.stringify(idStruct)); //Success
        }
    });
});

app.get('/ingredients', (req, res) => {
    console.log("Sending ingredients list")
    con.query("SELECT * FROM INGREDIENTS", function (err, result) {
        if (err) throw err;
        res.json(JSON.stringify(result));
    });
});

app.get('/:userId/ingredients', (req, res) => {
  const userId = req.params.userId;

  console.log(`Finding user with id ${userId}...`);
  let queryString = `SELECT username FROM users WHERE id=?`;
  con.query(queryString, [userId], (err1, result1) => {
    if (err1) throw err1;
    if (result1.length === 0) {
      console.log(`User with id ${userId} not found`);
      res.end("User not found");
      return;
    }
    console.log(`User with id ${userId} found`);

    const username = result1[0].username;
    console.log(`Getting ingredients from ${username}...`);
    queryString =
    `SELECT ingredients.id, ingredients.name, user_ingredients.amount FROM
    ingredients JOIN user_ingredients ON ingredients.id=user_ingredients.ingredient_id
    WHERE user_ingredients.user_id=?`;
    con.query(queryString, [userId], (err2, result2) => {
      if (err2) throw err2;
      if (result2.length === 0) {
        console.log(`${username} (id: ${userId}) has no ingredients`);
        res.end(`${username} has no ingredients`);
        return;
      }
      console.log(`Got ingredients from ${username} (id: ${userId})`);
      const response = {
        ingredients: result2,
      };
      res.json(JSON.stringify(response));
    });
  });
});

app.delete('/:userId/ingredients', (req, res) => {
  const userId = req.params.userId;

  console.log(`Finding user with id ${userId}...`);
  let queryString = `SELECT username FROM users WHERE id=?`;
  con.query(queryString, [userId], (err1, result1) => {
    if (err1) throw err1;
    if (result1.length === 0) {
      console.log(`User with id ${userId} not found`);
      res.end("User not found");
      return;
    }
    console.log(`User with id ${userId} found`);

    const username = result1[0].username;
    console.log(`Deleting all ingredients from ${username}...`);
    queryString = `DELETE FROM user_ingredients WHERE user_id=?`;
    con.query(queryString, [userId], (err2, result2) => {
      if (err2) throw err2;
      const msg = `Deleted all ingredients from ${username}`
      console.log(msg);
      res.end(`Deleted all ingredients from ${username}`);
    });
  });
});

app.delete('/:userId/ingredients/:ingredientId', (req, res) => {
  const userId = req.params.userId;
  const ingredientId = req.params.ingredientId;

  console.log(`Finding user with id ${userId}...`);
  let queryString = `SELECT username FROM users WHERE id=?`;
  con.query(queryString, [userId], (err1, result1) => {
    if (err1) throw err1;
    if (result1.length === 0) {
      console.log(`User with id ${userId} not found`);
      res.end("User not found");
      return;
    }
    console.log(`User with id ${userId} found`);

    const username = result1[0].username;
    console.log(`Finding ingredient with id ${ingredientId} from ${username}...`);
    queryString =
    `SELECT ingredients.name
    FROM ingredients JOIN user_ingredients ON ingredients.id=user_ingredients.ingredient_id
    WHERE user_ingredients.user_id=? AND user_ingredients.ingredient_id=?`;
    con.query(queryString, [userId, ingredientId], (err2, result2) => {
      if (err2) throw err2;
      if (result2.length === 0) {
        console.log(`Ingredient with id ${ingredientId} not found from ${username}`);
        res.end("Ingredient not found");
        return;
      }
      console.log(`Ingredient with id ${ingredientId} found from ${username}`);

      const ingredient = result2[0].name;
      console.log(`Deleting ${ingredient} from ${username}...`);
      queryString = `DELETE FROM user_ingredients WHERE user_id=? AND ingredient_id=?`;
      con.query(queryString, [userId, ingredientId], (err3, result3) => {
        if (err3) throw err3;
        if (result3.affectedRows === 0) {
          console.log(`Could not delete ingredient (id: ${ingredientId}) from user (id: ${userID})`);
          res.end("Could not delete ingredient");
          return;
        }
        const msg = `Deleted ${ingredient} from ${username}`;
        console.log(msg);
        res.end(msg);
      });
    });
  });
});

/** -------------------------- End of Backend APIs ----------------------------------  */

//Start server
app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
