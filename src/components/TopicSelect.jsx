// src/components/TopicSelect.jsx
import { useState } from "react";

const DEFAULT_TOPICS = [
  "Wellness",
  "Tech Trends",
  "Climate Change",
  "Financial Literacy",
  "Nutrition Basics",
];

export default function TopicSelect({ onStart }) {
  const [topic, setTopic] = useState(DEFAULT_TOPICS[0]);

  return (
    <div className="card">
      <h2>Select a topic</h2>
      <select value={topic} onChange={e => setTopic(e.target.value)}>
        {DEFAULT_TOPICS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button onClick={() => onStart(topic)} style={{ marginTop: 12 }}>
        Start Quiz
      </button>
    </div>
  );
}