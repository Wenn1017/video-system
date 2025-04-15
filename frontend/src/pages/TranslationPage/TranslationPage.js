import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

import "./TranslationPage.css"; // Import the CSS file

const TranslationPage = () => {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("auto"); // Use language codes
  const [translatedLanguage, setTranslatedLanguage] = useState("en"); // Default: English

  const handleTranslate = async () => {
    try {
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          source_language: originalLanguage,
          target_language: translatedLanguage, 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranslatedText(data.translated_text);
      } else {
        setTranslatedText("Error in translation");
      }
    } catch (error) {
      setTranslatedText("Server error");
    }
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("filename");
    localStorage.removeItem("transcription");
    navigate("/");
  };

  return (
    <div className="translation-page">
      <div className="translation-container">
        {/* Sidebar */}
        <div className="translation-sidebar">
          <h2 className="translation-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
            <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcript</li>
            <li onClick={() => navigate("/summary")} style={{ cursor: "pointer" }}>Note</li>
            <li className="translation-active">Translate</li>
            <li onClick={() => navigate("/history")} style={{ cursor: "pointer" }}>History</li>
          </ul>
          <li
            onClick={handleSignOut}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FiLogOut className="signout-icon" />
            <span>Sign Out</span>
          </li>
        </div>

        <div className="translation-main-content">
          <div className="translation-box">
            <div className="translation-language-selection">
              <div>
                <label>Original Language</label>
                <select value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)}>
                  <option value="auto">Detect</option>
                  <option value="en">English</option>
                  <option value="ms">Malay</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="zh-CN">Chinese</option>
                  <option value="ja">Japanese</option>
                  
                </select>
              </div>

              <div>
                <label>Translated Language</label>
                <select value={translatedLanguage} onChange={(e) => setTranslatedLanguage(e.target.value)}>
                  <option value="fr">French</option>
                  <option value="en">English</option>
                  <option value="ms">Malay</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="zh-CN">Chinese</option>
                  <option value="ja">Japanese</option>
                  
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