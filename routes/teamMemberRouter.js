const router = require('express').Router();
const { teamMemberController } = require('../controller');

router.get('/member/:id', teamMemberController.getTeamMember);
router.get('/team/:id', teamMemberController.getTeamMembers);

module.exports = router;
