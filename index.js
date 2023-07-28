import serverless from 'serverless-http'
import express from 'express';
import { createWorker } from 'tesseract.js';
import {Configuration, OpenAIApi} from 'openai'
import 'dotenv/config'

const app = express();


const worker = await createWorker({
  logger: m => console.log(m)
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/image", async (req, res, next) => {
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();

  return res.status(200).json({
    message: text,
  });
});

app.get("/answer", async (req, res, next) => {
  const chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello world" }],
});
  return res.status(200).json({
      chat_completion
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler =  serverless(app);
