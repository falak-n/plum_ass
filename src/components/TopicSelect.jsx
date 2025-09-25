
// import { useState } from "react";

// const DEFAULT_TOPICS = [
//   "Wellness",
//   "Tech Trends",
//   "Climate Change",
//   "Financial Literacy",
//   "Nutrition Basics",
// ];

// export default function TopicSelect({ onStart }) {
//   const [topic, setTopic] = useState(DEFAULT_TOPICS[0]);

//   return (
//     <div className="card">
//       <h2>Select a topic</h2>
//       <select value={topic} onChange={e => setTopic(e.target.value)}>
//         {DEFAULT_TOPICS.map(t => (
//           <option key={t} value={t}>{t}</option>
//         ))}
//       </select>
//       <button onClick={() => onStart(topic)} style={{ marginTop: 12 }}>
//         Start Quiz
//       </button>
//     </div>
//   );
// }

import React, { useState } from 'react';

const TopicSelect = ({ onSubmit }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [apiKey, setApiKey] = useState('');

  const predefinedTopics = [
    'Wellness & Health',
    'Technology Trends',
    'Science & Nature',
    'History & Culture',
    'Business & Economics',
    'Arts & Literature',
    'Sports & Recreation',
    'Custom Topic'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      alert('Please enter your Google Gemini API key');
      return;
    }

    const topic = selectedTopic === 'Custom Topic' ? customTopic : selectedTopic;
    
    if (!topic.trim()) {
      alert('Please select a topic or enter a custom topic');
      return;
    }

    onSubmit(topic, apiKey);
  };

  return (
    <div className="topic-select">
      <div className="topic-select-card">
        <h2>Choose Your Quiz Topic</h2>
        <p>Select a topic below to generate AI-powered quiz questions</p>
        
        <form onSubmit={handleSubmit} className="topic-form">
          <div className="form-group">
            <label htmlFor="api-key">Google Gemini API Key:</label>
            <input
              type="password"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="api-key-input"
              required
            />
            <small className="help-text">
              Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </small>
          </div>

          <div className="form-group">
            <label>Select Topic:</label>
            <div className="topic-grid">
              {predefinedTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`topic-button ${selectedTopic === topic ? 'selected' : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {selectedTopic === 'Custom Topic' && (
            <div className="form-group">
              <label htmlFor="custom-topic">Enter Custom Topic:</label>
              <input
                type="text"
                id="custom-topic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Machine Learning, Ancient Rome, etc."
                className="custom-topic-input"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="start-quiz-button"
            disabled={!selectedTopic || !apiKey}
          >
            Generate Quiz Questions
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopicSelect;