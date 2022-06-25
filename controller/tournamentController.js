const Tournament = require('../models/Tournament');
const TournamentResult = require('../models/TournamentResult');
const Team = require('../models/Team');
const User = require('../models/User');

module.exports = {
  getTournaments: async (req, res) => {
    try {
      const { limit, page, sort, withResults, withTeams } = req.query;

      const where = {};
      const options = {};

      if (limit) {
        options.limit = parseInt(limit);
      }

      if (limit && page) {
        if (page != 1) {
          options.skip = parseInt(limit * page - limit);
        }
      }

      if (withResults) {
        if (!options.hasOwnProperty('populate')) {
          options.populate = [
            {
              path: 'results',
              select: 'point position team_id',
              options: { sort: { position: 1 } },
              populate: { path: 'team', select: 'name logo id captain_id', populate: { path: 'captain', select: 'name' } },
            },
          ];
        } else {
          options.populate.push({
            path: 'results',
            select: 'point position team_id',
            options: { sort: { position: 1 } },
            populate: { path: 'team', select: 'name logo captain_id', populate: { path: 'captain', select: 'name' } },
          });
        }
      }

      if (withTeams) {
        if (!options.hasOwnProperty('populate')) {
          options.populate = [{ path: 'teams' }];
        } else {
          options.populate.push({ path: 'teams' });
        }
      }

      if (sort) {
        const order = sort.split(',');

        options.sort = { [order[0]]: order[1] === 'asc' ? 1 : -1 };
      }

      const tournaments = await Tournament.find(where, null, options);

      res.status(200).send(tournaments);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getTournamentById: async (req, res) => {
    try {
      const { id } = req.params;
      const { withTeams, withResults } = req.query;

      const where = {};

      if (id) {
        where.id = id;
      }

      const options = {};

      if (withTeams) {
        if (!options.hasOwnProperty('populate')) {
          options.populate = [{ path: 'teams', populate: { path: 'members' } }];
        } else {
          options.populate.push({ path: 'teams', populate: { path: 'members' } });
        }
      }

      if (withResults) {
        if (!options.hasOwnProperty('populate')) {
          options.populate = [
            {
              path: 'results',
              select: 'point position team_id',
              populate: { path: 'team', select: 'name logo captain_id', populate: { path: 'captain', select: 'name' } },
            },
          ];
        } else {
          options.populate.push({
            path: 'results',
            select: 'point position team_id',
            populate: { path: 'team', select: 'name logo captain_id', populate: { path: 'captain', select: 'name' } },
          });
        }
      }

      const tournament = await Tournament.findOne(where, null, options);

      res.status(200).send(tournament);
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  },
  insertResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { results } = req.body;

      results.forEach(async (teamId, index) => {
        const teamData = await Team.findOne({ id: parseInt(teamId) }).populate('members', 'user_id');

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

        if (index < 3 && teamData.members.length) {
          teamData.members.forEach(async (member) => {
            await User.findOneAndUpdate({ id: member.user_id }, { $inc: { coin: point } }).exec();
          });
        }

        await TournamentResult.create({
          team_id: parseInt(teamData.id),
          tournament_id: parseInt(id),
          position: index + 1,
          point,
        });
      });

      res.status(200).send('Tournament result created successfully!');
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  deleteResult: async (req, res) => {
    try {
      const { id } = req.params;

      const results = await TournamentResult.find({ tournament_id: id }).populate({
        path: 'team',
        populate: { path: 'members', select: 'user_id' },
      });

      await TournamentResult.deleteMany({ tournament_id: id });

      results.forEach(async (result) => {
        if (result.position <= 3 && result.team.members.length) {
          result.team.members.forEach(async (member) => {
            await User.findOneAndUpdate({ id: member.user_id }, { $inc: { coin: parseInt(`-${result.point}`) } }).exec();
          });
        }
      });

      res.status(200).send('Results deleted successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
