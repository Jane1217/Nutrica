const express = require('express');
const router = express.Router();
const collectionRouter = require('./collection'); // collection相关路由
const foodSaveRouter = require('./foodSave'); // food保存路由
const aiParseRouter = require('./aiParse'); // AI解析路由
const userRouter = require('./user');

router.use('/collection', collectionRouter); // collection相关路由
router.use('/food', foodSaveRouter); // food保存路由
router.use('/ai/parse', aiParseRouter); // AI解析路由
router.use('/user', userRouter);

module.exports = router;