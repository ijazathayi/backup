import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize the Gemini API client
if (!process.env.GEMINI_API_KEY) {
  console.warn("No Gemini API key provided. Set GEMINI_API_KEY in server/.env");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Using gemini-flash-latest as it is the fastest model available and automatically maps to the latest
const MODEL_NAME = "gemini-flash-latest"; 

app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid request: message required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set in the server/.env file' });
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: `You are an advanced futuristic AI voice assistant on the user's local Windows computer. 
You can help the user by taking actions on their PC.
To take actions on the user's PC, you must output a JSON block wrapped in \`\`\`json. 
Supported actions:
1. CREATE_FILE: { "action": "create_file", "path": "filename", "content": "file content" }
2. READ_DIR: { "action": "read_dir", "path": "directory path" } 
3. MESSAGE: { "action": "message", "text": "message to display on screen" }

Keep your spoken responses concise and natural. If you output a JSON action block, DO NOT speak the JSON out loud. Only speak the conversational text before or after the JSON.`
    });

    const result = await model.generateContent(message);
    const response = result.response;
    let text = response.text();
    
    // Clean up markdown since it will be spoken
    text = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#/g, "");

    return res.json({ reply: text });
    
  } catch (err) {
    console.error("CAUGHT ERROR:", err);
    const status = err?.status || err?.statusCode || 500;
    const errMessage = err?.message || "AI request failed";
    res.status(status).json({ error: errMessage });
  }
});

app.listen(5000, () => {
  console.log("AI Server running on port 5000 powered by Google Gemini!");
});