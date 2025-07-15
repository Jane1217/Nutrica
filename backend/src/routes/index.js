const express = require('express');
const router = express.Router();
const foodRouter = require('./food');
const aiRouter = require('./ai');

router.use('/food', foodRouter);
router.use('/ai', aiRouter);

module.exports = router;