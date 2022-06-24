const { Schema, model } = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');

const tournamentResultSchema = new Schema(
  {
    team_id: {
      type: Number,
      required: true,
    },
    tournament_id: {
      type: Number,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    point: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

tournamentResultSchema.virtual('team', {
  ref: 'Team',
  localField: 'team_id',
  foreignField: 'id',
  justOne: true,
});

tournamentResultSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'id',
  justOne: true,
});

const TournamentResult = model('Tournament_Result', tournamentResultSchema, 'tournament_results');

module.exports = TournamentResult;
