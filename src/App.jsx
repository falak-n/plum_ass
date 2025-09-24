// src/App.jsx
import { useState } from "react";
import TopicSelect from "./components/TopicSelect";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { fetchFeedback, fetchQuestions } from "./api/gemini";

export default function App() {
  const [screen, setScreen] = useState("topic"); // topic | quiz | result
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({ score: 0, total: 0, feedback: "" });

  async function start(topicChosen) {
    setTopic(topicChosen);
    setScreen("topic");
    setError("");
    setLoading(true);

    const res = await fetchQuestions(topicChosen, { retries: 2 });
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Failed to generate questions. Please try again.");
      return;
    }
    setQuestions(res.data.questions);
    setScreen("quiz");
  }

  async function complete({ score, total }) {
    setLoading(true);
    const feedback = await fetchFeedback(topic, score, total);
    setLoading(false);
    setResult({ score, total, feedback });
    setScreen("result");
  }

  function restart() {
    setScreen("topic");
    setTopic("");
    setQuestions([]);
    setResult({ score: 0, total: 0, feedback: "" });
    setError("");
  }

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px", fontFamily: "Inter, system-ui, Arial" }}>
      <h1 style={{ textAlign: "center" }}>AI‑Assisted Knowledge Quiz</h1>

      {loading && (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="spinner" />
          <div style={{ marginTop: 8 }}>Generating with Gemini…</div>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ borderColor: "#ef4444", background: "#fef2f2" }}>
          <div style={{ color: "#b91c1c" }}>{error}</div>
          <button onClick={() => start(topic || "Wellness")} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && screen === "topic" && <TopicSelect onStart={start} />}

      {!loading && !error && screen === "quiz" && (
        <Quiz topic={topic} questions={questions} onComplete={complete} />
      )}

      {!loading && !error && screen === "result" && (
        <Result
          topic={topic}
          score={result.score}
          total={result.total}
          feedback={result.feedback}
          onRestart={restart}
        />
      )}
    </div>
  );
}