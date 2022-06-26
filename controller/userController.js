const User = require('../models/User');

module.exports = {
  updatedUserCoin: async (req, res) => {
    await User.updateMany({}, { coin: 0 });

    res.status(200).send('Coin updated successfully');
  },
};
