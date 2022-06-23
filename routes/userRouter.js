const router = require('express').Router();
const { userController } = require('../controller');

router.get('/all', userController.getUsers);

module.exports = router;
