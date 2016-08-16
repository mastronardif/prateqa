# pRate

Instructions on how to clone for first time use this project and use it with a local
database 

1) Make an empty directory where you would to store the project.

2) Then clone from master with the following code: 

		git clone https://github.com/staceysze/pRate.git

3) cd into pRate

4) Use the following code :
		
		npm install
   
   This installs the dependencies for the program.

5) In a separate window of the terminal, run mongod with the following:
		
		mongod

6) Open another window on the terminal

7) Type the following:

		mongo

8) Drop any database with the following name:

		platerate

   To drop a database, use the following:

   		show dbs
   		use platerate
   		db.dropDatabase()

   this avoids any conflicts with preexisting databases

9) Go back to window of the terminal with the main program and type the following:

		node server/server.js

	
	provided you are in the pRate folder.

10) This should run the program. By running the program and using it, the program 
    will automatically generate the database: platerate and its repective collections.

Below is for further considerations and will implemented later.

# add unique emailaddress constraint to the profile collection
db.profile.createIndex({"emailaddress": 1}, {unique: true})

# show the indexes on a collection
db.profile.getIndexes()

# mongo access to the mlab instance that Jie Ling created
mongo  ds023694.mlab.com:23694/bubblevan -u ling -p ling

FM test July 29th 7:05pm
https://enigmatic-falls-23514.herokuapp.com/






# Mongo Database set-up
 Steps to set up mongodb for disconnected local development
 
	In root directory, create `data` directory:
 	```mkdir data```
 	Run this command to start your mongod server:
	```mongod --dbpath ./data --port 27017```
