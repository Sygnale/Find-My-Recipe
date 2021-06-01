# Find My Recipe

## Project Description
 Authors: Ivan Chi(Sygnale), Niki Hosseinian(nikihosseinian), Theodore Lau(Teddy1405), Adam Murtagh(TemplarArsene), Chirag Singh(chirag-singh1), Lime Yao(eyao600)

 ## Setup

 ### MySQL

Install MySQL using the installer [here](https://dev.mysql.com/downloads/installer/). Make sure you set the root password to the incredibly secure "123456" and when prompted, have the server setup on localhost:3306 (which should be the default option). Leave all other settings to the default settings. Open reload_db.js in your favorite editor. If you already had MySQL installed or installed with a root password other than "123456", change the password field on line 8 to your password. If you do not have the MIT recipe JSON downloaded, uncomment line 272 (that starts with "download_json") and line 274 and comment out lines 273 and 275. Otherwise, change the path variable on line 273 to the local path to your downloaded recipe JSON uncomment line 275 (starting with "load_json") and comment out lines 272 and 274. Save your changes. Open a command line window in the Find-My-Recipe folder and run the command "node reload_db.js." This command will take a long time to finish.

 ### Node.js

 Install Node.js using the installer [here](https://nodejs.org/en/download/). Open a command line prompt and enter "npm install mysql2", "npm install express", "npm install react-router-dom", "npm install react-split-pane", "npm install bcrypt", "npm install csv-parser", and "npm install cors". Navigate into the Find-My-Recipe directory (the same directory as server.js). If you installed MySQL with a root password other than "123456", change the password field on line 7 of server.js to match it. Enter "node server.js" in the command line. To check that you have correctly installed Node.js and MySQL, type "curl localhost:8080" into a command window. A message 'Server Home' should be printed in JSON format.

 ### React.js

Navigate to the Find-My-Recipe/find-my-recipe folder. Type "npm start" into the command line and a window should open with the project at localhost:3000. 
