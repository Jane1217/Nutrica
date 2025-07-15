const express = require('express');
const router = express.Router();
const parseRouter = require('./parse');

router.use('/parse', parseRouter);
 
module.exports = router; 