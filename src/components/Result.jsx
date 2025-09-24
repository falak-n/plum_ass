// src/components/Result.jsx
export default function Result({ topic, score, total, feedback, onRestart }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="card">
      <h2>Results</h2>
      <div style={{ fontSize: 18, marginBottom: 8 }}>
        {score}/{total} correct ({pct}%)
      </div>
      <div style={{ padding: 12, background: "#f1f5f9", borderRadius: 8, marginBottom: 12 }}>
        {feedback}
      </div>
      <button onClick={onRestart}>Try another topic</button>
      <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
        Topic: {topic}
      </div>
    </div>
  );
}