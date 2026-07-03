import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AQ.Ab8RN6KgYDsjKGX177u4hj6TGvktIIX2pVPRBckw7Qmjh-JyBQ");
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}
run();
