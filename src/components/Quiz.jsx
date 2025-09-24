// src/components/Quiz.jsx
import { useMemo, useState } from "react";
import ProgressBar from "./ProgressBar";

export default function Quiz({ topic, questions, onComplete }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(total).fill(null));
  const q = questions[idx];

  const score = useMemo(() => {
    return answers.reduce((sum, a, i) => {
      if (a === null) return sum;
      return sum + (questions[i].answerIndex === a ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  function choose(optionIndex) {
    const next = answers.slice();
    next[idx] = optionIndex;
    setAnswers(next);
  }

  function next() {
    if (idx < total - 1) setIdx(idx + 1);
  }

  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }

  function finish() {
    const unanswered = answers.some(a => a === null);
    if (unanswered && idx !== total - 1) {
      setIdx(answers.findIndex(a => a === null));
      return;
    }
    onComplete({ answers, score, total });
  }

  return (
    <div className="card">
      <h2>{topic} Quiz</h2>
      <ProgressBar current={idx} total={total} />

      <div style={{ margin: "8px 0" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Q{idx + 1}. {q.question}
        </div>
        {q.options.map((opt, i) => {
          const selected = answers[idx] === i;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              style={{
                display: "block",
                textAlign: "left",
                width: "100%",
                marginBottom: 8,
                padding: "10px 12px",
                borderRadius: 8,
                border: selected ? "2px solid #4f46e5" : "1px solid #ddd",
                background: selected ? "#eef2ff" : "white",
                cursor: "pointer",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button onClick={prev} disabled={idx === 0}>Previous</button>
        {idx < total - 1 ? (
          <button onClick={next}>Next</button>
        ) : (
          <button onClick={finish}>Submit</button>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 12 }}>
        Score so far: {score}/{total}
      </div>
    </div>
  );
}