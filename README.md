# Find My Recipe

## Project Description
 Authors: Ivan Chi, Niki Hosseinian, Theodore Lau, Adam Murtagh, Chirag Singh, Lime Yao

 ## Setup

 ### MySQL

 Install MySQL using the installer [here](https://dev.mysql.com/downloads/installer/). Make sure you set the root password to the incredibly secure "123456" and when prompted, have the server setup on localhost:3306 (which should be the default option). Leave all other settings to the default settings. Open reload_db.js in your favorite editor. If you do not have the MIT recipe JSON downloaded, use the line that starts with "download_json." If you already had MySQL installed or installed with a root password other than "123456", change the password field on line 8 to your password. Otherwise, change the path variable to the local path to your downloaded recipe JSON and use the line that starts with "load_json." Save your changes. Open a command line window in the Find-My-Recipe folder and run the command "node reload_db.js." This command will take a long time to finish.

 ### Node.js

 Install Node.js using the installer [here](https://nodejs.org/en/download/). Open a command line prompt and enter "npm install mysql2", "npm install express", and "npm install cors". Navigate into the Find-My-Recipe directory (the same directory as server.js). If you installed MySQL with a root password other than "123456", change the password field on line 7 of server.js to match it. Enter "node server.js" in the command line. To check that you have correctly installed Node.js and MySQL, type "curl localhost:8080" into a command window. A list of all the ingredients should be printed to the command prompt in JSON format.

 ### React.js

 Install React.js using the installer [here](https://nodejs.org/en/). Navigate to the Find-My-Recipe/find-my-recipe folder. Type "npm start" into the command line and a window should open with the base project at localhost:3000. If the page displays a list of ingredients in a JSON format, you have set up the dependencies correctly!
