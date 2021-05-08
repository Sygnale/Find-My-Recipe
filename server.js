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
app.get('/add-user/:userId-:userPassword', (req, res) => {
    console.log("Request to add user: "+req.params.userId+" with password "+req.params.userPassword);

    //Basic data validation, probably not necessary as this should be done in the frontend
    if(req.params.userId==null || req.params.userId == "" ){ //Note that this may not actually be necessary, any bad requests probably would not even be routed here
        res.end("Invalid username");
        return;
    }
    if(req.params.userPassword ==  null || req.params.userPassword == ""){
        res.end("Invalid password");
        return;
    }

    var countQueryString = "SELECT COUNT (*) FROM users WHERE username=\""+req.params.userId+"\"";
    con.query(countQueryString, function(err, result){ //Check if user already exists
        if(err) throw err;
        if(result[0]["COUNT (*)"] != 0){
            console.log("Request denied: user already found in database");
            res.end("Username already exists"); //User exists, return error
        }
        else{ //User does not exist, insert into database with null ingredients/tags and with corresponding userID and password
            var addQueryString = "INSERT INTO users (username, password) VALUES (\""+req.params.userId+"\",\""+req.params.userPassword+"\")";
            con.query(addQueryString, function(err, result){
                if(err) throw err;
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
    console.log("Request to authenticate user: "+req.params.userId+" with password " +req.params.userPassword);

    var queryString="SELECT id FROM users WHERE username=\""+req.params.userId+"\" AND password=\""+req.params.userPassword+"\"";
    console.log(queryString);
    con.query(queryString, function(err, result){
        if(err) throw err;
        if(result.length == 0){
            console.log("Authentication Failed");
            res.end("Authentication failed"); //Username/password does not match
        }
        else{
            console.log("Authentication success");
            var idStruct = {
                id: result[0].id,
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
  const username = req.params.userId;

  console.log(`Getting ${username} ingredients...`);
  var queryString =
  `SELECT ingredients.id, ingredients.name, user_ingredients.amount FROM
  ingredients JOIN user_ingredients ON ingredients.id = user_ingredients.ingredient_id
  WHERE user_ingredients.user_id = (SELECT id FROM users WHERE username=? LIMIT 1)`;
  con.query(queryString, [username], (err, result) => {
    if (err) throw err;
    if (res.length === 0) {
      const msg = `${username} not found or has no ingredients`;
      console.log(msg);
      res.end(msg);
      return;
    }
    console.log(`Got ${username} ingredients`);
    const response = {
      ingredients: result,
    };
    res.json(JSON.stringify(response));
  });
});

/** -------------------------- End of Backend APIs ----------------------------------  */

//Start server
app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
