const express = require("express")
const router = express.Router();
const personalTaskController = require('../controller/personalTaskController');
const accessControl = require("../utils/access-control").accessControl
const upload = require('../multerconfig');

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next);
    }
}

router.get('/getAllArchivePersonaltask/:id', setAccessControl("2"),personalTaskController.getArchivedPersonalTasks);
router.get('/getAllPersonaltask/:id', setAccessControl("2"),personalTaskController.getAllPersonalTasks);

router.post('/createPersonaltask/:id', setAccessControl("2"),personalTaskController.addPersonalTask);

router.put('/archivePersonaltask/:ptid', setAccessControl("2"),personalTaskController.archivePersonalTask);
router.put('/setReminder/:ptid', setAccessControl("2"),personalTaskController.setReminder);
router.put('/updatePersonaltask/:ptid', setAccessControl("2"),personalTaskController.updatePersonalTask);

router.delete('/deletePersonaltask/:ptid', setAccessControl("2"),personalTaskController.deletePersonalTask);

module.exports = router