const express = require("express")
const router = express.Router();
const taskController = require('../controller/taskController');
const accessControl = require("../utils/access-control").accessControl
const upload = require('../multerconfig');

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    }
}

router.post('/createtask/:id', setAccessControl("*"), upload, taskController.createTask);
router.post('/duplicateTask/:id',setAccessControl("*"),taskController.duplicateTask);
router.post('/postTaskActivity/:id/:tid',setAccessControl("*"),taskController.postTaskActivity);

router.get('/dashboardStatistics/:id',setAccessControl("*"),taskController.dashboardStatistics)
router.get('/gettasks',setAccessControl("*"),taskController.getTasks)
router.get('/gettask/:tid',setAccessControl("*"),taskController.getTask)

router.put('/createSubTask/:tid',setAccessControl("*"),taskController.createSubTask);
router.put('/updateTask/:tid',setAccessControl("*"),upload,taskController.updateTask);
router.put('/trashTask/:tid',setAccessControl("*"),taskController.trashTask);
router.put('/taskstageupdate/:tid/:stage',setAccessControl("*"),taskController.taskStageUpdate);


router.delete('/deleteRestoreTask/:tid',taskController.deleteRestoreTask)

module.exports = router