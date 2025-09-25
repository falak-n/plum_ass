// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const MODEL_NAME = "gemini-2.5-flash";

// // Validate API key on module load
// if (!API_KEY) {
//   console.error("❌ VITE_GEMINI_API_KEY not found in environment variables");
//   console.log("Make sure you have a .env file with: VITE_GEMINI_API_KEY=your_key_here");
// } else {
//   console.log("✅ API Key loaded successfully");
// }

// const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
// const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

// const SYSTEM_CONTRACT = `
// You are generating strict JSON only. No markdown fences, no commentary.

// Return EXACTLY this schema, nothing else:
// {
//   "topic": "string",
//   "questions": [
//     {
//       "id": "string",
//       "question": "string",
//       "options": ["string","string","string","string"],
//       "answerIndex": 0
//     }
//   ]
// }

// Rules:
// - Create exactly 5 MCQs.
// - "options" length must be 4.
// - "answerIndex" must be an integer 0..3.
// - Use concise, unambiguous wording.
// - Avoid duplicates and trick questions.
// `;

// function validatePayload(payload) {
//   if (!payload || typeof payload !== "object") return "Payload not an object";
//   if (typeof payload.topic !== "string") return "topic must be string";
//   if (!Array.isArray(payload.questions) || payload.questions.length !== 5)
//     return "questions must be an array of length 5";
//   for (const [i, q] of payload.questions.entries()) {
//     if (!q || typeof q !== "object") return `q[${i}] not object`;
//     if (typeof q.id !== "string") return `q[${i}].id must be string`;
//     if (typeof q.question !== "string") return `q[${i}].question must be string`;
//     if (!Array.isArray(q.options) || q.options.length !== 4)
//       return `q[${i}].options must be array length 4`;
//     if (!q.options.every(o => typeof o === "string"))
//       return `q[${i}].options must be strings`;
//     if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3)
//       return `q[${i}].answerIndex must be 0..3`;
//   }
//   return null;
// }

// function tryParseJson(text) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// }

// export async function fetchQuestions(topic, { retries = 2 } = {}) {
//   // Check API key before making requests
//   if (!API_KEY) {
//     return { 
//       ok: false, 
//       error: "API key not configured. Please check your .env file and add VITE_GEMINI_API_KEY=your_key_here" 
//     };
//   }

//   if (!model) {
//     return { 
//       ok: false, 
//       error: "Failed to initialize Gemini model. Please check your API key." 
//     };
//   }

//   let lastError = null;
//   const userPrompt = `
// Topic: ${topic}

// Generate 5 MCQs about the topic above.
// ${SYSTEM_CONTRACT}
// Return JSON only.
// `;

//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       console.log(`Attempt ${attempt + 1}/${retries + 1} for topic: ${topic}`);
      
//       const res = await model.generateContent(userPrompt);
//       const text = res.response.text().trim();

//       // Strip code fences if the model added them
//       const cleaned = text.replace(/^```json|^```|```$/gim, "").trim();

//       const data = tryParseJson(cleaned);
//       if (!data) throw new Error("Model did not return valid JSON");

//       const validationError = validatePayload(data);
//       if (validationError) throw new Error("Validation failed: " + validationError);

//       console.log("✅ Successfully generated questions for:", topic);
//       return { ok: true, data };
      
//     } catch (err) {
//       lastError = err;
//       console.error(`Attempt ${attempt + 1} failed:`, err.message);
      
//       // Check for specific API errors
//       if (err.message.includes("API key not valid") || err.message.includes("403")) {
//         return { 
//           ok: false, 
//           error: "Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file." 
//         };
//       }
      
//       if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
//         return { 
//           ok: false, 
//           error: "Network error. Please check your internet connection and try again." 
//         };
//       }
      
//       // Wait before retrying
//       if (attempt < retries) {
//         console.log(`Retrying in ${(400 + attempt * 600)}ms...`);
//         await new Promise(r => setTimeout(r, 400 + attempt * 600));
//       }
//     }
//   }

//   return { ok: false, error: lastError?.message || "Unknown error occurred while generating questions" };
// }

// export async function fetchFeedback(topic, score, total) {
//   if (!API_KEY) {
//     return `Great job completing the ${topic} quiz! You scored ${score}/${total}. Keep practicing to improve further.`;
//   }

//   if (!model) {
//     return `Nice work on your ${topic} quiz! You scored ${score}/${total}. Keep practicing!`;
//   }

//   try {
//     const prompt = `
// You must return a single short sentence. No JSON, no extra text.

// The user completed a ${topic} quiz with score ${score}/${total}.
// Compose a supportive, specific feedback sentence referencing strengths and a suggestion.
// Max 25 words.
// `;
//     const res = await model.generateContent(prompt);
//     return res.response.text().trim().replace(/^"|"$/g, "");
//   } catch (error) {
//     console.error("Feedback generation failed:", error.message);
//     return `Nice work on your ${topic} quiz! You scored ${score}/${total}. Keep practicing!`;
//   }
// }


import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
  }this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  async generateQuestions(topic, count = 5) {
    const prompt = `Generate ${count} multiple choice questions about ${topic}. 
    Each question should be challenging but fair, with 4 options where only one is correct.
    
    Return ONLY a valid JSON array with this exact structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of why this answer is correct"
      }
    ]
    
    Requirements:
    - Questions should be educational and factual
    - Avoid overly obscure or trick questions
    - Make sure the correctAnswer is the index (0-3) of the correct option
    - Include a brief explanation for each answer
    - Cover different aspects of the topic
    - No additional text or formatting outside the JSON array`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Clean the response text
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const questions = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format');
      }
      
      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
      });
      
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Fallback questions if AI fails
      return this.getFallbackQuestions(topic);
    }
  }

  getFallbackQuestions(topic) {
    return [
      {
        question: `What is a fundamental concept related to ${topic}?`,
        options: [
          "Basic principle A",
          "Basic principle B", 
          "Basic principle C",
          "Basic principle D"
        ],
        correctAnswer: 0,
        explanation: "This is a fallback question generated when AI is unavailable."
      },
      {
        question: `Which of the following is most important in ${topic}?`,
        options: [
          "Key element A",
          "Key element B",
          "Key element C", 
          "Key element D"
        ],
        correctAnswer: 1,
        explanation: "This represents an important aspect of the topic."
      },
      {
        question: `How does ${topic} typically impact society?`,
        options: [
          "Through direct influence",
          "Through indirect effects",
          "Through technological advancement",
          "Through cultural change"
        ],
        correctAnswer: 0,
        explanation: "Most topics have some form of direct societal impact."
      },
      {
        question: `What skill is most valuable when studying ${topic}?`,
        options: [
          "Critical thinking",
          "Memorization",
          "Speed reading",
          "Note-taking"
        ],
        correctAnswer: 0,
        explanation: "Critical thinking is essential for understanding any complex topic."
      },
      {
        question: `Which approach is best for learning more about ${topic}?`,
        options: [
          "Reading multiple sources",
          "Watching videos only",
          "Taking a single course",
          "Asking friends"
        ],
        correctAnswer: 0,
        explanation: "Multiple sources provide a well-rounded understanding."
      }
    ];
  }

  async generateFeedback(topic, score, totalQuestions) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    const prompt = `Generate personalized feedback for a student who scored ${score} out of ${totalQuestions} questions (${percentage}%) on a quiz about ${topic}.
    
    The feedback should be:
    - Encouraging and constructive
    - Specific to the topic
    - Include suggestions for improvement if needed
    - Be 2-3 sentences long
    - Professional but friendly tone
    
    Return only the feedback text, no additional formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating feedback:', error);
      return this.getFallbackFeedback(percentage);
    }
  }

  getFallbackFeedback(percentage) {
    if (percentage >= 90) {
      return "Outstanding performance! You have excellent knowledge in this area and should be proud of your achievement.";
    } else if (percentage >= 80) {
      return "Great job! You have a strong understanding of the topic with just a few areas to refine.";
    } else if (percentage >= 70) {
      return "Good work! You have a solid foundation but could benefit from reviewing some key concepts.";
    } else if (percentage >= 60) {
      return "You're on the right track! Consider studying the fundamentals more thoroughly to improve your understanding.";
    } else {
      return "This is a great learning opportunity! Focus on the basics and don't hesitate to seek additional resources.";
    }
  }
}

export default GeminiService;
