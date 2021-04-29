var mysql=require('mysql2')

var con=mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "recipes"
});
con.connect(function(err){
    if(err) throw err;
    console.log("Connected to MySQL Database");
});

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors())

app.get('/', (req, res) => {
    res.json({
        message: 'Server Home'
    });
});

app.get('/ingredients',(req,res)=>{
    console.log("Sending ingredients list")
    con.query("SELECT * FROM INGREDIENTS",function(err,result){
        if(err)throw err;
            res.json(JSON.stringify(result));
        });
});

app.listen(8080, () => {
    console.log('Server listening on port 8080');
});