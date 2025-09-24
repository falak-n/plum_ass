import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
  let lastError = null;
  const userPrompt = `
Topic: ${topic}

Generate 5 MCQs about the topic above.
${SYSTEM_CONTRACT}
Return JSON only.
`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await model.generateContent(userPrompt);
      const text = res.response.text().trim();

      // Strip code fences if the model added them
      const cleaned = text.replace(/^```json|^```|```$/gim, "").trim();

      const data = tryParseJson(cleaned);
      if (!data) throw new Error("Model did not return valid JSON");

      const validationError = validatePayload(data);
      if (validationError) throw new Error("Validation failed: " + validationError);

      return { ok: true, data };
    } catch (err) {
      lastError = err;
      // Strengthen the constraint for the next attempt
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 400 + attempt * 600));
      }
    }
  }

  return { ok: false, error: lastError?.message || "Unknown error" };
}

export async function fetchFeedback(topic, score, total) {
  const prompt = `
You must return a single short sentence. No JSON, no extra text.

The user completed a ${topic} quiz with score ${score}/${total}.
Compose a supportive, specific feedback sentence referencing strengths and a suggestion.
Max 25 words.
`;
  const res = await model.generateContent(prompt);
  return res.response.text().trim().replace(/^"|"$/g, "");
}