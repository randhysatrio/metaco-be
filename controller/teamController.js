const Team = require('../models/Team');

module.exports = {
  getTeam: async (req, res) => {
    try {
      const { id } = req.params;

      const team = await Team.findOne({ id }).populate('member');

      res.status(200).send(team);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
