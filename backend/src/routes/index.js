const express = require('express');
const router = express.Router();
const uploadRouter = require('./upload');
const summaryRouter = require('./summary');
const mealsRouter = require('./meals');
const foodRouter = require('./food');

console.log(`[${new Date().toISOString()}] Mounting /upload route`);
router.use('/upload', uploadRouter);
console.log(`[${new Date().toISOString()}] Mounting /summary route`);
router.use('/summary', summaryRouter);
console.log(`[${new Date().toISOString()}] Mounting /meals route`);
router.use('/meals', mealsRouter);
router.use('/food', foodRouter);

module.exports = router;