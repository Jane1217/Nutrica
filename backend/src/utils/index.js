/**
 * 后端工具函数统一导出
 */

const validation = require('./validation');
const response = require('./response');
const logger = require('./logger');

module.exports = {
  ...validation,
  ...response,
  ...logger
}; 