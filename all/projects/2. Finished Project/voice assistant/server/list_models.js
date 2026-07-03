import { GoogleGenerativeAI } from "@google/generative-ai";
async function list() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6KgYDsjKGX177u4hj6TGvktIIX2pVPRBckw7Qmjh-JyBQ");
  const json = await res.json();
  const models = json.models.map(m => m.name);
  console.log(models);
}
list();
