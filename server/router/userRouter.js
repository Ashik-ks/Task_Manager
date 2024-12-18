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
router.get('/getuser/:id',userController.getuser);

router.put("/profile/:id", userController.updateUserProfile);
router.put("/read-noti/:id/:nid", userController.markNotificationRead);
router.put("/change-password/:id",userController.changeUserPassword);
router.post("/forgotPasswordController",setAccessControl('*'),userController.forgotPasswordController);
router.patch('/reset-password', setAccessControl('*'),userController.passwordResetController);


//FOR ADMIN ONLY ROUTES

router.put("/activateUserProfile/:id",setAccessControl("1"),userController.activateUserProfile)
router.delete("/deleteUserProfile/:id",setAccessControl("1"),userController.deleteUserProfile);

module.exports = router