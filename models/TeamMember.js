const { Schema, model } = require('mongoose');

const teamMemberSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
    team_id: {
      type: Number,
      required: true,
    },
    roles: {
      type: String,
      enum: {
        values: ['MEMBER', 'STANDIN', 'CAPTAIN'],
        message: 'Value not supported',
      },
      required: true,
    },
    ingame_id: {
      type: String,
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

teamMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: 'id',
  justOne: true,
});

teamMemberSchema.virtual('team', {
  ref: 'Team',
  localField: 'team_id',
  foreignField: 'id',
  justOne: true,
});

const TeamMember = model('Team_Member', teamMemberSchema, 'team_members');

module.exports = TeamMember;
