const express = require('express');
const router = express.Router();
const foodRouter = require('./food');

router.use('/', foodRouter);

module.exports = router; 