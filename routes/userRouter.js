const router = require('express').Router();
const { userController } = require('../controller');

router.patch('/coin', userController.updatedUserCoin);

module.exports = router;
