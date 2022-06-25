const { Schema, model } = require('mongoose');

const teamSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    captain_id: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
    },
    tournament_id: {
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

teamSchema.virtual('captain', {
  ref: 'User',
  localField: 'captain_id',
  foreignField: 'id',
  justOne: true,
});

teamSchema.virtual('members', {
  ref: 'Team_Member',
  localField: 'id',
  foreignField: 'team_id',
});

teamSchema.virtual('results', {
  ref: 'Tournament_Result',
  localField: 'id',
  foreignField: 'team_id',
});

const Team = model('Team', teamSchema, 'teams');

module.exports = Team;
