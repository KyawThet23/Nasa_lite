const express = require('express');

const {
  getallPlanets
} = require('./planets.controller')

const planetRouter = express.Router();

planetRouter.get('/', getallPlanets);

module.exports = planetRouter;