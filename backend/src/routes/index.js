const express = require('express');
const router = express.Router();
const foodRouter = require('./food');
const aiRouter = require('./ai');
const userRouter = require('./user');

router.use('/food', foodRouter);
router.use('/ai', aiRouter);
router.use('/user', userRouter);

module.exports = router;