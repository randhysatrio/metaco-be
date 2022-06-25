const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');

module.exports = {
  getTeams: async (req, res) => {
    try {
      const { search, limit, page, withMembers, withResults } = req.query;

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
          },
        });
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
      res.status(500).send(err.message);
    }
  },
  getTeamById: async (req, res) => {
    try {
      const { id } = req.params;
      const { withCaptain, withMembers } = req.query;

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

      const team = await Team.aggregate(pipeline);

      res.status(200).send(team);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getPlayers: async (req, res) => {
    try {
      const { search, limit, page, withUser } = req.query;

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
      res.status(500).send(err.message);
    }
  },
};
