const { Schema, model } = require('mongoose');

const tournamentSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    start_date: {
      type: String,
      required: true,
    },
    end_date: {
      type: String,
      required: true,
    },
    team_count: {
      type: Number,
      required: true,
    },
    slot: {
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

tournamentSchema.virtual('results', {
  ref: 'Tournament_Result',
  localField: 'id',
  foreignField: 'tournament_id',
});

tournamentSchema.virtual('teams', {
  ref: 'Team',
  localField: 'id',
  foreignField: 'tournament_id',
});

const Tournament = model('Tournament', tournamentSchema, 'tournaments');

module.exports = Tournament;
