const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const TournamentResult = require('../models/TournamentResult');

module.exports = {
  getTeams: async (req, res) => {
    try {
      const { search, limit, page, withMembers, withResults, sort } = req.query;

      const where = {};

      if (search) {
        where.name = { $regex: search, $options: 'i' };
      }

      const pipeline = [];

      if (search) {
        pipeline.push({ $match: where });
      }

      if (withResults) {
        pipeline.push({
          $lookup: {
            from: 'tournament_results',
            localField: 'id',
            foreignField: 'team_id',
            as: 'results',
            pipeline: [{ $project: { point: 1 } }],
          },
        });
        pipeline.push({
          $addFields: { totalPoints: { $sum: '$results.point' } },
        });
      }

      if (withMembers) {
        pipeline.push({
          $lookup: {
            from: 'team_members',
            localField: 'id',
            foreignField: 'team_id',
            as: 'members',
            pipeline: [{ $sort: { roles: 1 } }],
          },
        });
      }

      if (sort) {
        const sortInput = sort.split(',');

        pipeline.push({ $sort: { [sortInput[0]]: sortInput[1] === 'asc' ? 1 : -1 } });
      }

      if (limit && page) {
        pipeline.push({ $skip: limit * page - limit });
      }

      if (limit) {
        pipeline.push({ $limit: parseInt(limit) });
      }

      const results = await Team.aggregate(pipeline);

      const count = await Team.countDocuments(where);

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({ count, results, maxPage });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getTeamById: async (req, res) => {
    try {
      const { id } = req.params;
      const { withCaptain, withMembers, withResults, withTopThrees, withFirstPlaces } = req.query;

      const pipeline = [{ $match: { id: parseInt(id) } }, { $project: { created_at: 0, updated_at: 0 } }];

      if (withCaptain) {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'captain_id',
            foreignField: 'id',
            as: 'captain',
            pipeline: [{ $project: { created_at: 0, updated_at: 0 } }],
          },
        });
        pipeline.push({ $unwind: '$captain' });
      }

      if (withMembers) {
        pipeline.push({
          $lookup: {
            from: 'team_members',
            localField: 'id',
            foreignField: 'team_id',
            as: 'members',
            pipeline: [
              { $sort: { roles: 1 } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user_id',
                  foreignField: 'id',
                  as: 'user',
                  pipeline: [{ $project: { created_at: 0, updated_at: 0, id: 0 } }],
                },
              },
              { $unwind: '$user' },
              { $project: { created_at: 0, updated_at: 0, team_id: 0, id: 0 } },
            ],
          },
        });
      }

      if (withResults) {
        pipeline.push({
          $lookup: {
            from: 'tournament_results',
            localField: 'id',
            foreignField: 'team_id',
            as: 'results',
            pipeline: [
              {
                $lookup: {
                  from: 'tournaments',
                  localField: 'tournament_id',
                  foreignField: 'id',
                  as: 'tournament',
                },
              },
              { $unwind: '$tournament' },
              { $limit: 10 },
            ],
          },
        });
        pipeline.push({
          $addFields: {
            totalPoints: { $sum: '$results.point' },
          },
        });
      }

      pipeline.push({ $limit: 1 });

      const team = await Team.aggregate(pipeline);

      const response = { team: team[0] };

      if (withTopThrees) {
        response.topthrees = await TournamentResult.countDocuments({ team_id: id, position: { $lte: 4 } });
      }

      if (withFirstPlaces) {
        response.firstplaces = await TournamentResult.countDocuments({ team_id: id, position: { $eq: 1 } });
      }

      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  getPlayers: async (req, res) => {
    try {
      const { search, limit, page, withUser, sort } = req.query;

      const where = {};

      if (search) {
        where.ingame_id = { $regex: search, $options: 'i' };
      }

      const pipeline = [];

      if (search) {
        pipeline.push({ $match: where });
      }

      if (withUser) {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: 'id',
            as: 'user',
            pipeline: [{ $project: { created_at: 0, updated_at: 0 } }],
          },
        });
        pipeline.push({ $unwind: '$user' });
      }

      if (sort) {
        const sortInput = sort.split(',');

        pipeline.push({ $sort: { [sortInput[0]]: sortInput[1] === 'asc' ? -1 : 1 } });
      }

      if (limit && page) {
        pipeline.push({ $skip: parseInt(limit * page - limit) });
      }

      if (limit) {
        pipeline.push({ $limit: parseInt(limit) });
      }

      const results = await TeamMember.aggregate(pipeline);

      let count;

      if (search) {
        const query = await TeamMember.aggregate([pipeline[0], { $count: 'totalData' }]);

        count = query[0].totalData;
      } else {
        count = await TeamMember.estimatedDocumentCount();
      }

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({ results, count, maxPage });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
