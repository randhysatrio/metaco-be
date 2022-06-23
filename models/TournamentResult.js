const { Schema, model } = require('mongoose');

const tournamentResultSchema = new Schema(
  {
    team_id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    tournament_id: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
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

const TournamentResult = model('Tournament_Result', tournamentResultSchema, 'tournament_results');

module.exports = TournamentResult;
