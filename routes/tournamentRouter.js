const router = require('express').Router();
const { tournamentContoller } = require('../controller');

router.get('/find', tournamentContoller.getTournaments);
router.get('/find/:id', tournamentContoller.getTournamentById);
router.post('/result/:id', tournamentContoller.insertResult);

module.exports = router;
