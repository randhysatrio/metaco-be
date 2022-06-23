require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = require('express')();

app.use(cors());
app.use(express.json());

(() => mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Mongoose connected successfully!')))();

const { userRouter, teamMemberRouter, teamRouter, tournamentRouter } = require('./routes');

app.use('/user', userRouter);
app.use('/team-member', teamMemberRouter);
app.use('/team', teamRouter);
app.use('/tournament', tournamentRouter);

app.use('/', (req, res) => {
  res.status(200).send('Welcome to Metaco API');
});

app.listen(process.env.PORT, () => console.log(`API Running at PORT: ${process.env.PORT}`));
