const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const databaseService = require('../services/databaseService');
const openaiService = require('../services/openaiService');

// 配置 multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log(`[${new Date().toISOString()}] Processing /upload request: ${req.file?.originalname}`);
  if (!req.file) {
    console.error('No file received');
    return res.status(400).json({ error: 'No file received' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    console.log(`[${new Date().toISOString()}] 调用 OpenAI API...`);
    const response = await openaiService.analyzeImage(base64Image);

    const result = response.choices[0].message.content;
    console.log(`[${new Date().toISOString()}] OpenAI 响应: ${result}`);
    let parsedResult;
    try {
      const cleanResult = result
        .replace(/```json\s*|\s*```/g, '')
        .replace(/^\s*|\s*$/g, '')
        .replace(/[\r\n]+/g, '')
        .replace(/[-\u001F\u007F-\u009F]/g, '')
        .trim();
      console.log(`[${new Date().toISOString()}] 原始结果: ${result}`);
      console.log(`[${new Date().toISOString()}] 清理后结果: ${cleanResult}`);
      parsedResult = JSON.parse(cleanResult);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] JSON 解析错误: ${e.message}, 清理后结果: ${cleanResult}`);
      parsedResult = { error: `Failed to parse response: ${e.message}` };
    }

    await databaseService.insertMeal(
      parsedResult,
      new Date().toISOString(),
      uuidv4()
    );

    res.json(parsedResult);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] OpenAI API 错误: ${error.message}`);
    res.status(500).json({ error: 'OpenAI API error', details: error.message });
  }
});

module.exports = router;