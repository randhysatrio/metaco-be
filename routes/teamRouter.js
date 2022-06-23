const { teamController } = require('../controller');
const router = require('express').Router();

router.get('/:id', teamController.getTeam);

module.exports = router;
