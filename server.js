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

//Security constants
const bcrypt=require('bcrypt');
const saltRound=5; //Relatively low number of salting rounds for performance

/** ---------------------------------------- Backend APIs --------------------------------------- */
async function query(sqlString, arguments) {
  return new Promise((resolve, rejection) => {
    con.query(sqlString, arguments, (err, res) => {
      if (err) throw err;
      resolve(res);
    });
  });
}

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
            res.statusCode = 404;
            res.end(JSON.stringify("Username already exists")); //User exists, return error
        }
        else { //User does not exist, insert into database with null ingredients/tags and with corresponding userID and password
          bcrypt.genSalt(saltRound, function(err, salt){
            bcrypt.hash(password, salt, function(err, hash){
              var addQueryString = "INSERT INTO users (username, password) VALUES (?, ?)";
              con.query(addQueryString, [username, hash], function (err, result) {
                  if (err) throw err;
                  console.log(result);
                  var idStruct = {
                      id: result.insertId,
                  };
                  res.json(idStruct);
              });
            });
          });
        }
    });
});

//Method to authenticate user from database
//Usage (from frontend): http://localhost:8080/authenticate-user/[username]-[password]
//@returns "Authentication failed" for failure, user ID in struct in format {"id":[id]} for authenticated user for future frontend requests
app.get('/authenticate-user/:username-:password', (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    console.log(`Request to authenticate user "${username}" with password "${password}"`);

    var queryString = "SELECT id,password FROM users WHERE username=?";
    con.query(queryString, [username], function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            console.log("User Not Found");
            res.statusCode = 404;
            res.end(JSON.stringify("User Not Found")); //Username does not match
        }
        else {
          bcrypt.compare(password,result[0].password, function(err, res1){
            if(res1){
              console.log("Authentication success");
              var idStruct = {
                  id: result[0].id,
              };
              res.json(idStruct); //Success
            }
            else{
              console.log("Incorrect Password");
              res.statusCode = 404;
              res.end(JSON.stringify("Incorrect Password")); //Password
            }
          });
        }
    });
});

//Returns list of ingredients in JSON object
//Usage: http://localhost:8080/ingredients
app.get('/ingredients', (req, res) => {
    console.log("Sending ingredients list")
    con.query("SELECT * FROM INGREDIENTS", function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

//Gets list of ingredients for specific userID
//Usage: http://localhost:8080/[userID]/ingredients - Note that userID is their numerical database ID number saved from user creation/authentication
//@returns numerical ingredient ID and string numerical tag as JSON list, relevant message on failure
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
				res.statusCode = 404;
        res.end(JSON.stringify(`${username} has no ingredients`));
        return;
      }
      console.log(`Got ingredients from ${username} (id: ${userId})`);
      const response = {
        ingredients: result2,
      };
      res.json(response);
    });
  });
});

//Gets all ingredients for specific userID
//Usage: http://localhost:8080/[userID]/ingredients - Note that userID is their numerical database ID number saved from user creation/authentication
//@returns "Deleted all ingredients from [username]" on success, relevant failure message on failure
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
      res.end(msg);
    });
  });
});

//Deletes specific ingredient for single user
//Usage: http://localhost:8080/[userID]/ingredients/[ingredientID] - userID and ingredientID are both numerical database IDs
//@returns "Deleted [ingredient] from [username]" on success, error message on failure
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

app.delete('/:userId/ingredients/:ingredientId/:amount', (req, res) => {
  const userId = req.params.userId;
  const ingredientId = req.params.ingredientId;
  const amount = parseFloat(req.params.amount);

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
    `SELECT ingredients.name, user_ingredients.amount
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
      const userAmount = parseFloat(result2[0].amount);
      let newAmount = userAmount - amount;
      if (newAmount < 0)
        newAmount = 0;
      console.log(`Updating ${ingredient} amount of ${username} to ${newAmount}...`);
      queryString = `UPDATE user_ingredients SET amount=? WHERE user_id=? AND ingredient_id=?`;
      con.query(queryString, [newAmount, userId, ingredientId], (err3, result3) => {
        if (err3) throw err3;
        if (result3.affectedRows === 0) {
          console.log(`Could not update ingredient (id: ${ingredientId}) from user (id: ${userID})`);
          res.end("Could not delete ingredient");
          return;
        }
        const msg = `${ingredient} amount of ${username} updated`;
        const response = {
          amount: newAmount,
        };
        console.log(msg);
        res.json(response);
      });
    });
  });
});

app.get('/:userId/tags', (req, res) => {
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
    console.log(`Getting tags from ${username}...`);
    queryString = `SELECT tag FROM user_tags WHERE user_id=?`;
    con.query(queryString, [userId], (err2, result2) => {
      if (err2) throw err2;
      if (result2.length === 0) {
        console.log(`${username} (id: ${userId}) has no tags`);
				res.statusCode = 404;
        res.end(JSON.stringify(`${username} has no tags`));
        return;
      }
      console.log(`Got tags from ${username} (id: ${userId})`);
      const response = {
        tags: result2,
      };
      res.json(response);
    });
  });
});

app.post('/:userId/tags/:tag', (req, res) => {
  const userId = req.params.userId;
  const tag = req.params.tag;

  console.log(`Getting user with id ${userId}...`);
  let sql = `SELECT username FROM users WHERE id=?`;
  con.query(sql, [userId], (err1, result1) => {
    if (err1) throw err1;
    if (result1.length === 0) {
      console.log(`User (id: ${userId}) not found`);
      res.end("User not found");
      return;
    }
    console.log(`User (id: ${userId}) found`);

    const username = result1[0].username;
    console.log(`Adding tag ${tag} to ${username}...`);
    sql = `INSERT INTO user_tags (user_id, tag) VALUES (?, ?)`;
    con.query(sql, [userId, tag], (err2, result2) => {
      if (err2) throw err2;
      if (result2.affectedRows === 0) {
        console.log(`Could not add tag ${tag} to ${username}`);
        res.end("Could not add tag");
        return;
      }
      console.log(`Tag ${tag} added to ${username}`);
      res.end("Tag added");
    });
  });
});

app.delete('/:userId/tags', async (req, res) => {
  const userId = req.params.userId;
  let sql, result;

  console.log(`Getting user ${userId}...`);
  sql = `SELECT username FROM users WHERE id=? LIMIT 1`;
  result = await query(sql, [userId]);
  if (result.length === 0) {
    console.log(`User ${userId} not found`);
    res.end("User not found");
    return;
  }
  console.log(`User ${userId} found`);

  const username = result[0].username;
  console.log(`Deleting all tags from ${username}...`);
  sql = `DELETE FROM user_tags WHERE user_id=?`;
  result = await query(sql, [userId]);
  if (result.affectedRows === 0) {
    console.log(`Deleted 0 tags from user ${userId}`);
    res.end("User has no tags");
    return;
  }
  const msg = `All tags deleted from ${username}`;
  console.log(msg);
  res.end(msg);
});

app.delete('/:userId/tags/:tag', (req, res) => {
  const userId = req.params.userId;
  const tag = req.params.tag;

  console.log(`Getting user with id ${userId}...`);
  let sql = `SELECT username FROM users WHERE id=?`;
  con.query(sql, [userId], (err1, result1) => {
    if (err1) throw err1;
    if (result1.length === 0) {
      console.log(`User (id: ${userId}) not found`);
      res.end("User not found");
      return;
    }
    console.log(`User (id: ${userId}) found`);

    const username = result1[0].username;
    console.log(`Deleting tag ${tag} from ${username}...`);
    sql = `DELETE FROM user_tags WHERE user_id=? AND tag=?`;
    con.query(sql, [userId, tag], (err2, result2) => {
      if (err2) throw err2;
      if (result2.affectedRows === 0) {
        console.log(`Could not delete tag ${tag} from ${username}`);
        res.end("Could not delete tag");
        return;
      }
      const msg = `Tag ${tag} deleted from ${username}`
      console.log(msg);
      res.end(msg);
    });
  });
});

//Returns all recipes matching search criteria (will use current active user tags automatically)
//Usage: http://localhost:8080/get-recipes/[userID]
//@returns JSON array of recipes on success, empty array on failure
app.get('/get-recipes/:userId', (req, res) => {
  const userID = req.params.userId;
  console.log(`Searching for recipes for user ${userID}`);

  const tagQueryString = `SELECT tag FROM user_tags WHERE user_id=?`;
  con.query(tagQueryString, [userID], (err1,result1) =>{
    if(err1) throw err1;

    let recipeQueryString = `SELECT * FROM recipes WHERE id IN (
      SELECT recipe_id FROM (
        SELECT * FROM user_ingredients WHERE user_id=${userID}
      ) AS T RIGHT JOIN recipe_ingredients ON T.ingredient_id=recipe_ingredients.ingredient_id
      GROUP BY recipe_id
      HAVING SUM(amount IS NULL OR amount < min_si)=0
    )`;

    let tags = {
      'low fat': false,
      'low salt': false,
      'low sugar': false,
      'vegetarian': false,
      'gluten free': false,
    };
    for (const tag of result1)
      tags[tag.tag] = true;

    for (const tag in tags) {
      if (tags[tag]) {
        switch (tag) {
          case 'low fat': recipeQueryString += `AND fat='green'`; break;
          case 'low salt': recipeQueryString += `AND salt='green'`; break;
          case 'low sugar': recipeQueryString += `AND sugars='green'`; break;
          case 'vegetarian': recipeQueryString += ' AND ingredient_id NOT IN (10,21,55,68,97,106,136,144,147,171,190,217,222,227,280,289,292,295,307,321,343,347,353,354)'; break;
          case 'gluten free': recipeQueryString += ' AND ingredient_id NOT IN (3,9,39,78,119,126,129,174,205,212,279,346)'; break;
        }
      }
    }
    con.query(recipeQueryString, (err2,result2) => {
      if(err2) throw err2;

      console.log(`Recipes returned for user ${userID}`);
      res.end (JSON.stringify(result2));
    });
  });
});

//Returns details on specific recipe in detail
//Usage: http://localhost:8080/recipe/[recipeID]
//@returns single JSON object containing all recipe details, 'Invalid recipe index' for bad recipe
app.get('/recipes/:recipeID', (req, res) => {
  const recipeID = req.params.recipeID;

  if(Number(recipeID) == 'NaN' || Number(recipeID) > 51235 || Number(recipeID <= 0) || recipeID.includes('.')) { //Basic data validation
    res.end('Invalid recipe index');
    return;
  }


  let queryString = `SELECT * FROM recipes WHERE id=${recipeID}`;

  con.query(queryString, (err1, result1) => {
    if(err1) throw err1;
    queryString=`SELECT step_number,instruction FROM recipe_instructions WHERE recipe_id=${recipeID}`;
    let result=Object.assign({},result1[0]);

    con.query(queryString, (err2, result2) => {
      if(err2) throw err2;
      result['instructions']=result2;

      queryString=`SELECT ingredient_id,quantity,unit FROM recipe_ingredients WHERE recipe_id=${recipeID}`;
      con.query(queryString, (err3, result3) => {
        if(err3) throw err3;

        result['ingredients']=result3;
        res.end(JSON.stringify(result));
      });
    });
  });

});

//Adds recipe to user favorite list (if the recipe and user both exist and recipe not already in user favorites)
//Safe to call for nonexistant user/recipe or if the user already has favorite recipe (will just return relevant error message)
//Usage: http://localhost:8080/favorites/[userId]/[recipeId]
//@returns "Favorite recipe added" on success, error message with status code 404 on failure
app.post('/favorites/:userId/:recipeId', (req, res) => {
  const recipeID = req.params.recipeId;
  const userId = req.params.userId;

  console.log(`Adding recipe ${recipeID} to ${userId} favorite list`);
  const queryString1 = `SELECT COUNT(*) FROM user_favorite_recipes WHERE (user_id=${userId} AND recipe_id=${recipeID})`;
  const queryString2 = `INSERT INTO user_favorite_recipes (user_id,recipe_id) VALUES (${userId},${recipeID})`;
  const queryString3= `SELECT COUNT(*) FROM users WHERE id=${userId}`;
  const queryString4=`SELECT COUNT(*) FROM recipes WHERE id=${recipeID}`;

  con.query(queryString3, (err3, result3) => {
    if(err3) throw err3;

    if(result3[0]["COUNT(*)"] == 0){
      res.statusCode = 404;
      res.end("User not found");
      return;
    }

    con.query(queryString4, (err4, result4) => {
      if(err4) throw err4;

      if(result4[0]["COUNT(*)"] == 0){
        res.statusCode = 404;
        res.end("Recipe not found");
        return;
      }

      con.query(queryString1, (err1, result1) => {
        if(err1) throw err1;

        if(result1[0]["COUNT(*)"] != 0){
          res.statusCode = 404;
          res.end("Recipe already in user favorites");
          return;
        }

        con.query(queryString2, (err2, result2) => {
          if(err2) throw err2;
          res.end("Favorite recipe added");
        });
      });
    });
  });
});

//Gets list of recipe ID's for a specific user's favorites
//Usage: http://localhost:8080/favorites/[userId]
//@returns JSON array of recipe IDs on success, empty JSON array for invalid user ID
app.get('/favorites/:userId', (req, res) => {
  const userId=req.params.userId;
  console.log(`Fetching ${userId} favorite recipe list`);

  const queryString=`SELECT recipe_id, title, fat, salt, saturates, sugars
   FROM user_favorite_recipes INNER JOIN recipes ON recipes.id=user_favorite_recipes.recipe_id WHERE user_id=${userId}`;

  con.query(queryString, (err, result) => {
    if(err) throw err;

    res.end(JSON.stringify(result));
  });

});

//Removes recipe from user favorite list (if the recipe and user both exist and recipe in user favorites)
//Safe to call for nonexistant user/recipe or if the user does not have specific recipe
//Usage: http://localhost:8080/favorites/[userId]/[recipeId]
//@returns "Favorite recipe deleted" on success, error message with status code 404 on failure
app.delete('/favorites/:userId/:recipeId', (req, res) => {
  const recipeID = req.params.recipeId;
  const userId = req.params.userId;

  console.log(`Deleting recipe ${recipeID} from ${userId} favorite list`);
  const queryString1 = `SELECT COUNT(*) FROM user_favorite_recipes WHERE (user_id=${userId} AND recipe_id=${recipeID})`;
  const queryString2 = `DELETE FROM user_favorite_recipes WHERE user_id=${userId} AND recipe_id=${recipeID}`;
  const queryString3= `SELECT COUNT(*) FROM users WHERE id=${userId}`;
  const queryString4=`SELECT COUNT(*) FROM recipes WHERE id=${recipeID}`;

  con.query(queryString3, (err3, result3) => {
    if(err3) throw err3;

    if(result3[0]["COUNT(*)"] == 0){
      res.statusCode = 404;
      res.end("User not found");
      return;
    }

    con.query(queryString4, (err4, result4) => {
      if(err4) throw err4;

      if(result4[0]["COUNT(*)"] == 0){
        res.statusCode = 404;
        res.end("Recipe not found");
        return;
      }

      con.query(queryString1, (err1, result1) => {
        if(err1) throw err1;

        if(result1[0]["COUNT(*)"] == 0){
          res.statusCode = 404;
          res.end("Recipe not in user favorites");
          return;
        }

        con.query(queryString2, (err2, result2) => {
          if(err2) throw err2;
          res.end("Favorite recipe deleted");
        });
      });
    });
  });
});

//Method to add a new ingredient to user's list
//Usage: http://localhost:8080/[userID]/ingredients/[ingredientId]
//@returns Adds ingredient for user on success, and error message on failure
app.post('/:userId/ingredients/:ingredientId', (req, res) => {
  const userId = req.params.userId;
  const ingredientId = req.params.ingredientId;

  console.log(`Adding ingredient ${ingredientId} to ${userId} pantry.`);
  const queryString1= `SELECT COUNT(*) FROM users WHERE id=${userId}`;
  const queryString2= `SELECT COUNT(*) FROM ingredients WHERE id=${ingredientId}`;
  const queryString3= `SELECT COUNT(*) FROM user_ingredients WHERE (user_id=${userId} AND ingredient_id=${ingredientId})`;
  const queryString4= `INSERT INTO user_ingredients (user_id,ingredient_id,amount) VALUES (${userId},${ingredientId},0)`;

  con.query(queryString1, (err1, result1) => {
    if(err1) throw err1;
    if(result1[0]["COUNT(*)"] == 0){
      res.statusCode = 404;
      res.end("User not found.");
      return;
    }
    con.query(queryString2, (err2, result2) => {
      if(err2) throw err2;
      if(result2[0]["COUNT(*)"] == 0){
        res.statusCode = 404;
        res.end("Ingredient not found.");
        return;
      }
      con.query(queryString3, (err3, result3) => {
        if(err3) throw err3;
        if(result3[0]["COUNT(*)"] != 0){
          res.statusCode = 404;
          res.end("Ingredient already exists in user pantry.");
          return;
        }
        con.query(queryString4, (err4, result4) => {
          if(err4) throw err4;
          res.end("Ingredient added");
        });
      });
    });
  });
});

//Method to edit the quantity of ingredient
//Usage: http://localhost:8080/[userID]/ingredients/[ingredientId]
//@returns Updates ingredients to new amount on success, and erro message on failure
app.put('/:userId/ingredients/:ingredientId/:amount', (req, res) => {
  const userId = req.params.userId;
  const ingredientId = req.params.ingredientId;
  const amount = req.params.amount;

  console.log(`Updating ingredient ${ingredientId} in ${userId} pantry to ${amount}.`);
  const queryString1= `SELECT COUNT(*) FROM users WHERE id=${userId}`;
  const queryString2= `SELECT COUNT(*) FROM ingredients WHERE id=${ingredientId}`;
  const queryString3= `UPDATE user_ingredients SET amount=${amount} WHERE user_id=${userId} AND ingredient_id=${ingredientId}`;

  con.query(queryString1, (err1, result1) => {
    if(err1) throw err1;
    if(result1[0]["COUNT(*)"] == 0){
      res.statusCode = 404;
      res.end("User not found.");
      return;
    }
    con.query(queryString2, (err2, result2) => {
      if(err2) throw err2;
      if(result2[0]["COUNT(*)"] == 0){
        res.statusCode = 404;
        res.end("Ingredient not found.");
        return;
      }
      con.query(queryString3, (err3, result3) => {
        if(err3) throw err3;
        res.end("Ingredient amount updated");
      });
    });
  });
});

app.post('/:userId/ingredients/:ingredientId/:amount', async (req, res) => {
  const userId = req.params.userId;
  const ingredientId = req.params.ingredientId;
  const amount = parseFloat(req.params.amount);

  let sql, result;

  sql=`SELECT COUNT(*) FROM ingredients where id=${ingredientId}`;
  result=await query(sql,[ingredientId]);
  if(result[0]['COUNT(*)']==0){
    console.log('Ingredient not found');
    res.status=404;
    res.end('Ingredient not found');
    return;
  }

  console.log(`Finding ingredient ${ingredientId} from user ${userId}...`);
  sql = `SELECT COUNT(*) FROM user_ingredients
  WHERE user_ingredients.user_id=? AND user_ingredients.ingredient_id=?`;
  result = await query(sql, [userId, ingredientId]);
  if (result[0]['COUNT(*)'] === 0) {
    console.log(`Could not find ingredient ${ingredientId} from user ${userId}`);

    console.log(`Adding ingredient ${ingredientId} to user ${userId}...`);
    sql = `INSERT INTO user_ingredients (user_id, ingredient_id, amount) VALUES (?, ?, 0)`;
    await query(sql, [userId, ingredientId]);
    console.log(`Ingredient ${ingredientId} added to user ${userId}`);
  }
  else {
    console.log(`Ingredient ${ingredientId} found from user ${userId}`);
  }

  console.log(`Getting amount of ingredient ${ingredientId} from user ${userId}...`);
  sql = `SELECT amount FROM user_ingredients WHERE user_id=? AND ingredient_id=?`;
  result = await query(sql, [userId, ingredientId]);
  if (result.length === 0) {
    console.log(`Could not get amount of ingredient ${ingredientId} from user ${userId}`);
    res.end("User or user ingredient not found");
    return;
  }
  console.log(`Got amount of ingredient ${ingredientId} from user ${userId}`);

  const userAmount = parseFloat(result[0].amount);
  const newAmount = userAmount + amount;

  console.log(`Updating user ${userId} ingredient ${ingredientId} to ${newAmount}...`);
  sql = `UPDATE user_ingredients SET amount=? WHERE user_id=? AND ingredient_id=?`;
  result = await query(sql, [newAmount, userId, ingredientId]);
  if (result.affectedRows === 0) {
    console.log(`Could not update user ${userId} ingredient ${ingredientId} to ${newAmount}`);
    res.end("Could not add ingredient");
  }
  console.log(`Updated user ${userId} ingredient ${ingredientId} to ${newAmount}`);

  const response = {
    amount: newAmount,
  };
  res.json(response);
});
/** -------------------------- End of Backend APIs ----------------------------------  */

//Start server
app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
