const router = require('express').Router();
const { userController } = require('../controller');

router.get('/all', userController.getUsers);
router.patch('/coin', userController.updatedUserCoin);

module.exports = router;
