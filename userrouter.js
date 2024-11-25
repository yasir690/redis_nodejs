const express = require('express');
const userController = require('./usercontroller'); // Importing controller without the .js extension


// Create a router instance
const UserRouters = express.Router();

// User register route
UserRouters.post("/userRegister", userController.userRegister);

UserRouters.get("/getSingleUser/:id", userController.getSingleUser);

UserRouters.delete("/deleteUser/:id", userController.deleteUser);


module.exports=UserRouters;