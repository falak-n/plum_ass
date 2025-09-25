// // src/components/Result.jsx
// export default function Result({ topic, score, total, feedback, onRestart }) {
//   const pct = Math.round((score / total) * 100);
//   return (
//     <div className="card">
//       <h2>Results</h2>
//       <div style={{ fontSize: 18, marginBottom: 8 }}>
//         {score}/{total} correct ({pct}%)
//       </div>
//       <div style={{ padding: 12, background: "#f1f5f9", borderRadius: 8, marginBottom: 12 }}>
//         {feedback}
//       </div>
//       <button onClick={onRestart}>Try another topic</button>
//       <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
//         Topic: {topic}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';

const Result = ({ score, totalQuestions, topic, onRestart }) => {
  const [feedback, setFeedback] = useState('');
  const percentage = Math.round((score / totalQuestions) * 100);

  useEffect(() => {
    generateFeedback();
  }, [score, totalQuestions]);

  const generateFeedback = () => {
    let message = '';
    
    if (percentage >= 90) {
      message = "Outstanding! You have excellent knowledge in this area.";
    } else if (percentage >= 80) {
      message = "Great job! You have a strong understanding of the topic.";
    } else if (percentage >= 70) {
      message = "Good work! You have a solid grasp of the basics.";
    } else if (percentage >= 60) {
      message = "Not bad! There's room for improvement, but you're on the right track.";
    } else {
      message = "Keep studying! This topic might benefit from more review.";
    }
    
    setFeedback(message);
  };

  const getScoreColor = () => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    return 'needs-improvement';
  };

  return (
    <div className="result">
      <div className="result-card">
        <div className="result-header">
          <h2>Quiz Complete!</h2>
          <div className="topic-badge">Topic: {topic}</div>
        </div>

        <div className="score-section">
          <div className={`score-circle ${getScoreColor()}`}>
            <div className="score-number">{percentage}%</div>
            <div className="score-fraction">{score}/{totalQuestions}</div>
          </div>
        </div>

        <div className="feedback-section">
          <h3>Your Performance</h3>
          <p className="feedback-text">{feedback}</p>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-label">Questions Attempted:</span>
            <span className="stat-value">{totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correct Answers:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">{percentage}%</span>
          </div>
        </div>

        <div className="action-section">
          <button className="restart-button" onClick={onRestart}>
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;