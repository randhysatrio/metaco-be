const TeamMember = require('../models/TeamMember');

module.exports = {
  getTeamMember: async (req, res) => {
    try {
      const { id } = req.params;

      const teamMember = await TeamMember.findOne({ user_id: id })
        .populate('user')
        .populate({ path: 'team', populate: { path: 'captain' }, select: 'name logo captain_id tournament_id' });

      res.status(200).send(teamMember);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
