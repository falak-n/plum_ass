// // src/App.jsx
// import { useState } from "react";
// import TopicSelect from "./components/TopicSelect";
// import Quiz from "./components/Quiz";
// import Result from "./components/Result";
// import { fetchFeedback, fetchQuestions } from "./api/gemini";

// export default function App() {
//   const [screen, setScreen] = useState("topic"); // topic | quiz | result
//   const [topic, setTopic] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState({ score: 0, total: 0, feedback: "" });

//   async function start(topicChosen) {
//     setTopic(topicChosen);
//     setScreen("topic");
//     setError("");
//     setLoading(true);

//     const res = await fetchQuestions(topicChosen, { retries: 2 });
//     setLoading(false);

//     if (!res.ok) {
//       setError(res.error || "Failed to generate questions. Please try again.");
//       return;
//     }
//     setQuestions(res.data.questions);
//     setScreen("quiz");
//   }

//   async function complete({ score, total }) {
//     setLoading(true);
//     const feedback = await fetchFeedback(topic, score, total);
//     setLoading(false);
//     setResult({ score, total, feedback });
//     setScreen("result");
//   }

//   function restart() {
//     setScreen("topic");
//     setTopic("");
//     setQuestions([]);
//     setResult({ score: 0, total: 0, feedback: "" });
//     setError("");
//   }

//   return (
//     <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px", fontFamily: "Inter, system-ui, Arial" }}>
//       <h1 style={{ textAlign: "center" }}>AI‑Assisted Knowledge Quiz</h1>

//       {loading && (
//         <div className="card" style={{ textAlign: "center" }}>
//           <div className="spinner" />
//           <div style={{ marginTop: 8 }}>Generating with Gemini…</div>
//         </div>
//       )}

//       {error && !loading && (
//         <div className="card" style={{ borderColor: "#ef4444", background: "#fef2f2" }}>
//           <div style={{ color: "#b91c1c" }}>{error}</div>
//           <button onClick={() => start(topic || "Wellness")} style={{ marginTop: 8 }}>
//             Retry
//           </button>
//         </div>
//       )}

//       {!loading && !error && screen === "topic" && <TopicSelect onStart={start} />}

//       {!loading && !error && screen === "quiz" && (
//         <Quiz topic={topic} questions={questions} onComplete={complete} />
//       )}

//       {!loading && !error && screen === "result" && (
//         <Result
//           topic={topic}
//           score={result.score}
//           total={result.total}
//           feedback={result.feedback}
//           onRestart={restart}
//         />
//       )}
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import TopicSelect from './components/TopicSelect';
// import Quiz from './components/Quiz';
// import ProgressBar from './components/ProgressBar';
// import Result from './components/Result';
// import './styles.css';

// function App() {
//   const [currentScreen, setCurrentScreen] = useState('topic-select'); // topic-select, quiz, result
//   const [selectedTopic, setSelectedTopic] = useState('');
//   const [apiKey, setApiKey] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [score, setScore] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleTopicSubmit = async (topic, key) => {
//     setSelectedTopic(topic);
//     setApiKey(key);
//     setIsLoading(true);
    
//     try {
//       // Generate questions using Gemini AI
//       const generatedQuestions = await generateQuestions(topic, key);
//       setQuestions(generatedQuestions);
//       setCurrentScreen('quiz');
//     } catch (error) {
//       console.error('Error generating questions:', error);
//       alert('Failed to generate questions. Please check your API key and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const generateQuestions = async (topic, apiKey) => {
//     const { GoogleGenerativeAI } = await import('@google/generative-ai');
//     const genAI = new GoogleGenerativeAI(apiKey);
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = `Generate 5 multiple choice questions about ${topic}. 
//     Return ONLY a valid JSON array with this exact structure:
//     [
//       {
//         "question": "Question text here?",
//         "options": ["Option A", "Option B", "Option C", "Option D"],
//         "correctAnswer": 0
//       }
//     ]
//     Make sure the correctAnswer is the index (0-3) of the correct option. No additional text or formatting.`;

//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const text = response.text();
    
//     try {
//       return JSON.parse(text);
//     } catch (error) {
//       // Fallback if AI doesn't return valid JSON
//       return [
//         {
//           question: `What is the main focus of ${topic}?`,
//           options: [
//             "Primary concept A",
//             "Primary concept B", 
//             "Primary concept C",
//             "Primary concept D"
//           ],
//           correctAnswer: 0
//         }
//       ];
//     }
//   };

//   const handleAnswerSelect = (answerIndex) => {
//     const newAnswers = [...answers];
//     newAnswers[currentQuestionIndex] = answerIndex;
//     setAnswers(newAnswers);

//     if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
//       setScore(score + 1);
//     }
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     } else {
//       setCurrentScreen('result');
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleRestart = () => {
//     setCurrentScreen('topic-select');
//     setSelectedTopic('');
//     setQuestions([]);
//     setCurrentQuestionIndex(0);
//     setAnswers([]);
//     setScore(0);
//   };

//   return (
//     <div className="app">
//       <header className="app-header">
//         <h1>AI-Assisted Knowledge Quiz</h1>
//       </header>

//       <main className="app-main">
//         {isLoading && (
//           <div className="loading">
//             <div className="spinner"></div>
//             <p>Generating quiz questions...</p>
//           </div>
//         )}

//         {!isLoading && currentScreen === 'topic-select' && (
//           <TopicSelect onSubmit={handleTopicSubmit} />
//         )}

//         {!isLoading && currentScreen === 'quiz' && questions.length > 0 && (
//           <>
//             <ProgressBar 
//               current={currentQuestionIndex + 1} 
//               total={questions.length} 
//             />
//             <Quiz
//               question={questions[currentQuestionIndex]}
//               questionNumber={currentQuestionIndex + 1}
//               totalQuestions={questions.length}
//               selectedAnswer={answers[currentQuestionIndex]}
//               onAnswerSelect={handleAnswerSelect}
//               onNext={handleNext}
//               onPrevious={handlePrevious}
//               canGoNext={answers[currentQuestionIndex] !== undefined}
//               canGoPrevious={currentQuestionIndex > 0}
//             />
//           </>
//         )}

//         {!isLoading && currentScreen === 'result' && (
//           <Result
//             score={score}
//             totalQuestions={questions.length}
//             topic={selectedTopic}
//             onRestart={handleRestart}
//           />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;



import React, { useState } from 'react';
import TopicSelect from './components/TopicSelect';
import Quiz from './components/Quiz';
import ProgressBar from './components/ProgressBar';
import Result from './components/Result';
import './styles.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('topic-select'); // topic-select, quiz, result
  const [selectedTopic, setSelectedTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicSubmit = async (topic, key) => {
    setSelectedTopic(topic);
    setApiKey(key);
    setIsLoading(true);
    
    try {
      console.log('Generating questions for topic:', topic);
      const generatedQuestions = await generateQuestions(topic, key);
      console.log('Questions generated successfully:', generatedQuestions);
      setQuestions(generatedQuestions);
      setCurrentScreen('quiz');
    } catch (error) {
      console.error('Error in handleTopicSubmit:', error);
      
      // Always fall back to demo questions if there's any error
      console.log('Using demo questions due to API issues');
      const demoQuestions = getFallbackQuestions(topic);
      setQuestions(demoQuestions);
      setCurrentScreen('quiz');
      
      // Show a friendly notification instead of blocking the user
      setTimeout(() => {
        alert('Using demo questions because the AI service is unavailable. The quiz functionality works the same way!');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async (topic, apiKey) => {
    try {
      // Validate API key format
      if (!apiKey || apiKey.length < 10) {
        throw new Error('Invalid API key format');
      }

      console.log('Starting question generation for topic:', topic);
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use the most commonly available model first
      const modelNames = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro'
      ];
      
      let successfulModel = null;
      let questions = null;
      
      for (const modelName of modelNames) {
        try {
          console.log(`Attempting to use model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const prompt = `Generate exactly 5 multiple choice questions about ${topic}. 
          Return ONLY a valid JSON array with this exact structure (no markdown formatting):
          [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0
            }
          ]
          Make sure the correctAnswer is the index (0-3) of the correct option.`;

          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();
          
          console.log(`Model ${modelName} worked! Raw response:`, text);
          
          // Clean the response text
          let cleanedText = text
            .replace(/```json\n?/gi, '')
            .replace(/```\n?/gi, '')
            .replace(/^[^[{]*/, '')
            .replace(/[^}\]]*$/, '')
            .trim();
          
          console.log('Cleaned response:', cleanedText);
          
          const parsedQuestions = JSON.parse(cleanedText);
          
          // Validate the response
          if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            throw new Error('Invalid response format');
          }
          
          // Validate each question structure
          parsedQuestions.forEach((q, index) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
                typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
              throw new Error(`Invalid question structure at index ${index}`);
            }
          });
          
          questions = parsedQuestions;
          successfulModel = modelName;
          break; // Success! Exit the loop
          
        } catch (error) {
          console.log(`Model ${modelName} failed:`, error.message);
          continue; // Try next model
        }
      }
      
      if (!questions || !successfulModel) {
        console.log('All models failed, using fallback questions');
        return getFallbackQuestions(topic);
      }
      
      console.log(`Successfully generated questions using ${successfulModel}:`, questions);
      return questions;
      
    } catch (error) {
      console.error('Error in generateQuestions:', error);
      console.log('Using fallback questions due to error');
      return getFallbackQuestions(topic);
    }
  };

  const getFallbackQuestions = (topic) => {
    return [
      {
        question: `What is a fundamental concept related to ${topic}?`,
        options: [
          "Basic principle A",
          "Basic principle B", 
          "Basic principle C",
          "Basic principle D"
        ],
        correctAnswer: 0
      },
      {
        question: `Which of the following is most important in ${topic}?`,
        options: [
          "Key element A",
          "Key element B",
          "Key element C", 
          "Key element D"
        ],
        correctAnswer: 1
      },
      {
        question: `How does ${topic} typically impact society?`,
        options: [
          "Through direct influence",
          "Through indirect effects",
          "Through technological advancement",
          "Through cultural change"
        ],
        correctAnswer: 0
      },
      {
        question: `What skill is most valuable when studying ${topic}?`,
        options: [
          "Critical thinking",
          "Memorization",
          "Speed reading",
          "Note-taking"
        ],
        correctAnswer: 0
      },
      {
        question: `Which approach is best for learning more about ${topic}?`,
        options: [
          "Reading multiple sources",
          "Watching videos only",
          "Taking a single course",
          "Asking friends"
        ],
        correctAnswer: 0
      }
    ];
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentScreen('result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentScreen('topic-select');
    setSelectedTopic('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-Assisted Knowledge Quiz</h1>
      </header>

      <main className="app-main">
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating quiz questions...</p>
          </div>
        )}

        {!isLoading && currentScreen === 'topic-select' && (
          <TopicSelect onSubmit={handleTopicSubmit} />
        )}

        {!isLoading && currentScreen === 'quiz' && questions.length > 0 && (
          <>
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={questions.length} 
            />
            <Quiz
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestionIndex]}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoNext={answers[currentQuestionIndex] !== undefined}
              canGoPrevious={currentQuestionIndex > 0}
            />
          </>
        )}

        {!isLoading && currentScreen === 'result' && (
          <Result
            score={score}
            totalQuestions={questions.length}
            topic={selectedTopic}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;