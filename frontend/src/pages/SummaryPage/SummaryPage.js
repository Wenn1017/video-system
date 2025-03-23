import React, { useEffect, useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import "./SummaryPage.css"; // Import the CSS file

const SummaryPage = () => {
  const printRef = useRef(null);
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_summary")
      .then((response) => response.json())
      .then((data) => {
        setSummary(data.summary_huggingface);
        setKeywords(data.keywords_tfidf);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching summary:", error);
        setLoading(false);
      });
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // // Sample summary data (Replace this with actual summarized content)
  // const summary = [
  //   "Steve Jobs shares his journey of dropping out of college and how following his curiosity led him to innovations.",
  //   "He emphasizes the importance of connecting the dots in life and trusting the process even when the path is unclear.",
  //   "The speech highlights the significance of loving what you do and not settling until you find your passion.",
  // ];

  return (
    <div className="summary-page">
      <div className="summary-container">
        {/* Sidebar */}
        <div className="summary-sidebar">
          <h2 className="summary-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
            <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcript</li>
            <li className="summary-active">Note</li>
            <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translate</li>
            <li onClick={() => navigate("/history")} style={{ cursor: "pointer" }}>History</li>
          </ul>
        </div>
        
        {/* Main Content */}
        <div className="summary-main-content">
          <div className="summary-header">
            <h1>Steve Jobs Speech</h1>
            <button onClick={handlePrint} className="print-btn">Print</button>
          </div>

          <div className="summary-content" ref={printRef}>
            <h2>Summary</h2>
            {loading ? (
              <p>Loading summary...</p>
            ) : (
              <p className="summary-text">{summary}</p>
            )}

            <h2>Keywords</h2>
            {loading ? (
              <p>Loading keywords...</p>
            ) : (
              <ul>
                {keywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;