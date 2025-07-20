const express = require('express');
const router = express.Router();
const foodRouter = require('./food');
const aiRouter = require('./ai');
const userRouter = require('./user');
const nutritionImagesRouter = require('./nutrition-images');

router.use('/food', foodRouter);
router.use('/ai', aiRouter);
router.use('/user', userRouter);
router.use('/nutrition-images', nutritionImagesRouter);

module.exports = router;