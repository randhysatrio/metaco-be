const router = require('express').Router();
const { teamMemberController } = require('../controller');

router.get('/:id', teamMemberController.getTeamMember);

module.exports = router;
