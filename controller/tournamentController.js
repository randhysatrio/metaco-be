const Tournament = require('../models/Tournament');
const TournamentResult = require('../models/TournamentResult');
const User = require('../models/User');

module.exports = {
  getTournaments: async (req, res) => {
    try {
      const tournaments = await Tournament.find({}).populate('teams');

      res.status(200).send(tournaments);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getTournamentById: async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findOne({ _id: id })
        .select('title id')
        .populate({
          path: 'results',
          options: {
            sort: { position: 1 },
            populate: {
              path: 'team_id',
              select: 'id name logo',
              populate: { path: 'members', populate: { path: 'user', select: 'coin' } },
            },
          },
        })
        .populate({
          path: 'teams',
          select: 'id name logo',
          populate: { path: 'members', select: 'user_id team_id' },
        });

      res.status(200).send(tournament);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  insertResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { results } = req.body;

      results.forEach(async (result, index) => {
        let point;

        switch (index) {
          case 0:
            point = 5;
            break;
          case 1:
            point = 3;
            break;
          case 2:
            point = 2;
            break;
          default:
            point = 0;
            break;
        }

        if (index < 3 && result.members.length) {
          result.members.forEach(async (member) => {
            await User.findOneAndUpdate({ id: member.user_id }, { $inc: { coin: point } }).exec();
          });
        }

        await TournamentResult.create({
          team_id: result._id,
          tournament_id: id,
          position: index + 1,
          point,
        });
      });

      res.status(200).send('Tournament result created successfully!');
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
