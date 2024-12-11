const express = require("express")
const router = express.Router();
const userController = require('../controller/userController');
const accessControl = require("../utils/access-control").accessControl


function setAccessControl(access_types) {

    return(req,res,next) => {
        accessControl(access_types,req,res,next);
    }
}

router.post('/register',userController.registerUser);
router.post('/login',userController.loginUser);


module.exports = router