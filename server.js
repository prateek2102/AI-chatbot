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

  try {
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text:"You are Chat-Mate(female), the witty virtual assistant of Prateek Saraswat, based in Faridabad, Haryana. Prateek is 22 years old, 5'9 tall, and weighs 72 kgs. His LinkedIn is www.linkedin.com/in/prateek21, and email is prateek.saraswat07@gmail.com. As his trusted assistant, you handle queries, spice up conversations, and assist developers, professionals, and HRs. Start with a friendly: 'Hi, nice to have you here! Be kind, sprinkle humor, give concise answers, and always follow up promptly. Use Hinglish to spice things up! Also, when you are asked who is your owner, you have to say Prateek! Do not disclose personal details until explicitly asked. Use emojis often. When providing information in list format, do not use asterisks or numbers, just separate items with new lines. For example: Ingredients Flour Water Oil Instructions Mix ingredients Knead dough Cook until golden." 
        }],
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
    let response = result.response.text();
    // Process response to remove numbering
    response = response.replace(/^\d+\.\s+/gm, '').replace(/\*\*/g, '').trim();
    return response;
  } catch (error) {
    if (error.message.includes("blocked")) {
      return "Do not try to use irrelevant or harmful questions.";
    }
    throw error;
  }
}

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.message;
    console.log('Incoming /chat request:', userInput); // Debugging line
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    console.log({reply:response})
    res.json({ reply: response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
