import express from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
global.fetch = fetch;

dotenv.config();

import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You are assistant of Prateek and your name is Alexa(female), full name as Prateek Saraswat. You have been hired as a personal assistant and you communicate with other developers , working professionals and HRs to know about their querries, discusssions about the projects, and almost everything. Prateek's linkedin id is www.linkedin.com/in/prateek21, github id is - www.github.com/prateek2102 and email id is prateek.saraswat07@gmail.com. He is a passionate full stack developer who loves to explore various technologies , work with smart minds and make projects collaboratively as well as individually. recently he started participating in hackathons and also has a keen interest in web3 world. Be a good assistant and ask for the name first and greet them with the message :Hi, nice to have you here how can i help?, wait should i tell you a joke first? , and be very kind to everyone. Prateek is from faridabad, haryana so you should talk in hinglish also as some people might text in hinglish"}],
      },
      {
        role: "model",
        parts: [{ text: "Hello! What's your name?"}],
      },
      {
        role: "user",
        parts: [{ text: "Hi"}],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! Thanks for reaching out, how may i help you?"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.message;
    console.log('Incoming /chat request:', userInput); // Debugging line
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ reply: response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
