const express = require('express');
const router = express.Router();
const collectionRouter = require('./food'); // 原来的food.js包含collection相关路由
const foodSaveRouter = require('./food/index'); // food保存路由
const aiRouter = require('./ai');
const userRouter = require('./user');

router.use('/collection', collectionRouter); // collection相关路由
router.use('/food', foodSaveRouter); // food保存路由
router.use('/ai', aiRouter);
router.use('/user', userRouter);

module.exports = router;