const express = require("express")
const router = express.Router();
const userController = require('../controller/userController');
const accessControl = require("../utils/access-control").accessControl


function setAccessControl(access_types) {

    return(req,res,next) => {
        accessControl(access_types,req,res,next);
    }
}

router.post('/register',setAccessControl("1"),userController.registerUser);
router.post('/login',userController.loginUser);
router.get('/getTeamList',userController.getTeamList);
router.get('/getnotification/:id',userController.getNotificationsList);

router.put("/profile/:id", userController.updateUserProfile);
router.put("/read-noti/:id/:nid", userController.markNotificationRead);
router.put("/change-password/:id",userController.changeUserPassword);

//FOR ADMIN ONLY ROUTES

router.put("/activateUserProfile/:id",userController.activateUserProfile)
router.delete("/deleteUserProfile/:id",userController.deleteUserProfile);

module.exports = router