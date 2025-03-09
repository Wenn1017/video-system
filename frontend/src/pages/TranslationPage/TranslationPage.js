import React, { useState } from "react";
import "./TranslationPage.css"; // Import the CSS file

const TranslatePage = () => {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("Detect");
  const [translatedLanguage, setTranslatedLanguage] = useState("French");

  const handleTranslate = () => {
    // Simulate translation process
    setTranslatedText(`Translated version of: ${originalText}`);
  };

  return (
    <div className="translate-container">
      <div className="sidebar">
        <h2 className="logo">cockatoo</h2>
        <ul>
          <li>Upload</li>
          <li>Your transcripts</li>
          <li className="active">Translate</li>
        </ul>
        <button className="upgrade-btn">Upgrade to Pro</button>
      </div>

      <div className="main-content">
        <div className="translate-box">
          <div className="language-selection">
            <div>
              <label>Original Language</label>
              <select value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)}>
                <option>Detect</option>
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>

            <div>
              <label>Translated Language</label>
              <select value={translatedLanguage} onChange={(e) => setTranslatedLanguage(e.target.value)}>
                <option>French</option>
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>

          <div className="text-area-container">
            <textarea
              placeholder="Enter text to translate..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
            />
            <textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
            />
          </div>

          <button className="translate-btn" onClick={handleTranslate}>Translate</button>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
