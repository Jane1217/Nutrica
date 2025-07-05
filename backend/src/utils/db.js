const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

module.exports = { supabase, openai, uuidv4, upload };