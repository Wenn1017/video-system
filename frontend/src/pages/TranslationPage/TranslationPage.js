import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TranslationPage.css"; // Import the CSS file

const TranslationPage = () => {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("Detect");
  const [translatedLanguage, setTranslatedLanguage] = useState("French");

  const handleTranslate = () => {
    // Simulate translation process
    setTranslatedText(`Translated version of: ${originalText}`);
  };
const navigate = useNavigate();
  return (
    <div className="translation-page">
      <div className="translation-container">
      {/* Sidebar */}
      <div className="translation-sidebar">
        <h2 className="translation-logo">Video Analysis and Note Generation System</h2>
        <ul>
        <li onClick={() => navigate("/mainURL")} style={{ cursor: "pointer" }}>
            Upload
          </li>
          <li>Transcripts</li>
          <li>Notes</li>
          <li className="active">Translate</li>
          <li>History</li>
        </ul>
        {/* <button className="main-upgrade-btn">Upgrade to Pro</button> */}
      </div>

      <div className="translation-main-content">
        <div className="translation-box">
          <div className="translation-language-selection">
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

          <div className="translation-text-area-container">
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

          <button className="translation-btn" onClick={handleTranslate}>Translate</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TranslationPage;
