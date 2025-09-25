import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

// Validate API key on module load
if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY not found in environment variables");
  console.log("Make sure you have a .env file with: VITE_GEMINI_API_KEY=your_key_here");
} else {
  console.log("✅ API Key loaded successfully");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

const SYSTEM_CONTRACT = `
You are generating strict JSON only. No markdown fences, no commentary.

Return EXACTLY this schema, nothing else:
{
  "topic": "string",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string","string","string","string"],
      "answerIndex": 0
    }
  ]
}

Rules:
- Create exactly 5 MCQs.
- "options" length must be 4.
- "answerIndex" must be an integer 0..3.
- Use concise, unambiguous wording.
- Avoid duplicates and trick questions.
`;

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Payload not an object";
  if (typeof payload.topic !== "string") return "topic must be string";
  if (!Array.isArray(payload.questions) || payload.questions.length !== 5)
    return "questions must be an array of length 5";
  for (const [i, q] of payload.questions.entries()) {
    if (!q || typeof q !== "object") return `q[${i}] not object`;
    if (typeof q.id !== "string") return `q[${i}].id must be string`;
    if (typeof q.question !== "string") return `q[${i}].question must be string`;
    if (!Array.isArray(q.options) || q.options.length !== 4)
      return `q[${i}].options must be array length 4`;
    if (!q.options.every(o => typeof o === "string"))
      return `q[${i}].options must be strings`;
    if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3)
      return `q[${i}].answerIndex must be 0..3`;
  }
  return null;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function fetchQuestions(topic, { retries = 2 } = {}) {
  // Check API key before making requests
  if (!API_KEY) {
    return { 
      ok: false, 
      error: "API key not configured. Please check your .env file and add VITE_GEMINI_API_KEY=your_key_here" 
    };
  }

  if (!model) {
    return { 
      ok: false, 
      error: "Failed to initialize Gemini model. Please check your API key." 
    };
  }

  let lastError = null;
  const userPrompt = `
Topic: ${topic}

Generate 5 MCQs about the topic above.
${SYSTEM_CONTRACT}
Return JSON only.
`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retries + 1} for topic: ${topic}`);
      
      const res = await model.generateContent(userPrompt);
      const text = res.response.text().trim();

      // Strip code fences if the model added them
      const cleaned = text.replace(/^```json|^```|```$/gim, "").trim();

      const data = tryParseJson(cleaned);
      if (!data) throw new Error("Model did not return valid JSON");

      const validationError = validatePayload(data);
      if (validationError) throw new Error("Validation failed: " + validationError);

      console.log("✅ Successfully generated questions for:", topic);
      return { ok: true, data };
      
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt + 1} failed:`, err.message);
      
      // Check for specific API errors
      if (err.message.includes("API key not valid") || err.message.includes("403")) {
        return { 
          ok: false, 
          error: "Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file." 
        };
      }
      
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        return { 
          ok: false, 
          error: "Network error. Please check your internet connection and try again." 
        };
      }
      
      // Wait before retrying
      if (attempt < retries) {
        console.log(`Retrying in ${(400 + attempt * 600)}ms...`);
        await new Promise(r => setTimeout(r, 400 + attempt * 600));
      }
    }
  }

  return { ok: false, error: lastError?.message || "Unknown error occurred while generating questions" };
}

export async function fetchFeedback(topic, score, total) {
  if (!API_KEY) {
    return `Great job completing the ${topic} quiz! You scored ${score}/${total}. Keep practicing to improve further.`;
  }

  if (!model) {
    return `Nice work on your ${topic} quiz! You scored ${score}/${total}. Keep practicing!`;
  }

  try {
    const prompt = `
You must return a single short sentence. No JSON, no extra text.

The user completed a ${topic} quiz with score ${score}/${total}.
Compose a supportive, specific feedback sentence referencing strengths and a suggestion.
Max 25 words.
`;
    const res = await model.generateContent(prompt);
    return res.response.text().trim().replace(/^"|"$/g, "");
  } catch (error) {
    console.error("Feedback generation failed:", error.message);
    return `Nice work on your ${topic} quiz! You scored ${score}/${total}. Keep practicing!`;
  }
}
