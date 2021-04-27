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

const http = require('http');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const requestListener = function (req, res) {
    console.log("request received");
  res.writeHead(200);
  con.query("SELECT * FROM INGREDIENTS",function(err,result){
    if(err)throw err;
        res.end(JSON.stringify(result));
    });
}

const server = http.createServer(requestListener);
server.listen(8080);