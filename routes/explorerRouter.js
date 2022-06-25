const { explorerController } = require('../controller');
const router = require('express').Router();

router.get('/team', explorerController.getTeams);
router.get('/team/:id', explorerController.getTeamById);
router.get('/player', explorerController.getPlayers);

module.exports = router;
